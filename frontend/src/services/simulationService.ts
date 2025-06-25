import { SimulationResult, SimulationStep } from '../types';

const API_URL = 'http://localhost:3000/api';

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
      const isLastStep = currentStep === 'shopping';
      
      if (isLastStep) {
        return {
          success: true,
          completed: true,
          results: getMockSimulationResults()
        };
      } else {
        const nextStep = getNextMockStep(currentStep);
        return {
          success: true,
          completed: false,
          step: nextStep.id,
          question: nextStep.question,
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
function getNextMockStep(currentStep: string): Omit<SimulationStep, 'userAnswer' | 'isCompleted'> {
  const stepOrder = [
    'initial',
    'group-size',
    'pace',
    'dining',
    'transport',
    'evening-preference',
    'shopping'
  ];
  
  const currentIndex = stepOrder.indexOf(currentStep);
  const nextStepId = stepOrder[currentIndex + 1] || stepOrder[0];
  
  const mockQuestions: Record<string, string> = {
    'initial': `Welcome to StayVision's "Simulate Your Stay"!\n\nTo tailor your story-like preview, tell me a bit about your trip.`,
    'group-size': 'Great—let\'s tailor your 3-day preview. A few quick questions:\n\nWill it be just your group (no additional guests)?',
    'pace': 'What pace suits you best—gentle countryside strolls, popping into nearby towns/city, or a mix of both?',
    'dining': 'Would you prefer cooking/BBQs at the property or sampling local restaurants for most meals?',
    'transport': 'Will you have a rental car to drive around, or are you planning to use public transport?',
    'evening-preference': 'When you explore local places at night, do you prefer lively pubs/bars and live music, or quieter evening strolls and cosy cafés?',
    'shopping': 'Would you like recommendations for nearby markets or shops to pick up fresh local produce?'
  };
  
  return {
    id: nextStepId,
    question: mockQuestions[nextStepId]
  };
}

function getMockSimulationResults(): SimulationResult {
  return {
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Exploration',
        activities: [
          { time: '14:00', description: 'Arrive and settle in', type: 'arrival' },
          { time: '15:30', description: 'Explore the property grounds', type: 'activity' },
          { time: '18:00', description: 'Dinner at the nearby restaurant', type: 'meal' },
          { time: '20:00', description: 'Evening relaxation by the fireplace', type: 'rest' }
        ]
      },
      {
        day: 2,
        title: 'Local Adventures',
        activities: [
          { time: '08:30', description: 'Breakfast at the property', type: 'meal' },
          { time: '10:00', description: 'Visit local attractions', type: 'activity' },
          { time: '13:00', description: 'Lunch at a village café', type: 'meal' },
          { time: '15:00', description: 'Afternoon activities based on interests', type: 'activity' },
          { time: '19:00', description: 'Dinner and evening entertainment', type: 'meal' }
        ]
      },
      {
        day: 3,
        title: 'Farewell Day',
        activities: [
          { time: '09:00', description: 'Breakfast and packing', type: 'meal' },
          { time: '11:00', description: 'Final local experience', type: 'activity' },
          { time: '13:00', description: 'Lunch before departure', type: 'meal' },
          { time: '15:00', description: 'Check-out and farewell', type: 'departure' }
        ]
      }
    ],
    personalizedTips: [
      'Personalized tip based on your interests',
      'Local insider knowledge for your stay',
      'Special recommendation just for you',
      'Practical advice for your visit'
    ],
    highlights: [
      'Key highlight tailored to your preferences',
      'Special moment you might enjoy',
      'Unique experience for your stay',
      'Memory-making opportunity'
    ]
  };
}
