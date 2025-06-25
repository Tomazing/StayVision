import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Property, SimulationStep, SimulationResult } from '../types';
import { AwazeLogo } from './AwazeLogo';
import { SimulationResults } from './SimulationResults';

interface SimulationFlowProps {
  property: Property;
  onBack: () => void;
}

const simulationSteps: Omit<SimulationStep, 'userAnswer' | 'isCompleted'>[] = [
  {
    id: 'initial',
    question: `Welcome to StayVision's "Simulate Your Stay" at Wildhouse Farm!\n\nDates: Mon 21 July 2025 – Thu 24 July 2025 (3 nights)\nSleeps: 6 | Bedrooms: 3 | Dogs allowed: up to 3\n\nTo tailor your story-like preview, tell me a bit about your trip:\n• Who's coming? (e.g. family with young kids, friends, couple + dog)\n• What do you love to do? (e.g. hiking, BBQs, local dining)\n• Any special requests or must-haves? (e.g. pet-friendly cafés, cycle storage)`
  },
  {
    id: 'group-size',
    question: 'Great—let\'s tailor your 3-day preview just for you and your parents. A few quick questions:\n\nWill it be just the three of you (no pets or additional guests)?'
  },
  {
    id: 'pace',
    question: 'What pace suits you best—gentle countryside strolls, popping into nearby towns/city, or a mix of both?'
  },
  {
    id: 'dining',
    question: 'Would you prefer cooking/BBQs at the farmhouse or sampling local restaurants for most meals?'
  },
  {
    id: 'transport',
    question: 'Will you have a rental car to drive around, or are you planning to use public transport (trains/buses)?'
  },
  {
    id: 'evening-preference',
    question: 'When you explore local places at night, do you prefer lively pubs/bars and live music, or quieter evening strolls and cosy cafés?'
  },
  {
    id: 'shopping',
    question: 'For the one cooking night, would you like recommendations for nearby markets or farm shops to pick up fresh local produce?'
  }
];

