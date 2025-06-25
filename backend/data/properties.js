import { Property } from '../models/index.js';

export const properties = [
  new Property(
    'wildhouse-farm',
    'Wildhouse Farm',
    'Milnrow, near Rochdale, Manchester',
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    '£778',
    '£860',
    6,
    3,
    2,
    3,
    4.7,
    'This cosy yet spacious farmhouse provides the idyllic base for families, couples and their four-legged friends to relax in comfort and explore the local area. Situated next to the owners Italian Restaurant, nip next door for a delicious bite to eat and give the chefs of the group the evening off.',
    [
      'Wood burner in lounge',
      'Fully equipped farmhouse kitchen',
      'Four-poster super-king bedroom',
      'Italian restaurant next door',
      'Vast garden with BBQ',
      'Boot room for cyclists'
    ],
    [
      'Hollingworth Lake (2 miles)',
      'Piethorne Valley Country Park (3 miles)',
      'Peak District National Park (10 miles)',
      'Manchester City Centre (15 miles)'
    ],
    [
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
  ),
  new Property(
    'coastal-retreat',
    'Coastal Retreat',
    'St. Ives, Cornwall',
    'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    '£920',
    null,
    4,
    2,
    1,
    2,
    4.9,
    'A stunning coastal cottage with panoramic sea views, perfect for romantic getaways and small family holidays.',
    [
      'Panoramic sea views',
      'Private garden',
      'Modern kitchen',
      'Cosy fireplace',
      'Walking distance to beach'
    ],
    [
      'St. Ives Beach (0.2 miles)',
      'Tate St. Ives (0.5 miles)',
      'South West Coast Path',
      'Porthmeor Beach (0.3 miles)'
    ],
    [
      {
        id: '3',
        author: 'Emma',
        rating: 5.0,
        date: '20th March 2025',
        comment: 'Absolutely breathtaking views and perfect location. Could not have asked for more!'
      }
    ]
  ),
  new Property(
    'mountain-lodge',
    'Mountain Lodge',
    'Keswick, Lake District',
    'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
    '£650',
    null,
    8,
    4,
    3,
    4,
    4.6,
    'A spacious mountain lodge surrounded by stunning fells, ideal for large groups and outdoor enthusiasts.',
    [
      'Mountain views',
      'Large dining area',
      'Hot tub',
      'Drying room',
      'Secure bike storage',
      'Log fire'
    ],
    [
      'Derwentwater (1 mile)',
      'Catbells Fell Walk (2 miles)',
      'Keswick Market (1.5 miles)',
      'Theatre by the Lake (1.5 miles)'
    ],
    [
      {
        id: '4',
        author: 'David',
        rating: 4.6,
        date: '10th February 2025',
        comment: 'Perfect base for hiking. The hot tub after a long day on the fells was amazing!'
      }
    ]
  )
];

export const getPropertyById = (id) => {
  return properties.find(property => property.id === id) || null;
};
