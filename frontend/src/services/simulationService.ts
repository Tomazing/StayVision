import { SimulationResult } from '../types';

// Using environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ConversationResponse {
  success: boolean;
  property: any;
  messages: Message[];
  completed: boolean;
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
   * Start a simulation for a property
   */
  startSimulation: async (propertyId: string, systemPrompt?: string): Promise<any> => {
    const response = await simulationService.conversation(propertyId, [], undefined, systemPrompt);
    
    // Format the response to match what SimulationFlow expects
    return {
      success: response.success,
      step: 'initial',
      property: response.property,
      question: response.messages.find(m => m.role === 'assistant')?.content || ''
    };
  },
  
  /**
   * Submit an answer for a step in the simulation
   */
  submitStepAnswer: async (
    propertyId: string,
    currentStep: string,
    answer: string,
    answers: Record<string, string>,
    systemPrompt?: string
  ): Promise<any> => {
    // Build conversation history from past answers
    const messages: Message[] = [];
    
    // Add past messages based on answers
    Object.entries(answers).forEach(([step, answer]) => {
      if (step !== currentStep) { // Skip the current answer as we'll add it below
        messages.push({
          role: 'user',
          content: answer
        });
        
        // Add a simple assistant response as a placeholder
        messages.push({
          role: 'assistant',
          content: `Thanks for sharing that information about ${step}.`
        });
      }
    });
    
    // Call conversation API with history and new message
    const response = await simulationService.conversation(
      propertyId,
      messages,
      answer,
      systemPrompt
    );
    
    // Format the response to match what SimulationFlow expects
    return {
      success: response.success,
      step: currentStep === 'initial' ? 'group-size' : 'next-' + currentStep,
      property: response.property,
      question: response.messages.find(m => m.role === 'assistant' && 
                                         !messages.some(existingMsg => existingMsg.content === m.content))?.content || '',
      completed: response.completed,
      results: response.results,
      answers: { ...answers, [currentStep]: answer }
    };
  },

  /**
   * Start a conversation or send a new message
   */
  conversation: async (
    propertyId: string,
    messages: Message[] = [],
    userMessage?: string,
    systemPrompt?: string
  ): Promise<ConversationResponse> => {
    // If no system prompt is provided and this is likely a new conversation
    // (no messages and no user message yet), we need property details
    if (!systemPrompt && messages.length === 0 && !userMessage) {
      const property = await import('../data/properties').then(module => {
        return module.properties.find(p => p.id === propertyId);
      });
      
      // Pass the property data to the backend without formatting a prompt here
      // The backend will use its default system prompt with this data
      systemPrompt = JSON.stringify(property);
    }

    const response = await fetch(`${API_URL}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId,
        messages,
        userMessage,
        systemPrompt
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process conversation');
    }
    
    return await response.json();
  },
  
  /**
   * Submit user feedback about the simulation
   */
  submitFeedback: async (feedbackData: FeedbackRequest): Promise<{ success: boolean }> => {
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
  }
};
