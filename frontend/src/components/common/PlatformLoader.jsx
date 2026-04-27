import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PlatformLoader = ({ onAnimationComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [dots, setDots] = useState('');
  const [showDots, setShowDots] = useState(false);

  const fullText = 'Protein Lab';
  const LETTER_DELAY = 120; // milliseconds between each letter
  const DOTS_DELAY = 400; // milliseconds between dot changes
  const DOT_CYCLES = 3; // Number of complete dot cycles before signaling completion

  useEffect(() => {
    // Animate letters one by one
    let currentIndex = 0;
    const letterInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(letterInterval);
        setShowDots(true);
      }
    }, LETTER_DELAY);

    return () => clearInterval(letterInterval);
  }, []);

  useEffect(() => {
    if (!showDots) return;

    // Animate dots: . → .. → ... → . (loop)
    let dotCount = 0;
    let cyclesCompleted = 0;
    
    const dotsInterval = setInterval(() => {
      dotCount = (dotCount % 3) + 1;
      setDots('.'.repeat(dotCount));
      
      // When we complete a cycle (back to 1 dot), increment counter
      if (dotCount === 1) {
        cyclesCompleted++;
        
        // After 3 complete cycles, signal completion
        if (cyclesCompleted >= DOT_CYCLES && onAnimationComplete) {
          clearInterval(dotsInterval);
          // Small delay to show the final state before completing
          setTimeout(() => {
            onAnimationComplete();
          }, 100);
        }
      }
    }, DOTS_DELAY);

    return () => clearInterval(dotsInterval);
  }, [showDots, onAnimationComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.span
          key={displayText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-5xl md:text-6xl font-bold text-primary"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {displayText}
        </motion.span>
        {showDots && (
          <motion.span
            key={dots}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-primary ml-2"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {dots}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PlatformLoader;