export const SimulationFlow: React.FC<SimulationFlowProps> = ({ property, onBack }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<SimulationStep[]>(
    simulationSteps.map(step => ({ ...step, userAnswer: '', isCompleted: false }))
  );
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const currentStep = steps[currentStepIndex];

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    // Update current step with answer
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      userAnswer: currentAnswer,
      isCompleted: true
    };
    setSteps(updatedSteps);
    setCurrentAnswer('');

    // Show thinking animation
    setIsThinking(true);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsThinking(false);

    // Check if we're at the last step
    if (currentStepIndex === steps.length - 1) {
      // Generate simulation results
      generateSimulationResults();
    } else {
      // Move to next step
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const generateSimulationResults = async () => {
    setIsThinking(true);
    
    // Simulate longer processing for final results
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockResult: SimulationResult = {
      itinerary: [
        {
          day: 1,
          title: 'Graduation & Family Time',
          activities: [
            { time: '14:00', description: 'Arrive by bus from Rochdale station, drop bags in the grand entrance hall, then unwind on the cosy lounge sofas by the wood burner.', type: 'arrival' },
            { time: '15:00', description: 'Light lunch next door at the farmhouse\'s Italian restaurant (fresh pasta & gelato).', type: 'meal' },
            { time: '16:30', description: 'Catch the local bus/train via Manchester to Huddersfield campus for your ceremony—congratulations grad!', type: 'activity' },
            { time: '19:30', description: 'Return to Wildhouse Farm, change into something comfy, then celebrate with a family toast on the patio overlooking the garden.', type: 'rest' },
            { time: '20:00', description: 'Evening stroll through Milnrow village—pop into a friendly local pub ("The White Lion") for a nightcap or a hot chocolate at a riverside café.', type: 'activity' }
          ]
        },
        {
          day: 2,
          title: 'Markets, Lakeside & Mum\'s Feast',
          activities: [
            { time: '08:30', description: 'Breakfast in your farmhouse kitchen (local eggs, homemade preserves).', type: 'meal' },
            { time: '10:00', description: 'Bus to Rochdale Market—pick up Cheshire cheese, local bacon, seasonal veg and artisan bread for tonight\'s dinner.', type: 'activity' },
            { time: '12:00', description: 'Picnic by Hollingworth Lake: gentle lakeside walk, then your market haul on a picnic blanket.', type: 'meal' },
            { time: '14:00', description: 'Short tram ride to Piethorne Valley: easy riverside stroll amid wildflowers.', type: 'activity' },
            { time: '16:00', description: 'Back at the cottage—store boots in the boot room, pour tea in the bay-window dining room, then Mum begins cooking her signature stir-fry with your fresh finds.', type: 'rest' },
            { time: '19:00', description: 'Family dinner around the farmhouse table—share graduation stories as the sun sets.', type: 'meal' },
            { time: '21:00', description: 'Board games or Smart TV movie night by the fire.', type: 'rest' }
          ]
        },
        {
          day: 3,
          title: 'Manchester Highlights & Pubs',
          activities: [
            { time: '09:00', description: 'Quick farmhouse breakfast, then catch the train from Rochdale to Manchester Victoria.', type: 'meal' },
            { time: '10:00', description: 'Northern Quarter coffee at Takk, followed by street-art hunting.', type: 'activity' },
            { time: '12:30', description: 'Lunch at Bundobust (Indian street-food – a UK twist your parents will love).', type: 'meal' },
            { time: '14:00', description: 'Explore the Science & Industry Museum\'s interactive galleries.', type: 'activity' },
            { time: '16:30', description: 'Return to Wildhouse Farm—freshen up in your super-king or twin bedroom.', type: 'rest' },
            { time: '18:00', description: 'Bus into Milnrow for a pint at The White Lion or live-music night at The Hop.', type: 'activity' },
            { time: '20:00', description: 'Stroll back under the stars, then nightcap in the lounge.', type: 'rest' }
          ]
        }
      ],
      personalizedTips: [
        'The Italian restaurant next door offers authentic cuisine your parents will appreciate',
        'Rochdale Market has excellent fresh produce for your mum\'s cooking night',
        'Public transport connections to Manchester are frequent and reliable',
        'The White Lion pub has a welcoming atmosphere for international visitors'
      ],
      highlights: [
        'Perfect blend of family celebration and cultural exploration',
        'Easy access to both countryside and city experiences',
        'Authentic local dining and home cooking opportunities',
        'Comfortable base with all amenities for multi-generational travel'
      ]
    };

    setSimulationResult(mockResult);
    setIsThinking(false);
    setShowResults(true);
  };

  if (showResults && simulationResult) {
    return (
      <SimulationResults
        property={property}
        result={simulationResult}
        onBack={onBack}
        onRestart={() => {
          setShowResults(false);
          setCurrentStepIndex(0);
          setSteps(simulationSteps.map(step => ({ ...step, userAnswer: '', isCompleted: false })));
          setSimulationResult(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-100 via-green-50 to-mint-100 flex flex-col relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-mint-200/30 rounded-full blur-lg"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-green-100/25 rounded-full blur-2xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Property
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-3xl">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <AwazeLogo 
                isThinking={isThinking} 
                size="lg" 
                className="text-green-500 drop-shadow-lg"
              />
            </motion.div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            {!isThinking ? (
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-linear-to-br from-green-400 to-green-500 rounded-full opacity-20 blur-sm" />
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-linear-to-br from-mint-400 to-mint-500 rounded-full opacity-30 blur-sm" />
                
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-green-100/50 relative overflow-hidden">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-br from-green-50/50 to-mint-50/30 rounded-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 bg-linear-to-r from-green-400 to-green-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-linear-to-r from-mint-400 to-mint-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="w-1.5 h-1.5 bg-linear-to-r from-green-300 to-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    <motion.h2 
                      className="text-xl font-semibold text-gray-800 mb-6 whitespace-pre-line leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                      {currentStep.question}
                    </motion.h2>

                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="relative"
                      >
                        <textarea
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder="Share your thoughts here..."
                          className="w-full p-6 border-2 border-green-200/50 rounded-2xl focus:border-green-400 focus:outline-none resize-none h-40 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 shadow-inner"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitAnswer();
                            }
                          }}
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                          Press Enter to continue
                        </div>
                      </motion.div>
                      
                      <motion.button
                        onClick={handleSubmitAnswer}
                        disabled={!currentAnswer.trim()}
                        className="w-full bg-linear-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-300 text-white font-semibold py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform-gpu"
                        whileHover={currentAnswer.trim() ? { 
                          scale: 1.02, 
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                        } : {}}
                        whileTap={currentAnswer.trim() ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        {currentAnswer.trim() && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2"
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.div>
                        )}
                        <Send className="w-5 h-5" />
                        {currentStepIndex === steps.length - 1 ? 'Generate My Stay Experience' : 'Continue Journey'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-green-100/50 relative overflow-hidden"
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-linear-to-r from-green-400 via-mint-400 to-green-400 animate-pulse" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-8">
                    <AwazeLogo isThinking={true} size="lg" className="text-green-500" />
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      {currentStepIndex === steps.length - 1 ? 'Crafting Your Perfect Stay...' : 'Processing Your Answer...'}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                      {currentStepIndex === steps.length - 1 
                        ? 'Creating your personalized day-by-day itinerary with local insights and recommendations.'
                        : 'Our AI is thinking about the perfect follow-up question for you.'
                      }
                    </p>
                  </motion.div>

                  {/* Loading dots */}
                  <div className="flex justify-center gap-2 mt-8">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-linear-to-r from-green-400 to-green-500 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Previous Answers Summary */}
          {currentStepIndex > 0 && !isThinking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 bg-green-50/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100/50"
            >
              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Your Journey So Far
              </h4>
              <div className="space-y-3 text-sm text-green-700">
                {steps.slice(0, currentStepIndex).map((step, index) => (
                  step.isCompleted && (
                    <motion.div 
                      key={step.id} 
                      className="bg-white/60 rounded-lg p-3 border border-green-100/30"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="font-medium text-green-800">Q{index + 1}:</span> {step.userAnswer}
                    </motion.div>
                  )
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};