import { SimulationResult, SimulationStep } from '../types';

// Using environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface SimulationStartResponse {
  success: boolean;
  step: string;
  property: any;
  question: string;
}

export interface SimulationStepResponse {
  success: boolean;
  completed: boolean;
  step?: string;
  question?: string;
  answers?: Record<string, string>;
  results?: SimulationResult;
}

export interface FeedbackRequest {
  propertyId: string;
  rating: number;
  feedback: 'positive' | 'negative' | null;
  answers: Record<string, string>;
}

export const simulationService = {
  /**
   * Start a new simulation for a property
   */
  startSimulation: async (propertyId: string): Promise<SimulationStartResponse> => {
    try {
      const response = await fetch(`${API_URL}/simulate/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start simulation');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error starting simulation:', error);
      
      // Fallback to local data in case the API is not available
      return {
        success: true,
        step: 'initial',
        property: null,
        question: `Welcome to StayVision's "Simulate Your Stay"!\n\nDates: Mon 21 July 2025 – Thu 24 July 2025 (3 nights)\n\nTo tailor your story-like preview, tell me a bit about your trip:\n• Who's coming? (e.g. family with young kids, friends, couple + dog)\n• What do you love to do? (e.g. hiking, BBQs, local dining)\n• Any special requests or must-haves? (e.g. pet-friendly cafés, cycle storage)`
      };
    }
  },
  
  /**
   * Submit a step answer and get the next step or results
   */
  submitStepAnswer: async (
    propertyId: string,
    currentStep: string,
    answer: string,
    answers: Record<string, string> = {}
  ): Promise<SimulationStepResponse> => {
    try {
      // Update answers with the current step
      const updatedAnswers = { ...answers, [currentStep]: answer };
      
      const response = await fetch(`${API_URL}/simulate/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          currentStep,
          answer,
          answers: updatedAnswers
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit step answer');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting step answer:', error);
      
      // Mock response for demo/fallback
      // Determine if we have enough information or should ask another question
      const answersCount = Object.keys(answers).length;
      const shouldCompleteSimulation = answersCount >= 3 || Math.random() > 0.7; // Random chance to complete after 3+ questions
      
      if (shouldCompleteSimulation) {
        return {
          success: true,
          completed: true,
          results: getMockSimulationResults(answers) // Pass the answers to customize the results
        };
      } else {
        // Generate a dynamic next question based on previous answers
        const nextQuestion = generateDynamicQuestion(answers, currentStep);
        return {
          success: true,
          completed: false,
          step: `dynamic-step-${answersCount + 1}`,
          question: nextQuestion,
          answers: { ...answers, [currentStep]: answer }
        };
      }
    }
  },
  
  /**
   * Submit user feedback about the simulation
   */
  submitFeedback: async (feedbackData: FeedbackRequest): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { success: true }; // Pretend it worked in the demo
    }
  },
};

// Helper functions for fallback/mock data
// This function generates a dynamic question based on previous answers
function generateDynamicQuestion(answers: Record<string, string>, currentStep: string): string {
  // Get the content of the latest answer
  const latestAnswer = answers[currentStep] || '';
  
  // Common questions that might be asked
  const possibleQuestions = [
    `Thanks for sharing that information! Could you tell me more about any special activities you're interested in during your stay?`,
    `Great! Do you have any dietary preferences or requirements I should consider for restaurant recommendations?`,
    `Would you prefer more outdoor activities, indoor relaxation, or a mix of both during your stay?`,
    `Are there any specific local attractions or experiences you're hoping to include in your stay?`,
    `How do you feel about early morning activities versus evening experiences?`,
    `Are you interested in any wellness activities like spa treatments or yoga during your stay?`,
    `Would you like recommendations for family-friendly activities or more adult-oriented experiences?`
  ];
  
  // Try to personalize based on keywords in the latest answer
  if (latestAnswer.toLowerCase().includes('family') || latestAnswer.toLowerCase().includes('kids')) {
    return `I see you're traveling with family! What kinds of family-friendly activities would you enjoy most during your stay?`;
  }
  if (latestAnswer.toLowerCase().includes('food') || latestAnswer.toLowerCase().includes('dining')) {
    return `Food sounds important for your trip! Do you prefer fine dining experiences, casual local eateries, or cooking at the property?`;
  }
  if (latestAnswer.toLowerCase().includes('dog') || latestAnswer.toLowerCase().includes('pet')) {
    return `Since you're bringing a pet, would you like recommendations for pet-friendly activities and places to visit?`;
  }
  if (latestAnswer.toLowerCase().includes('walk') || latestAnswer.toLowerCase().includes('hike')) {
    return `It sounds like you enjoy the outdoors! Would you prefer more challenging hikes or leisurely walks during your stay?`;
  }
  
  // If no specific keywords are found, choose a random question
  const randomIndex = Math.floor(Math.random() * possibleQuestions.length);
  return possibleQuestions[randomIndex];
}

