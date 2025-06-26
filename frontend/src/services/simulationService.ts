import { SimulationResult } from '../types';

// Using environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  success: boolean;
  property: any;
  messages: Message[];
  completed: boolean;
  results?: SimulationResult;
  step?: string;
  question?: string;
}

export interface FeedbackRequest {
  propertyId: string;
  rating: number;
  feedback: 'positive' | 'negative' | null;
  answers: Record<string, string>;
}

export const simulationService = {
  /**
   * Get LLM response for a property
   */
  getLLMResponse: async (
    propertyId: string,
    systemPrompt?: string,
    messages: Message[] = [],
    userMessage?: string
  ): Promise<LLMResponse> => {
    // Use a unique ID for logging/debugging
    const requestId = Math.random().toString(36).substring(2, 9);
    console.log(`[${requestId}] LLM API call for property '${propertyId}'`);

    const response = await fetch(`${API_URL}/getResponseFromLLM`, {
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


    const data = await response.json(); // Format the response to match 
    
    // console.log(data.messages);
    
    // what SimulationFlow expects
    return {
      success: data.success,
      step: 'initial',
      property: data.property,
      question: data.messages.find((m: Message) => m.role === 'assistant')?.content || '',
      messages: data.messages,
      completed: data.completed,
      results: data.results
    };
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
