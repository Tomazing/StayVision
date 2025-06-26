import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getPropertyById } from './data/properties.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', process.env.FRONTEND_URL], // Use the frontend URL in production
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Routes
// The root path will automatically serve index.html from the public directory

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StayVision API is running' });
});

// Submit feedback
app.post('/api/feedback', (req, res) => {
  try {
    const { propertyId, rating, feedback, answers } = req.body;
    
    // In a real app would store this feedback in a database
    console.log('Feedback received:', { propertyId, rating, feedback, answers });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Single endpoint to handle the entire conversation
app.post('/api/getResponseFromLLM', async (req, res) => {
  try {
    const { propertyId, messages = [], userMessage, systemPrompt: customSystemPrompt } = req.body;
    
    // Get property data
    const property = getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Build the conversation history
    const conversationHistory = [...messages];
    
    // Add the new user message if provided
    if (userMessage) {
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });
    }
    
    // If this is the first message, initialize with property details
    if (conversationHistory.length === 0 || (conversationHistory.length === 1 && userMessage)) {
      // Use custom system prompt if provided, or default if not
      const systemPrompt = {
        role: 'system',
        content: customSystemPrompt || getDefaultSystemPrompt(property)
      };
      
      // Insert system prompt at the beginning
      conversationHistory.unshift(systemPrompt);
      
      // If there's no user message yet, add a first assistant message to welcome the user
      if (!userMessage) {
        // Instead of using a predefined function, just call OpenAI API for the initial response
        // This allows the custom prompt to fully control the initial response
        if (customSystemPrompt) {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [systemPrompt]
            // max_tokens: 300
          });
          
          conversationHistory.push({
            role: 'assistant',
            content: completion.choices[0].message.content
          });
        } else {
      // If no custom prompt, use a default welcome message
      conversationHistory.push({
        role: 'assistant',
        content: `Welcome to StayVision's "Simulate Your Stay" at ${property.name}!

Dates: Mon 21 July 2025 – Thu 24 July 2025 (3 nights)
Sleeps: ${property.sleeps} | Bedrooms: ${property.bedrooms} | Dogs allowed: up to ${property.dogsAllowed}

To tailor your story-like preview, tell me a bit about your trip:
• Who's coming? (e.g. family with young kids, friends, couple + dog)
• What do you love to do? (e.g. hiking, BBQs, local dining)
• Any special requests or must-haves? (e.g. pet-friendly cafés, cycle storage)`
      });
        }
        
        // Return the initial response
        return res.status(200).json({
          success: true,
          property,
          messages: conversationHistory,
          completed: false
        });
      }
    }
    
    // Check if it should generate final results based on conversation length
    const userMessageCount = conversationHistory.filter(msg => msg.role === 'user').length;
    const shouldGenerateResults = userMessageCount >= 4 || 
      (userMessageCount >= 3 && conversationHistory.some(msg => 
        msg.content.toLowerCase().includes('thank') || 
        msg.content.toLowerCase().includes('that\'s all') ||
        msg.content.toLowerCase().includes('sounds good')
      ));
    
    // If have enough information, generate a complete itinerary
    if (shouldGenerateResults) {
      // Call OpenAI to generate the itinerary
      const results = await generateItineraryFromConversation(property, conversationHistory, customSystemPrompt);
      
      return res.status(200).json({
        success: true,
        property,
        messages: conversationHistory,
        completed: true,
        results
      });
    }
    
    // Otherwise, get the next assistant response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationHistory
      // max_tokens: 300
    });
    
    // Add the assistant's response to the conversation
    const assistantMessage = {
      role: 'assistant',
      content: completion.choices[0].message.content
    };
    
    conversationHistory.push(assistantMessage);
    
    // Return the updated conversation
    res.status(200).json({
      success: true,
      property,
      messages: conversationHistory,
      completed: false
    });
  } catch (error) {
    console.error('Error processing conversation:', error);
    res.status(500).json({ error: 'Failed to process conversation' });
  }
});

// Helper function to generate itinerary from conversation
async function generateItineraryFromConversation(property, conversationHistory, customSystemPrompt = null) {
  try {
    // Default system prompt for generating an itinerary
    const defaultPrompt = `You are StayVision, an AI assistant for Awaze that creates personalized vacation stay simulations. Generate a detailed 3-day itinerary for the user's stay at ${property.name} in ${property.location}, with a day-by-day breakdown in a story-like format that feels personal and tailored to their interests. 

Based on the previous conversation, create a structured JSON response with days, activities, personalized tips, and highlights.

Format your response as a JSON object with the following structure:
{
  "itinerary": [
    {
      "day": 1,
      "title": "Day 1 title that captures the theme",
      "activities": [
        {
          "time": "14:00",
          "description": "Activity description",
          "location": "Optional location",
          "type": "arrival/meal/activity/rest/departure"
        }
      ]
    }
  ],
  "personalizedTips": [
    "Tip 1 specific to their interests",
    "Tip 2 specific to their travel style"
  ],
  "highlights": [
    "A key highlight of the stay",
    "Another special moment"
  ]
}`;

    // Create a prompt that includes the property details and the conversation
    const systemPrompt = {
      role: 'system',
      content: customSystemPrompt || defaultPrompt
    };
    
    // Build messages for the API call
    const messages = [
      systemPrompt,
      ...conversationHistory.filter(msg => msg.role !== 'system')
    ];
    
    // Add a final instruction to ensure to get the desired format
    messages.push({
      role: 'user',
      content: 'Based on the conversation, please generate my personalized 3-day itinerary in the JSON format specified.'
    });
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseText = completion.choices[0].message.content;
    const simulationData = JSON.parse(responseText);
    
    return {
      itinerary: simulationData.itinerary || [],
      personalizedTips: simulationData.personalizedTips || [],
      highlights: simulationData.highlights || []
    };
  } catch (error) {
    console.error('Error generating itinerary from conversation:', error);
    
    // Return a basic error structure if OpenAI API fails
    return {
      itinerary: [],
      personalizedTips: ["Sorry, we couldn't generate your itinerary at this time."],
      highlights: ["Please try again later."]
    };
  }
}

function getDefaultSystemPrompt(property) {
  return `You are StayVision, an AI assistant for Awaze that helps potential guests simulate their stay at ${property.name} before booking.

Property details:
- Name: ${property.name}
- Location: ${property.location}
- Sleeps: ${property.sleeps}
- Bedrooms: ${property.bedrooms}
- Bathrooms: ${property.bathrooms}
- Dogs allowed: ${property.dogsAllowed}
- Features: ${property.features.join(', ')}
- Nearby attractions: ${property.nearbyAttractions.join(', ')}

You will have a conversation with the user to understand their trip needs. Ask clarifying questions one at a time to gather the following information:
1. Who's coming? (family members, friends, pets, etc.)
2. What activities they enjoy (hiking, dining, relaxation, etc.)
3. Their preferences for transportation (car, public transit)
4. Any special requests or must-haves

Only move on to the next question after receiving an answer. Keep your questions friendly and conversational. After 3-4 questions, or when you have enough information, generate a personalized 3-day itinerary for their stay, with detailed day-by-day activities.

If this is your first message, begin with a friendly greeting and introduce StayVision.`;
}

// Start the server - only in development mode, not in Vercel production
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`StayVision API server running on port ${port}`);
  });
}

export default app;