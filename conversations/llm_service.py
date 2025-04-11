import uuid
import json
from datetime import datetime
import groq
from django.conf import settings
from .models import Conversation, Message, Agent

def get_llm_client():
    """Get the appropriate LLM client based on settings."""
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == 'groq':
        return groq.Client(api_key=settings.GROQ_API_KEY)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

def format_conversation_history(messages, agent_id=None):
    """Format conversation history for the LLM prompt."""
    formatted_messages = []
    
    for msg in messages:
        if agent_id and msg.agent.id == agent_id:
            sender = "You"
        else:
            sender = msg.agent.name
        
        formatted_messages.append(f"{sender}: {msg.content}")
    
    return "\n\n".join(formatted_messages)

def generate_agent_response(agent, conversation, messages):
    """
    Generate a response from an agent in a conversation.
    Note: For concurrent conversations, use generate_agent_response_async instead.
    """
    client = get_llm_client()
    
    # Format conversation history
    conversation_history = format_conversation_history(messages, agent.id)
    
    # Create system prompt
    system_prompt = f"""You are {agent.name}, with the following instructions: {agent.instructions}
    
    You are participating in a multi-agent conversation about {conversation.topic}.
    
    Objective: {conversation.objective}
    
    {conversation.system_prompt or ''}
    
    Respond as {agent.name}. Keep your response concise (under 150 words).
    """
    
    if conversation.enable_meta_cognition:
        system_prompt += "\nInclude your thinking process by adding 'Thinking: [your thought process]' at the end of your response."
    
    if conversation.constraints:
        constraints = json.dumps(conversation.constraints)
        system_prompt += f"\nConstraints: {constraints}"
    
    # Create user prompt
    user_prompt = f"""Conversation history:
    {conversation_history}
    
    Now it's your turn to respond. Remember to stay in character as {agent.name}.
    """
    
    # Generate response
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192" if settings.LLM_PROVIDER.lower() == 'groq' else "gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=conversation.temperature,
            max_tokens=500
        )
        
        content = response.choices[0].message.content
        
        # Extract thinking if meta-cognition is enabled
        thinking = None
        if conversation.enable_meta_cognition and "Thinking:" in content:
            parts = content.split("Thinking:")
            content = parts[0].strip()
            thinking = parts[1].strip() if len(parts) > 1 else None
        
        # Create message object
        message_data = {
            "id": str(uuid.uuid4()),
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "thinking": thinking
        }
        
        return message_data
    except Exception as e:
        raise Exception(f"Error generating response: {str(e)}")

async def generate_agent_response_async(agent, conversation, messages):
    """Async version of generate_agent_response"""
    from .consumers import ConversationConsumer
    
    # Queue this agent's turn
    return await ConversationConsumer.queue_agent_turn(
        conversation.id,
        agent.id,
        lambda: generate_agent_response(agent, conversation, messages)
    )
