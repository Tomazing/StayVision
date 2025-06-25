import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Property } from './types';
import { properties } from './data/properties';
import { HomePage } from './components/HomePage';
import { PropertyDetail } from './components/PropertyDetail';
import { SimulationFlow } from './components/SimulationFlow';

type AppState = 'home' | 'property-detail' | 'simulation';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentState('property-detail');
  };

  const handleStartSimulation = () => {
    setCurrentState('simulation');
  };

  const handleBackToHome = () => {
    setCurrentState('home');
    setSelectedProperty(null);
  };

  const handleBackToProperty = () => {
    setCurrentState('property-detail');
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentState === 'home' && (
          <HomePage
            key="home"
            properties={properties}
            onSelectProperty={handleSelectProperty}
          />
        )}
        
        {currentState === 'property-detail' && selectedProperty && (
          <PropertyDetail
            key="property-detail"
            property={selectedProperty}
            onBack={handleBackToHome}
            onStartSimulation={handleStartSimulation}
          />
        )}
        
        {currentState === 'simulation' && selectedProperty && (
          <SimulationFlow
            key="simulation"
            property={selectedProperty}
            onBack={handleBackToProperty}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;