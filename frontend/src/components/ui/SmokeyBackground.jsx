import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const blurToClass = {
  none: 'blur-0',
  sm: 'blur-sm',
  md: 'blur-md',
  lg: 'blur-lg',
  xl: 'blur-xl',
};

function SmokeyBackground({ backdropBlurAmount = 'xl', color = '#40EE45', className = '' }) {
  const blurClass = blurToClass[backdropBlurAmount] || blurToClass.xl;
  // Convert green to cyan/teal for true smokey effect (like Lightswind)
  const smokeyColor = color === '#40EE45' ? '#00F5FF' : color;

  const content = (
    <div className={`pointer-events-none fixed inset-0 -z-50 ${className}`} aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -50 }}>
      {/* Dark black base layer */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Animated smokey layers with cyan/teal glow */}
      <div className={`absolute inset-0 ${blurClass} overflow-hidden`}>
        {/* Rotating conic gradient smoke wisps */}
        <div 
          className="absolute inset-0 animate-[smoke-rotate_60s_linear_infinite] opacity-70"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, ${smokeyColor}40 0deg, transparent 90deg, rgba(255,255,255,0.1) 180deg, transparent 270deg)`,
          }}
        />
        <div 
          className="absolute inset-0 animate-[smoke-rotate-rev_80s_linear_infinite] opacity-60 mix-blend-screen"
          style={{
            background: `conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0.15) 0deg, transparent 120deg, ${smokeyColor}50 240deg, transparent 300deg)`,
          }}
        />
        
        {/* Drifting radial smoke blobs */}
        <div 
          className="absolute w-[800px] h-[800px] -left-[400px] -top-[400px] rounded-full animate-[smoke-drift-1_100s_ease-in-out_infinite] opacity-40"
          style={{ background: `radial-gradient(circle, ${smokeyColor}60, transparent 70%)` }}
        />
        <div 
          className="absolute w-[1000px] h-[1000px] -right-[500px] top-1/4 rounded-full animate-[smoke-drift-2_120s_ease-in-out_infinite] opacity-35"
          style={{ background: `radial-gradient(circle, ${smokeyColor}50, transparent 70%)` }}
        />
        <div 
          className="absolute w-[900px] h-[900px] left-1/3 -bottom-[450px] rounded-full animate-[smoke-drift-3_110s_ease-in-out_infinite] opacity-38"
          style={{ background: `radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)` }}
        />
        
        {/* Additional glowing wisps */}
        <div 
          className="absolute w-[700px] h-[700px] right-1/4 top-1/2 rounded-full animate-[smoke-drift-4_130s_ease-in-out_infinite] opacity-32"
          style={{ background: `radial-gradient(circle, ${smokeyColor}40, transparent 65%)` }}
        />
      </div>

      <style>
        {`
          @keyframes smoke-rotate {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
          @keyframes smoke-rotate-rev {
            0% { transform: rotate(360deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.15); }
            100% { transform: rotate(0deg) scale(1); }
          }
          @keyframes smoke-drift-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(300px, 200px) scale(1.2); }
            66% { transform: translate(-200px, 300px) scale(0.9); }
          }
          @keyframes smoke-drift-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-400px, 250px) scale(1.15); }
            66% { transform: translate(200px, -300px) scale(0.95); }
          }
          @keyframes smoke-drift-3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(250px, -350px) scale(1.1); }
            66% { transform: translate(-300px, 200px) scale(1.05); }
          }
          @keyframes smoke-drift-4 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-250px, 400px) scale(1.18); }
            66% { transform: translate(350px, -200px) scale(0.92); }
          }
        `}
      </style>
    </div>
  );

  // Render directly to body using portal for full coverage
  if (typeof window !== 'undefined') {
    return createPortal(content, document.body);
  }
  
  return content;
}

SmokeyBackground.propTypes = {
  backdropBlurAmount: PropTypes.oneOf(['none','sm','md','lg','xl']),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default SmokeyBackground;
