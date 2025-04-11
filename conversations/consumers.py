import json
import asyncio
from collections import deque
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, UserAccess

User = get_user_model()

class ConversationConsumer(AsyncWebsocketConsumer):
    # Class-level conversation queues
    conversation_queues = {}
    conversation_locks = {}
    
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'conversation_{self.conversation_id}'
        
        # Get the user from the scope
        user = self.scope['user']
        
        # Check if the user has access to the conversation
        if not await self.has_conversation_access(user, self.conversation_id):
            await self.close()
            return
        
        # Join the conversation group
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave the conversation group
        await self.channel_layer.group_discard(
            self.conversation_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        # We don't expect to receive messages from clients in this consumer
        pass
    
    @database_sync_to_async
    def has_conversation_access(self, user, conversation_id):
        # Anonymous users don't have access
        if not user.is_authenticated:
            return False
        
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Admin users have access to all conversations
            if user.role == 'admin':
                return True
            
            # Creator has access
            if conversation.created_by == user:
                return True
            
            # Public conversations are accessible to all authenticated users
            if conversation.is_public:
                return True
            
            # Check for explicit access
            return UserAccess.objects.filter(
                user=user,
                conversation_id=conversation_id
            ).exists()
        except Conversation.DoesNotExist:
            return False
    
    async def new_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))
    
    async def conversation_updated(self, event):
        # Send conversation update to WebSocket
        await self.send(text_data=json.dumps(event))
    
    @classmethod
    def new_message(cls, conversation_id, message):
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'conversation_{conversation_id}',
            {
                'type': 'new_message',
                'message': message
            }
        )
    
    @classmethod
    def conversation_updated(cls, conversation_id, event):
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'conversation_{conversation_id}',
            {
                'type': 'conversation_updated',
                **event
            }
        )

    @classmethod
    async def get_conversation_lock(cls, conversation_id):
        """Get or create a lock for a specific conversation"""
        if conversation_id not in cls.conversation_locks:
            cls.conversation_locks[conversation_id] = asyncio.Lock()
        return cls.conversation_locks[conversation_id]
        
    @classmethod
    async def queue_agent_turn(cls, conversation_id, agent_id, callback):
        """Queue an agent's turn in the conversation"""
        if conversation_id not in cls.conversation_queues:
            cls.conversation_queues[conversation_id] = deque()
            
        # Create a future to be resolved when it's this agent's turn
        loop = asyncio.get_event_loop()
        future = loop.create_future()
        
        # Add to queue
        cls.conversation_queues[conversation_id].append((agent_id, future, callback))
        
        # If this is the only item in the queue, process it immediately
        if len(cls.conversation_queues[conversation_id]) == 1:
            await cls.process_next_turn(conversation_id)
            
        # Wait for this agent's turn to complete
        return await future
        
    @classmethod
    async def process_next_turn(cls, conversation_id):
        """Process the next turn in the conversation queue"""
        if not cls.conversation_queues.get(conversation_id):
            return
            
        # Get the next agent in the queue
        agent_id, future, callback = cls.conversation_queues[conversation_id][0]
        
        try:
            # Get the conversation lock
            async with await cls.get_conversation_lock(conversation_id):
                # Execute the callback
                result = await callback()
                future.set_result(result)
        except Exception as e:
            future.set_exception(e)
        finally:
            # Remove from queue
            cls.conversation_queues[conversation_id].popleft()
            
            # Process the next turn if there are more in the queue
            if cls.conversation_queues[conversation_id]:
                await cls.process_next_turn(conversation_id)
