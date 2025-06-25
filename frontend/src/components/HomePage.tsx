import React from 'react';
import { motion } from 'framer-motion';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { AwazeLogo } from './AwazeLogo';

interface HomePageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ properties, onSelectProperty }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-mint-50 to-green-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AwazeLogo size="sm" className="text-green-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">StayVision</h1>
                <p className="text-sm text-gray-600">by Awaze</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Experience Your Stay</p>
              <p className="text-xs text-gray-500">Before You Book</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Simulate Your Perfect Stay
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience your holiday before you book. Our AI creates personalized day-by-day previews 
            tailored to your interests, travel style, and preferences.
          </p>
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Personalized Experience</h3>
                  <p className="text-sm text-gray-600">Tailored to your group & interests</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Instant Results</h3>
                  <p className="text-sm text-gray-600">Get your itinerary in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Adjustable</h3>
                  <p className="text-sm text-gray-600">Tweak and refine on the fly</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Properties Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Choose a Property to Simulate Your Stay
          </h3>
          <p className="text-center text-gray-600 mb-12">
            Select from our featured properties and discover what your perfect holiday could look like
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
              >
                <PropertyCard
                  property={property}
                  onSelect={onSelectProperty}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-3xl shadow-xl p-12"
        >
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How StayVision Works
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Choose Property</h4>
              <p className="text-gray-600 text-sm">Select a property that catches your eye</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Tell Us About You</h4>
              <p className="text-gray-600 text-sm">Share your travel style and preferences</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">AI Magic</h4>
              <p className="text-gray-600 text-sm">Our AI creates your personalized itinerary</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Experience Preview</h4>
              <p className="text-gray-600 text-sm">See your perfect stay come to life</p>
            </div>
          </div>
        </motion.section>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <AwazeLogo size="sm" className="text-green-400" />
            <div>
              <h3 className="text-xl font-bold">StayVision</h3>
              <p className="text-gray-400 text-sm">Powered by Awaze</p>
            </div>
          </div>
          <p className="text-center text-gray-400">
            © 2025 Awaze. Experience your stay before you book.
          </p>
        </div>
      </footer>
    </div>
  );
};