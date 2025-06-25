# StayVision Backend

This is the backend server for the StayVision project, an Awaze Hackathon 2025 entry.

## Overview

StayVision's backend provides an API for the "Simulate Your Stay" feature, which uses AI to generate personalized stay experiences based on property information and user preferences.

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

### POST /api/simulate/start
- Start a new simulation
- Request body: `{ "propertyId": "1" }`
- Returns initial question and property details

### POST /api/simulate/step
- Submit an answer and get the next question
- Request body: `{ "propertyId": "1", "currentStep": "step-id", "answer": "user answer", "answers": {} }`
- Returns next question or final simulation results

### POST /api/feedback
- Submit user feedback about the simulation
- Request body: `{ "propertyId": "1", "rating": 8, "feedback": "positive", "answers": {} }`

## Integration with Frontend

The frontend communicates with this API to:
1. Start a simulation for a selected property
2. Submit user responses to questions
3. Receive personalized itineraries
4. Submit user feedback

## Development Notes

- The server uses mock property data for the hackathon demo
- In a production environment, you would connect to a database for property information
- The OpenAI integration can be customized with different models and prompts
