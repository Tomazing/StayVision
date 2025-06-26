# StayVision Backend

This is the backend server for the StayVision project, an Awaze Hackathon 2025 entry.

## Overview

StayVision's backend provides an API for the "Simulate Your Stay" feature, which uses AI to generate personalised stay experiences based on property information and user preferences.

## Features

- API endpoints for starting and progressing through the simulation
- OpenAI integration for generating personalized itineraries
- Mock property data for demonstration purposes
- Feedback collection endpoint

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### GET /api/health
- Check if the API is running

### POST /api/getResponseFromLLM
- Process a conversation with the LLM for a property
- Request body: 
```
{ 
  "propertyId": "wildhouse-farm", 
  "messages": [], 
  "userMessage": "Family of 4 with two teenagers. We love hiking and local food.",
  "systemPrompt": null 
}
```
- Returns conversation history and property details, and eventually simulation results

### POST /api/feedback
- Submit user feedback about the simulation
- Request body: `{ "propertyId": "wildhouse-farm", "rating": 8, "feedback": "positive", "answers": {} }`

## Integration with Frontend

The frontend communicates with this API to:
1. Process conversations with the AI for a selected property through a single endpoint
2. Receive property details, conversation history, and personalized itineraries
3. Submit user feedback

## Development Notes

- The server uses mock property data for the hackathon demo
- In a production environment, it would connect to a database for property information
- The OpenAI integration can be customized with different models and prompts

## Deploying to Vercel

This backend is configured for easy deployment to Vercel:

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the backend directory:
```bash
cd backend
vercel
```

4. Follow the prompts in the CLI:
   - Set up and deploy "Y"
   - Link to existing project? "N"
   - What's your project's name? "stayvision-backend" (or your preferred name)
   - In which directory is your code located? "./" (current directory)
   - Want to override the settings? "N" 

5. For production deployment:
```bash
vercel --prod
```

### Environment Variables

Make sure to set up these environment variables in your Vercel project settings:

- `OPENAI_API_KEY`: OpenAI API key

Can set these up during deployment or in the Vercel dashboard after deployment.

### Vercel Configuration

The `vercel.json` file in this directory configures the deployment settings, ensuring that all API routes are correctly handled by the Express application.
