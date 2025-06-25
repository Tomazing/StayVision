import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, ThumbsUp, ThumbsDown, Star, Clock, MapPin, Utensils, Home, Plane } from 'lucide-react';
import { Property, SimulationResult } from '../types';

interface SimulationResultsProps {
  property: Property;
  result: SimulationResult;
  onBack: () => void;
  onRestart: () => void;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({
  property,
  result,
  onBack,
  onRestart
}) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'arrival': return <Plane className="w-4 h-4" />;
      case 'meal': return <Utensils className="w-4 h-4" />;
      case 'activity': return <MapPin className="w-4 h-4" />;
      case 'rest': return <Home className="w-4 h-4" />;
      case 'departure': return <Plane className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'arrival': return 'text-blue-500 bg-blue-50';
      case 'meal': return 'text-orange-500 bg-orange-50';
      case 'activity': return 'text-green-500 bg-green-50';
      case 'rest': return 'text-purple-500 bg-purple-50';
      case 'departure': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const handleFeedbackSubmit = () => {
    setShowFeedback(true);
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { feedback, rating });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-mint-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Properties
          </motion.button>
          
          <div className="flex gap-3">
            <motion.button
              onClick={onRestart}
              className="px-4 py-2 bg-white border-2 border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
            <motion.button
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>
            <motion.button
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          </div>
        </div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Your Tailored 3-Day StayVision Preview
            </h1>
            <p className="text-lg text-gray-600">
              {property.name} • Mon 21–Thu 24 Jul 2025
            </p>
            <p className="text-gray-500 mt-2">
              For you, your sister, your mum and dad, using public transport, with one home-cooked night and plenty of café & pub stops
            </p>
          </div>
        </motion.div>

        {/* Itinerary */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {result.itinerary.map((day, dayIndex) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.2 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-linear-to-r from-green-500 to-green-600 text-white p-6">
                <h3 className="text-xl font-bold">Day {day.day}</h3>
                <p className="text-green-100">{day.title}</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {day.activities.map((activity, actIndex) => (
                    <motion.div
                      key={actIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (dayIndex * 0.2) + (actIndex * 0.1) }}
                      className="flex gap-3"
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-green-600 text-sm mb-1">
                          {activity.time}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips and Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Personalized Tips</h3>
            <div className="space-y-3">
              {result.personalizedTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Stay Highlights</h3>
            <div className="space-y-3">
              {result.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Star className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                  <p className="text-gray-700 text-sm">{highlight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {!showFeedback ? (
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Did this experience simulation match what you expected?
              </h3>
              
              <div className="flex justify-center gap-4 mb-6">
                <motion.button
                  onClick={() => setFeedback('positive')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                    feedback === 'positive' 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsUp className="w-5 h-5" />
                  Yes, it matched!
                </motion.button>
                
                <motion.button
                  onClick={() => setFeedback('negative')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                    feedback === 'negative' 
                      ? 'bg-red-500 text-white border-red-500' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsDown className="w-5 h-5" />
                  Not quite right
                </motion.button>
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6"
                >
                  <p className="text-gray-600 mb-4">Rate your overall satisfaction (1-10):</p>
                  <div className="flex justify-center gap-2">
                    {[...Array(10)].map((_, i) => (
                      <motion.button
                        key={i + 1}
                        onClick={() => setRating(i + 1)}
                        className={`w-10 h-10 rounded-full border-2 font-semibold transition-all duration-200 ${
                          rating >= i + 1
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {i + 1}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {feedback && rating > 0 && (
                <motion.button
                  onClick={handleFeedbackSubmit}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Submit Feedback
                </motion.button>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Thank you for your feedback!</h3>
              <p className="text-gray-600">
                Your input helps us improve StayVision and create even better personalized experiences.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Check-out Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 p-4 bg-green-50 rounded-xl"
        >
          <p className="text-green-700">
            <strong>Check-out (Thu 24 Jul):</strong> 09:00 Final coffee on the patio – let us know if this simulated stay matched your expectations!
          </p>
          <p className="text-green-600 text-sm mt-2">
            Feel free to tweak any stop—more cafés, gentler walks, extra pub hops—and we'll update your StayVision preview instantly.
          </p>
        </motion.div>
      </div>
    </div>
  );
};