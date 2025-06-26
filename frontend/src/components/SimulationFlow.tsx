import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Property, SimulationStep, SimulationResult } from '../types';
import { AwazeLogo } from './AwazeLogo';
import { SimulationResults } from './SimulationResults';
import { simulationService } from '../services/simulationService';
import { getInitialSystemPrompt, getFollowUpQuestionsPrompt, getFinalPrompt } from '../prompts/simulationPrompts';

interface SimulationFlowProps {
  property: Property;
  onBack: () => void;
}

export const SimulationFlow: React.FC<SimulationFlowProps> = ({ property, onBack }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStepId, setCurrentStepId] = useState('initial');
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false); // Start without thinking state
  const [showResults, setShowResults] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showIntroduction, setShowIntroduction] = useState(true); // Start with introduction visible

  const currentStep = steps[currentStepIndex];

  const initializeSimulation = async () => {
    // Create the initial system prompt
    const initialSystemPrompt = getInitialSystemPrompt(property);

    setIsThinking(true);

    try {
      const response = await simulationService.getLLMResponse(property.id, initialSystemPrompt);
      
      if (response.success) {
        // Set the initial step from the API response
        const initialStep = {
          id: response.step || 'initial',
          question: response.question || '',
          userAnswer: '',
          isCompleted: false
        };
        
        setSteps([initialStep]);
        setCurrentStepId(response.step || 'initial');
      }
    } catch (error) {
      console.error('Failed to initialize simulation:', error);
      setApiError('Could not start the simulation. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleFollowUpQuestions = async () => {
    if (!currentAnswer.trim() || !currentStep) return;

    // Update current step with answer
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      userAnswer: currentAnswer,
      isCompleted: true
    };
    setSteps(updatedSteps);
    
    // Update all answers record
    const updatedAnswers = { ...allAnswers, [currentStepId]: currentAnswer };
    setAllAnswers(updatedAnswers);
    
    setCurrentAnswer('');
    setIsThinking(true);

    try {
      // Extract the questions from the steps
      const questions = steps.map(step => step.question);
      
      // Create the follow-up questions prompt
      const followUpQuestionsPrompt = getFollowUpQuestionsPrompt(property, updatedAnswers, questions, currentStepIndex);

      const response = await simulationService.getLLMResponse(property.id, followUpQuestionsPrompt);
      
      if (response.success) {
        const responseText = response.question || '';
        
        // Check if the response indicates we're ready to generate the experience
        // Or if we've already reached the maximum of 3 follow-up questions
        if (responseText.includes("ready to generate your staying experience") || currentStepIndex >= 3) {
          // Generate final simulation results
          const finalPrompt = getFinalPrompt(property, updatedAnswers);
          
          // Get LLM response with the final prompt
          const finalResponse = await simulationService.getLLMResponse(property.id, finalPrompt);
          
          if (finalResponse.success) {
            try {
              // Try to parse the response as a SimulationResult
              let resultData: SimulationResult;
              
              if (finalResponse.results) {
                // If the API already returned structured results, use them
                resultData = finalResponse.results;
              } else if (finalResponse.question) {
                // If we got a text response, try to parse it as JSON
                // First, try to extract JSON if it's wrapped in markdown code blocks
                let jsonText = finalResponse.question;

                const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                  jsonText = jsonMatch[1];
                }
                // Parse the JSON
                resultData = JSON.parse(jsonText);

                console.log(resultData);
                
                // Save parsed JSON for debugging
                // const saveJsonForDebugging = (text: any, filename = 'parsed-result.json') => {
                //   const blob = new Blob([typeof text === 'string' ? text : JSON.stringify(text, null, 2)], { type: 'application/json' });
                //   const url = URL.createObjectURL(blob);
                //   const a = document.createElement('a');
                //   a.href = url;
                //   a.download = filename;
                //   document.body.appendChild(a);
                //   a.click();
                //   document.body.removeChild(a);
                //   URL.revokeObjectURL(url);
                // };
                // saveJsonForDebugging(resultData, 'parsed-simulation-result.json');
                
                // Validate the structure
                if (!resultData.itinerary || !Array.isArray(resultData.itinerary) || 
                    !resultData.personalizedTips || !Array.isArray(resultData.personalizedTips) ||
                    !resultData.highlights || !Array.isArray(resultData.highlights)) {
                  throw new Error("Invalid response structure");
                }
              } else {
                throw new Error("No results returned from API");
              }
              
              // Set the simulation result and show the results
              console.log('Setting simulation result and showing results:', resultData);
              setSimulationResult(resultData);
              setShowResults(true);
              // console.log('State after setting:', { showResults: true, simulationResult: resultData });
            } catch (error) {
              console.error('Error parsing simulation results:', error);
              setApiError('Unable to generate your itinerary. Please try again.');
            }
          }
        } else {
          // We need more information, so add a new step with the follow-up question
          const newStep = {
            id: `step-${currentStepIndex + 1}`,
            question: responseText,
            userAnswer: '',
            isCompleted: false
          };
          
          // Add the new step to the steps
          const newSteps = [...updatedSteps, newStep];
          setSteps(newSteps);
          
          // Move to the next step
          setCurrentStepIndex(currentStepIndex + 1);
          setCurrentStepId(newStep.id);
        }
      }
    } catch (error) {
      console.error('Error in follow-up question flow:', error);
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-100 via-green-50 to-mint-100 flex flex-col relative overflow-hidden">
      {showResults && simulationResult ? (
        <SimulationResults
          property={property}
          result={simulationResult}
          onBack={onBack}
          onRestart={() => {
            setShowResults(false);
            setShowIntroduction(true);
            setSimulationResult(null);
            setSteps([]);
            setCurrentStepIndex(0);
            setCurrentStepId('initial');
            setAllAnswers({});
          }}
        />
      ) : (
        <>
          {/* Error Message Display */}
      {apiError && (
        <div className="absolute top-24 left-0 right-0 mx-auto w-max z-50">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {apiError}
            <button 
              onClick={() => setApiError(null)} 
              className="ml-3 text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}

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

          <AnimatePresence mode="wait">
            {showIntroduction ? (
              <motion.div
                key="introduction"
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
                    <motion.h2 
                      className="text-3xl font-bold text-green-600 mb-4 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                      Welcome to StayVision!
                    </motion.h2>
                    
                    <motion.p
                      className="text-gray-700 mb-8 text-center text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      Experience your perfect stay at {property.name} before you book
                    </motion.p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <motion.div 
                        className="bg-green-50 p-6 rounded-2xl text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Send className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Share Preferences</h3>
                        <p className="text-gray-600 text-sm">Tell us about your ideal vacation at this property</p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-green-50 p-6 rounded-2xl text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">AI Magic</h3>
                        <p className="text-gray-600 text-sm">Our AI concierge crafts a personalized experience</p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-green-50 p-6 rounded-2xl text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ArrowLeft className="w-6 h-6 text-green-600" style={{ transform: 'rotate(180deg)' }} />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Explore Itinerary</h3>
                        <p className="text-gray-600 text-sm">Get a 3-day plan with activities tailored to you</p>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                      className="text-center"
                    >
                      <motion.button
                        onClick={() => {
                          setShowIntroduction(false);
                          setIsThinking(true);
                          // Start the simulation only when the button is clicked
                          initializeSimulation();
                        }}
                        className="bg-linear-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white font-semibold py-5 px-12 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 mx-auto shadow-lg hover:shadow-xl"
                        whileHover={{ 
                          scale: 1.05, 
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Sparkles className="w-5 h-5" />
                        Begin Your Experience
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {!isThinking ? (
                  steps.length > 0 && currentStep ? (
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
                                  handleFollowUpQuestions();
                                }
                              }}
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                              Press Enter to continue
                            </div>
                          </motion.div>
                          
                          <motion.button
                            onClick={handleFollowUpQuestions}
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
                            Generate My Stay Experience
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  ) : null
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
                          Crafting Your Perfect Stay...
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                          Creating your personalized day-by-day itinerary with local insights and recommendations.
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
            )}
          </AnimatePresence>

          {/* Previous Answers Summary */}
          {currentStepIndex > 0 && !isThinking && !showIntroduction && (
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
      </>
      )}
    </div>
  );
};