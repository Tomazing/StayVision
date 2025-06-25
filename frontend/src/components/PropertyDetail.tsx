import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Users, Bed, Bath, Dog, MapPin } from 'lucide-react';
import { Property } from '../types';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onStartSimulation: () => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ 
  property, 
  onBack, 
  onStartSimulation 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-linear-to-br from-green-50 to-mint-50"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Properties
        </motion.button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-96">
            <img
              src={property.image}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{property.name}</h1>
              <div className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{property.rating}</span>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-6 mb-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>Sleeps {property.sleeps}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5" />
                    <span>{property.bathrooms} bathrooms</span>
                  </div>
                  {property.dogsAllowed > 0 && (
                    <div className="flex items-center gap-2">
                      <Dog className="w-5 h-5" />
                      <span>{property.dogsAllowed} dogs allowed</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{property.description}</p>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Nearby Attractions</h3>
                  <div className="space-y-2">
                    {property.nearbyAttractions.map((attraction, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{attraction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-green-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    {property.originalPrice && (
                      <span className="text-gray-500 line-through text-lg">Was {property.originalPrice}</span>
                    )}
                    <span className="text-3xl font-bold text-green-600">{property.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Mon 21 July 2025 for 3 nights</p>
                  
                  <motion.button
                    onClick={onStartSimulation}
                    className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🌟 Simulate Your Stay Experience!
                  </motion.button>
                  <p className="text-center text-gray-500 text-xs mt-2">
                    See what your perfect stay could look like
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {property.reviews.slice(0, 2).map((review) => (
                      <div key={review.id} className="border-l-4 border-green-200 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-800">{review.author}</span>
                          <span className="text-gray-500 text-sm">{review.date}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};