import { useEffect, useRef } from 'react';

const CursorGlow = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let targetX = 0;
    let targetY = 0;
    
    // Track mouse position
    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      
      // Request animation frame for smooth, GPU-accelerated rendering
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updatePosition);
      }
    };

    const updatePosition = () => {
      if (glowRef.current) {
        // Offset top-left corner by +10px X and +10px Y to place the entire orb cleanly in the bottom-right.
        glowRef.current.style.transform = `translate3d(${targetX + 10}px, ${targetY + 10}px, 0)`;
      }
      animationFrameId = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-50 h-32 w-32 rounded-full bg-gradient-to-r from-brand to-accent opacity-80 blur-[40px] transition-opacity duration-300 will-change-transform dark:opacity-50"
      style={{
        transform: 'translate3d(-1000px, -1000px, 0)', // Hide initially offscreen
      }}
    />
  );
};

export default CursorGlow;
