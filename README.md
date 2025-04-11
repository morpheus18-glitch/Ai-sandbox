# LLM Sandbox

A comprehensive platform for multi-agent LLM conversations, data collection, and model training.

## Features

- Multi-agent conversations with different LLM models
- Real-time conversation monitoring and analysis
- 3D visualization of agent interactions
- Vector database for semantic search
- Data collection for model training
- User management with role-based access control
- API for integration with other systems
- Meta-cognitive analysis with multi-dimensional vectors
- Sentiment analysis for conversations
- Template management with tags and categories
- TensorFlow integration for model training
- Prometheus monitoring

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon)
- Groq API key

## Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/llm-sandbox.git
cd llm-sandbox
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Run the Setup Script

The setup script will guide you through setting up environment variables and the database:

\`\`\`bash
npm run setup
\`\`\`

This script will:
- Create a `.env.local` file with the necessary environment variables
- Set up the database tables
- Test the database connection

### 4. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

### 5. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Manual Setup (Alternative)

If you prefer to set up the application manually:

### 1. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgres://user:password@hostname:port/database

# LLM API Keys
GROQ_API_KEY=your-groq-api-key
\`\`\`

### 2. Set Up the Database

\`\`\`bash
npm run setup-db
\`\`\`

### 3. Test the Database Connection

\`\`\`bash
npm run test-db
\`\`\`

## Database Schema

The application uses the following database schema:

- `users`: User accounts and authentication
- `user_profiles`: User profile information
- `agents`: AI agent configurations
- `agent_templates`: Templates for creating agents
- `conversations`: Multi-agent conversations
- `conversation_tags`: Tags for conversations
- `conversation_agents`: Agents participating in conversations
- `messages`: Messages in conversations
- `message_embeddings`: Vector embeddings for messages
- `conversation_analysis`: Analysis of conversations
- `sentiment_analysis`: Sentiment analysis of messages
- `user_memory`: Persistent memory for users
- `training_jobs`: Model training jobs
- `templates`: Templates for conversations and agents
- `metrics`: Metrics for monitoring

## API Endpoints

The application provides the following API endpoints:

- `/api/auth/*`: Authentication endpoints
- `/api/users/*`: User management
- `/api/agents/*`: Agent management
- `/api/conversations/*`: Conversation management
- `/api/templates/*`: Template management
- `/api/analytics/*`: Analytics and reporting
- `/api/vector/*`: Vector search and embeddings
- `/api/training/*`: Model training
- `/api/metrics`: Prometheus metrics

## Troubleshooting

### NextAuth.js Errors

If you encounter NextAuth.js errors:

1. Make sure `NEXTAUTH_URL` is set correctly (e.g., `http://localhost:3000`)
2. Ensure `NEXTAUTH_SECRET` is a secure random string (at least 32 characters)
3. Check that your database is properly set up and accessible

### Database Connection Issues

If you have issues connecting to the database:

1. Verify your `DATABASE_URL` is correct
2. Make sure your database server is running
3. Check that your IP is allowed to connect to the database
4. Run `npm run test-db` to test the connection

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
