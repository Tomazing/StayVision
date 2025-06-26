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
// because we've configured express.static middleware above

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StayVision API is running' });
});

// Handle initial simulation request
app.post('/api/simulate/start', async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    // In a real app, would fetch property data from a database
    // For demo purposes, we'll use the hardcoded property data
    const property = getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Return the initial question and property details
    res.status(200).json({
      success: true,
      step: 'initial',
      property,
      question: getInitialQuestion(property),
    });
  } catch (error) {
    console.error('Error starting simulation:', error);
    res.status(500).json({ error: 'Failed to start simulation' });
  }
});

// Handle simulation step answers
app.post('/api/simulate/step', async (req, res) => {
  try {
    const { propertyId, currentStep, answer, answers = {} } = req.body;
    
    // Store the current answer
    answers[currentStep] = answer;
    
    // Determine the next step or generate final results
    if (currentStep === 'final' || Object.keys(answers).length >= 7) {
      // Generate final simulation results
      const results = await generateSimulationResults(propertyId, answers);
      
      res.status(200).json({
        success: true,
        completed: true,
        results
      });
    } else {
      // Determine the next question
      const nextStep = getNextStep(currentStep);
      const nextQuestion = getQuestionForStep(nextStep, propertyId, answers);
      
      res.status(200).json({
        success: true,
        completed: false,
        step: nextStep,
        question: nextQuestion,
        answers
      });
    }
  } catch (error) {
    console.error('Error processing simulation step:', error);
    res.status(500).json({ error: 'Failed to process simulation step' });
  }
});

