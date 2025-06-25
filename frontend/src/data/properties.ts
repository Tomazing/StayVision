import { Property } from '../types';

export const properties: Property[] = [
  {
    id: 'wildhouse-farm',
    name: 'Wildhouse Farm',
    location: 'Milnrow, near Rochdale, Manchester',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '£778',
    originalPrice: '£860',
    sleeps: 6,
    bedrooms: 3,
    bathrooms: 2,
    dogsAllowed: 3,
    rating: 4.7,
    description: 'This cosy yet spacious farmhouse provides the idyllic base for families, couples and their four-legged friends to relax in comfort and explore the local area.',
    features: [
      'Wood burner in lounge',
      'Fully equipped farmhouse kitchen',
      'Four-poster super-king bedroom',
      'Italian restaurant next door',
      'Vast garden with BBQ',
      'Boot room for cyclists'
    ],
    nearbyAttractions: [
      'Hollingworth Lake (2 miles)',
      'Piethorne Valley Country Park (3 miles)',
      'Peak District National Park (10 miles)',
      'Manchester City Centre (15 miles)'
    ],
    reviews: [
      {
        id: '1',
        author: 'Nicola',
        rating: 4.8,
        date: '15th January 2025',
        comment: 'Lovely location with views across the valley. Very well equipped for a family stay. The restaurant next door was excellent.'
      },
      {
        id: '2',
        author: 'Sarah',
        rating: 4.4,
        date: '8th November 2024',
        comment: 'A lovely weekend away with the family. The house was always warm and clean throughout. Dog friendly made our weekend.'
      }
    ]
  },
  {
    id: 'coastal-retreat',
    name: 'Coastal Retreat',
    location: 'St. Ives, Cornwall',
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '£920',
    sleeps: 4,
    bedrooms: 2,
    bathrooms: 1,
    dogsAllowed: 2,
    rating: 4.9,
    description: 'A stunning coastal cottage with panoramic sea views, perfect for romantic getaways and small family holidays.',
    features: [
      'Panoramic sea views',
      'Private garden',
      'Modern kitchen',
      'Cosy fireplace',
      'Walking distance to beach'
    ],
    nearbyAttractions: [
      'St. Ives Beach (0.2 miles)',
      'Tate St. Ives (0.5 miles)',
      'South West Coast Path',
      'Porthmeor Beach (0.3 miles)'
    ],
    reviews: [
      {
        id: '3',
        author: 'Emma',
        rating: 5.0,
        date: '20th March 2025',
        comment: 'Absolutely breathtaking views and perfect location. Could not have asked for more!'
      }
    ]
  },
  {
    id: 'mountain-lodge',
    name: 'Mountain Lodge',
    location: 'Keswick, Lake District',
    image: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '£650',
    sleeps: 8,
    bedrooms: 4,
    bathrooms: 3,
    dogsAllowed: 4,
    rating: 4.6,
    description: 'A spacious mountain lodge surrounded by stunning fells, ideal for large groups and outdoor enthusiasts.',
    features: [
      'Mountain views',
      'Large dining area',
      'Hot tub',
      'Drying room',
      'Secure bike storage',
      'Log fire'
    ],
    nearbyAttractions: [
      'Derwentwater (1 mile)',
      'Catbells Fell Walk (2 miles)',
      'Keswick Market (1.5 miles)',
      'Theatre by the Lake (1.5 miles)'
    ],
    reviews: [
      {
        id: '4',
        author: 'David',
        rating: 4.6,
        date: '10th February 2025',
        comment: 'Perfect base for hiking. The hot tub after a long day on the fells was amazing!'
      }
    ]
  }
];