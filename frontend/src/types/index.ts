export interface Property {
  id: string;
  name: string;
  location: string;
  image: string;
  price: string;
  originalPrice?: string;
  sleeps: number;
  bedrooms: number;
  bathrooms: number;
  dogsAllowed: number;
  rating: number;
  description: string;
  features: string[];
  nearbyAttractions: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface SimulationStep {
  id: string;
  question: string;
  userAnswer?: string;
  isCompleted: boolean;
}

export interface DayItinerary {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  description: string;
  location?: string;
  type: 'arrival' | 'meal' | 'activity' | 'rest' | 'departure';
}

export interface SimulationResult {
  itinerary: DayItinerary[];
  personalizedTips: string[];
  highlights: string[];
}