// Submit feedback
app.post('/api/feedback', (req, res) => {
  try {
    const { propertyId, rating, feedback, answers } = req.body;
    
    // In a real app, you would store this feedback in a database
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
            messages: [systemPrompt],
            max_tokens: 300
          });
          
          conversationHistory.push({
            role: 'assistant',
            content: completion.choices[0].message.content
          });
        } else {
          // If no custom prompt, use the default initial question
          conversationHistory.push({
            role: 'assistant',
            content: getInitialQuestion(property)
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
    
    // Check if we should generate final results based on conversation length
    const userMessageCount = conversationHistory.filter(msg => msg.role === 'user').length;
    const shouldGenerateResults = userMessageCount >= 4 || 
      (userMessageCount >= 3 && conversationHistory.some(msg => 
        msg.content.toLowerCase().includes('thank') || 
        msg.content.toLowerCase().includes('that\'s all') ||
        msg.content.toLowerCase().includes('sounds good')
      ));
    
    // If we have enough information, generate a complete itinerary
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
      messages: conversationHistory,
      max_tokens: 300
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
    
    // Add a final instruction to ensure we get the desired format
    messages.push({
      role: 'user',
      content: 'Based on our conversation, please generate my personalized 3-day itinerary in the JSON format specified.'
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
    
    // Return mock data if OpenAI API fails
    return generateMockSimulationResults(property, {});
  }
}

function getInitialQuestion(property) {
  return `Welcome to StayVision's "Simulate Your Stay" at ${property.name}!

Dates: Mon 21 July 2025 – Thu 24 July 2025 (3 nights)
Sleeps: ${property.sleeps} | Bedrooms: ${property.bedrooms} | Dogs allowed: up to ${property.dogsAllowed}

To tailor your story-like preview, tell me a bit about your trip:
• Who's coming? (e.g. family with young kids, friends, couple + dog)
• What do you love to do? (e.g. hiking, BBQs, local dining)
• Any special requests or must-haves? (e.g. pet-friendly cafés, cycle storage)`;
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

function getNextStep(currentStep) {
  const stepOrder = ['initial', 'group-size', 'pace', 'dining', 'transport', 'evening-preference', 'shopping'];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex < 0 || currentIndex >= stepOrder.length - 1) {
    return 'group-size'; // Default to first question if current step not found
  }
  
  return stepOrder[currentIndex + 1];
}

function getQuestionForStep(step, propertyId, answers) {
  const property = getPropertyById(propertyId);
  
  // Extract information from previous answers for personalization
  const initialAnswer = answers.initial || '';
  
  // Simple keyword extraction - in a real implementation, use NLP for better understanding
  const hasChildren = initialAnswer.toLowerCase().includes('child') || 
                      initialAnswer.toLowerCase().includes('kid');
  const hasDogs = initialAnswer.toLowerCase().includes('dog') || 
                  initialAnswer.toLowerCase().includes('pet');
  
  // Questions tailored based on previous answers and current step
  switch (step) {
    case 'group-size':
      return `Great—let's tailor your 3-day preview just for you${initialAnswer ? ' and your ' + extractTravelCompanions(initialAnswer) : ''}. A few quick questions:

Will it be just the${hasChildren ? ' adults and children' : hasDogs ? ' people and pets' : ' people in your group'} (no additional guests)?`;
    
    case 'pace':
      return `What pace suits you best—gentle countryside strolls, popping into nearby towns/city, or a mix of both?`;
    
    case 'dining':
      return `Would you prefer cooking/BBQs at the farmhouse or sampling local restaurants for most meals?`;
    
    case 'transport':
      return `Will you have a rental car to drive around, or are you planning to use public transport (trains/buses)?`;
    
    case 'evening-preference':
      return `When you explore local places at night, do you prefer lively pubs/bars and live music, or quieter evening strolls and cosy cafés?`;
    
    case 'shopping':
      if (answers.dining && answers.dining.toLowerCase().includes('cook')) {
        return `For the cooking night${answers.dining.toLowerCase().includes('bbq') ? ' or BBQ' : ''}, would you like recommendations for nearby markets or farm shops to pick up fresh local produce?`;
      } else {
        return `Would you be interested in visiting any local markets or shops during your stay?`;
      }
    
    default:
      return `Tell me more about your preferences for this stay at ${property.name}.`;
  }
}

function extractTravelCompanions(initialAnswer) {
  // Very simple extraction - in a real app, use NLP
  const lowerAnswer = initialAnswer.toLowerCase();
  
  if (lowerAnswer.includes('family')) return 'family';
  if (lowerAnswer.includes('parents')) return 'parents';
  if (lowerAnswer.includes('friends')) return 'friends';
  if (lowerAnswer.includes('partner') || lowerAnswer.includes('spouse')) return 'partner';
  if (lowerAnswer.includes('children') || lowerAnswer.includes('kids')) return 'family';
  
  return 'group';
}

async function generateSimulationResults(propertyId, answers) {
  const property = getPropertyById(propertyId);
  
  try {
    // Create a prompt for the OpenAI model
    const prompt = createPromptFromAnswers(property, answers);
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // You can adjust based on the model you want to use
      messages: [
        {
          role: "system", 
          content: "You are StayVision, an AI assistant for Awaze that creates personalized vacation stay simulations. Generate a detailed 3-day itinerary for the user's stay, with a day-by-day breakdown in a story-like format that feels personal and tailored to their interests. Include specific timings, local attractions, and activities that match their preferences. Format your response as a structured JSON object with days, activities, personalized tips, and highlights."
        },
        { role: "user", content: prompt }
      ],
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
    console.error('Error generating simulation results:', error);
    
    // Return mock data if OpenAI API fails
    return generateMockSimulationResults(property, answers);
  }
}

function createPromptFromAnswers(property, answers) {
  return `Create a personalized 3-day itinerary for a stay at ${property.name} in ${property.location} from July 21-24, 2025.

Property details:
- Sleeps ${property.sleeps}
- ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms
- Dogs allowed: ${property.dogsAllowed}
- Features: ${property.features.join(', ')}
- Nearby attractions: ${property.nearbyAttractions.join(', ')}

Guest information and preferences:
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Create a JSON response with the following structure:
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
}

Include activities that match their interests, incorporate local attractions, and suggest specific places to visit. Add times for each activity. Make the itinerary feel authentic and personalized, with 4-6 activities per day.`;
}

function generateMockSimulationResults(property, answers) {
  // Generate mock data based on user preferences
  // This function is used as a fallback if the OpenAI API call fails
  
  const hasDogs = Object.values(answers).some(answer => 
    answer.toLowerCase().includes('dog') || answer.toLowerCase().includes('pet')
  );
  
  const likesOutdoors = Object.values(answers).some(answer => 
    answer.toLowerCase().includes('hik') || 
    answer.toLowerCase().includes('walk') || 
    answer.toLowerCase().includes('outdoor')
  );
  
  const likesDining = Object.values(answers).some(answer => 
    answer.toLowerCase().includes('restaurant') || 
    answer.toLowerCase().includes('dining') || 
    answer.toLowerCase().includes('food')
  );
  
  return {
    itinerary: [
      {
        day: 1,
        title: "Arrival & Local Exploration",
        activities: [
          {
            time: "14:00",
            description: "Arrive at Wildhouse Farm and settle in",
            location: "Wildhouse Farm",
            type: "arrival"
          },
          {
            time: "15:30",
            description: "Light refreshments on the patio overlooking the garden",
            location: "Wildhouse Farm",
            type: "meal"
          },
          {
            time: "17:00",
            description: hasDogs ? "Dog-friendly stroll around the nearby countryside" : "Gentle stroll around the nearby countryside",
            location: "Local footpaths",
            type: "activity"
          },
          {
            time: "19:00",
            description: likesDining ? "Dinner at the adjoining Italian restaurant" : "Cook dinner in the farmhouse kitchen",
            location: likesDining ? "Bella Vista Restaurant" : "Wildhouse Farm",
            type: "meal"
          },
          {
            time: "21:00",
            description: "Relax by the wood burner in the cozy lounge",
            location: "Wildhouse Farm",
            type: "rest"
          }
        ]
      },
      {
        day: 2,
        title: likesOutdoors ? "Lakeside Adventures" : "Local Treasures",
        activities: [
          {
            time: "08:30",
            description: "Breakfast in the farmhouse kitchen",
            location: "Wildhouse Farm",
            type: "meal"
          },
          {
            time: "10:00",
            description: likesOutdoors ? "Visit Hollingworth Lake for scenic walks" : "Explore Rochdale town center and historic buildings",
            location: likesOutdoors ? "Hollingworth Lake" : "Rochdale",
            type: "activity"
          },
          {
            time: "13:00",
            description: "Picnic lunch by the lake",
            location: likesOutdoors ? "Hollingworth Lake" : "Rochdale Gardens",
            type: "meal"
          },
          {
            time: "15:00",
            description: "Visit Piethorne Valley country park",
            location: "Piethorne Valley",
            type: "activity"
          },
          {
            time: "18:00",
            description: "Return to Wildhouse Farm to freshen up",
            location: "Wildhouse Farm",
            type: "rest"
          },
          {
            time: "19:30",
            description: "Evening meal at a local pub with traditional food",
            location: "The White Lion, Milnrow",
            type: "meal"
          }
        ]
      },
      {
        day: 3,
        title: "City Excursion & Farewell",
        activities: [
          {
            time: "09:00",
            description: "Breakfast at the farmhouse",
            location: "Wildhouse Farm",
            type: "meal"
          },
          {
            time: "10:30",
            description: "Day trip to Manchester city center",
            location: "Manchester",
            type: "activity"
          },
          {
            time: "12:30",
            description: "Lunch at a city restaurant",
            location: "Manchester Northern Quarter",
            type: "meal"
          },
          {
            time: "14:00",
            description: "Shopping and sightseeing in Manchester",
            location: "Manchester City Centre",
            type: "activity"
          },
          {
            time: "17:00",
            description: "Return to Wildhouse Farm",
            location: "Wildhouse Farm",
            type: "rest"
          },
          {
            time: "19:00",
            description: "Farewell BBQ in the garden (weather permitting)",
            location: "Wildhouse Farm Garden",
            type: "meal"
          }
        ]
      }
    ],
    personalizedTips: [
      hasDogs ? "The garden isn't fully enclosed, so keep an eye on your dog when outside" : "The garden has beautiful mature trees perfect for relaxing under on sunny days",
      likesOutdoors ? "Trail maps for Piethorne Valley are available in the entrance hall" : "The Smart TV in the lounge has Netflix and other streaming services",
      likesDining ? "Book a table at Bella Vista in advance on busy weekends" : "The kitchen has all modern appliances including a food processor and stand mixer",
      "The farm has good mobile reception but the best WiFi signal is in the lounge and kitchen",
      "Local bus timetables are provided in the information folder in the entrance hall"
    ],
    highlights: [
      likesOutdoors ? "Stunning sunset views across the valley from the garden" : "Cozy evenings by the wood burner",
      hasDogs ? "Dog-friendly walking routes directly from the property" : "Spacious, comfortable bedrooms with luxury bedding",
      likesDining ? "The connecting Italian restaurant serves authentic pasta and pizza" : "The large dining room is perfect for memorable family meals",
      "Beautiful countryside location with easy access to both rural walks and city attractions"
    ]
  };
}

// Start the server - only in development mode, not in Vercel production
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`StayVision API server running on port ${port}`);
  });
}

export default app;
