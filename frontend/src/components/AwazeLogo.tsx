import React from 'react';
import { motion } from 'framer-motion';

interface AwazeLogoProps {
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AwazeLogo: React.FC<AwazeLogoProps> = ({ 
  isThinking = false, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={isThinking ? {
        scale: [1, 1.08, 1],
        opacity: [0.8, 1, 0.8]
      } : {}}
      transition={isThinking ? {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
    >
      <svg
        viewBox="0 0 158.663 157.864"
        className="w-full h-full"
        fill="currentColor"
      >
        <defs>
          <clipPath id="clip-path">
            <rect width="158.663" height="157.864" fill="#acc280" />
          </clipPath>
        </defs>
        <g clipPath="url(#clip-path)">
          <path
            d="M143.545,32.374A79.233,79.233,0,0,0,87.436.016a32.958,32.958,0,0,0,30.817,44.325,32.7,32.7,0,0,0,25.293-11.967m15.118,46.562A78.979,78.979,0,0,0,151.589,46.2a32.994,32.994,0,0,0,.148,65.146,79,79,0,0,0,6.926-32.41M85.413,146.2a32.964,32.964,0,0,0,2.146,11.646,79.235,79.235,0,0,0,56.116-32.528A32.8,32.8,0,0,0,85.413,146.2M71.288,157.862A32.97,32.97,0,0,0,40.6,113.183a32.676,32.676,0,0,0-25.517,12.26,79.216,79.216,0,0,0,56.2,32.419M6.929,111.346A32.994,32.994,0,0,0,7.075,46.2a79.268,79.268,0,0,0-.145,65.146M73.438,11.329A33,33,0,0,0,71.409,0a79.226,79.226,0,0,0-56.2,32.249A32.681,32.681,0,0,0,40.6,44.341,32.921,32.921,0,0,0,73.438,11.329"
            fill="#acc280"
          />
        </g>
      </svg>
    </motion.div>
  );
};