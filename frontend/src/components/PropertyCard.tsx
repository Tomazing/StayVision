import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Bed, Bath, Dog } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-green-200"
      whileHover={{ y: -5 }}
      onClick={() => onSelect(property)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{property.rating}</span>
        </div>
        {property.originalPrice && (
          <div className="absolute top-4 left-4 bg-green-500 text-white rounded-lg px-3 py-1">
            <span className="text-sm font-bold">OFFER</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{property.name}</h3>
        <p className="text-gray-600 mb-3">{property.location}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Sleeps {property.sleeps}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} bath</span>
          </div>
          {property.dogsAllowed > 0 && (
            <div className="flex items-center gap-1">
              <Dog className="w-4 h-4" />
              <span>{property.dogsAllowed} dogs</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{property.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {property.originalPrice && (
              <span className="text-gray-400 line-through text-sm">Was {property.originalPrice}</span>
            )}
            <span className="text-2xl font-bold text-green-600">{property.price}</span>
          </div>
          <motion.button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};