function getMockSimulationResults(answers: Record<string, string> = {}): SimulationResult {
  // Combine all answers into a single string for simple keyword analysis
  const allAnswersText = Object.values(answers).join(' ').toLowerCase();
  
  // Initialize basic itinerary
  const itinerary = [
    {
      day: 1,
      title: 'Arrival & Exploration',
      activities: [
        { time: '14:00', description: 'Arrive and settle in', type: 'arrival' as const },
        { time: '15:30', description: 'Explore the property grounds', type: 'activity' as const },
        { time: '18:00', description: 'Dinner at the nearby restaurant', type: 'meal' as const },
        { time: '20:00', description: 'Evening relaxation by the fireplace', type: 'rest' as const }
      ]
    },
    {
      day: 2,
      title: 'Local Adventures',
      activities: [
        { time: '08:30', description: 'Breakfast at the property', type: 'meal' as const },
        { time: '10:00', description: 'Visit local attractions', type: 'activity' as const },
        { time: '13:00', description: 'Lunch at a village café', type: 'meal' as const },
        { time: '15:00', description: 'Afternoon activities based on interests', type: 'activity' as const },
        { time: '19:00', description: 'Dinner and evening entertainment', type: 'meal' as const }
      ]
    },
    {
      day: 3,
      title: 'Farewell Day',
      activities: [
        { time: '09:00', description: 'Breakfast and packing', type: 'meal' as const },
        { time: '11:00', description: 'Final local experience', type: 'activity' as const },
        { time: '13:00', description: 'Lunch before departure', type: 'meal' as const },
        { time: '15:00', description: 'Check-out and farewell', type: 'departure' as const }
      ]
    }
  ];
  
  // Personalize based on keywords
  if (allAnswersText.includes('family') || allAnswersText.includes('kids') || allAnswersText.includes('children')) {
    itinerary[0].title = 'Family Arrival Day';
    itinerary[0].activities[2] = { time: '18:00', description: 'Family-friendly dinner at a local restaurant with children\'s menu', type: 'meal' as const };
    itinerary[1].activities[1] = { time: '10:00', description: 'Visit to nearby family adventure park', type: 'activity' as const };
    itinerary[1].activities[3] = { time: '15:00', description: 'Kids activities and games at the property', type: 'activity' as const };
  }
  
  if (allAnswersText.includes('hike') || allAnswersText.includes('walk') || allAnswersText.includes('outdoor')) {
    itinerary[1].title = 'Outdoor Adventure Day';
    itinerary[1].activities[1] = { time: '09:30', description: 'Guided hike in the nearby nature reserve', type: 'activity' as const };
    itinerary[1].activities[3] = { time: '15:30', description: 'Afternoon walk along the scenic coastal path', type: 'activity' as const };
    itinerary[2].activities[1] = { time: '10:00', description: 'Final morning nature walk', type: 'activity' as const };
  }
  
  if (allAnswersText.includes('food') || allAnswersText.includes('restaurant') || allAnswersText.includes('dining')) {
    itinerary[0].activities[2] = { time: '18:30', description: 'Dinner at the award-winning local restaurant', type: 'meal' as const };
    itinerary[1].activities[2] = { time: '13:00', description: 'Lunch at a gourmet farm-to-table café', type: 'meal' as const };
    itinerary[1].activities[4] = { time: '19:30', description: 'Fine dining experience with local specialties', type: 'meal' as const };
    itinerary[2].activities[2] = { time: '13:00', description: 'Farewell lunch at the charming village pub', type: 'meal' as const };
  }
  
  if (allAnswersText.includes('dog') || allAnswersText.includes('pet')) {
    itinerary[0].activities[1] = { time: '15:30', description: 'Explore the pet-friendly property grounds with your dog', type: 'activity' as const };
    itinerary[1].activities[1] = { time: '10:00', description: 'Visit to dog-friendly beach', type: 'activity' as const };
    itinerary[1].activities[2] = { time: '13:00', description: 'Lunch at pet-welcoming outdoor café', type: 'meal' as const };
  }
  
  // Generate personalized tips based on answers
  const personalizedTips = [
    'Remember to pack suitable clothing for the weather forecast during your stay',
    'Ask the property host about the hidden local spots not in the guidebooks',
    'Save the property\'s address and contact details on your phone before arrival'
  ];
  
  if (allAnswersText.includes('family') || allAnswersText.includes('kids')) {
    personalizedTips.push('The property has board games in the living room cupboard - perfect for family evenings');
    personalizedTips.push('The nearest pharmacy is just 5 minutes away by car if needed for the little ones');
  }
  
  if (allAnswersText.includes('hike') || allAnswersText.includes('walk')) {
    personalizedTips.push('Download the local trails app for the best walking routes from the property');
    personalizedTips.push('There\'s a boot room by the back door - perfect for muddy hiking boots');
  }
  
  if (allAnswersText.includes('dog') || allAnswersText.includes('pet')) {
    personalizedTips.push('The property has a secure garden, perfect for letting your dog explore safely');
    personalizedTips.push('There\'s a pet shop in the village that stocks emergency supplies if needed');
  }
  
  // Generate personalized highlights based on answers
  const highlights = ['Relaxing in the beautiful surroundings'];
  
  if (allAnswersText.includes('family') || allAnswersText.includes('kids')) {
    highlights.push('Creating lasting family memories together');
    highlights.push('Quality time away from screens and distractions');
  }
  
  if (allAnswersText.includes('hike') || allAnswersText.includes('walk') || allAnswersText.includes('outdoor')) {
    highlights.push('Breathtaking views from the nearby hiking trails');
    highlights.push('Connecting with nature in this stunning location');
  }
  
  if (allAnswersText.includes('food') || allAnswersText.includes('restaurant')) {
    highlights.push('Sampling the region\'s renowned local cuisine');
    highlights.push('Discovering hidden culinary gems in the area');
  }
  
  if (allAnswersText.includes('dog') || allAnswersText.includes('pet')) {
    highlights.push('Watching your dog enjoy the freedom of the countryside');
    highlights.push('Finding new pet-friendly places to explore together');
  }
  
  return {
    itinerary,
    personalizedTips,
    highlights
  };
}
