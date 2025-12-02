// src/components/BackgroundEffects.tsx
import { useEffect } from "react";
import { Waves, Sparkles, Droplets, Fish } from "lucide-react";

interface BackgroundEffectsProps {
  intensity?: "low" | "medium" | "high";
  showIcons?: boolean;
}

const BackgroundEffects = ({ 
  intensity = "medium", 
  showIcons = true 
}: BackgroundEffectsProps) => {
  const intensityLevels = {
    low: { blur: "blur-2xl", opacity: "opacity-5", count: 2 },
    medium: { blur: "blur-3xl", opacity: "opacity-10", count: 3 },
    high: { blur: "blur-3xl", opacity: "opacity-15", count: 4 }
  };

  const { blur, opacity, count } = intensityLevels[intensity];

  useEffect(() => {
    const createWaterRipples = () => {
      const container = document.querySelector('.water-ripples-container');
      if (!container) return;
      
      const oldRipples = container.querySelectorAll('.water-ripple');
      oldRipples.forEach(r => r.remove());
      
      for (let i = 0; i < count; i++) {
        const ripple = document.createElement('div');
        ripple.className = `water-ripple absolute rounded-full ${opacity}`;
        ripple.style.background = `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`;
        ripple.style.width = `${Math.random() * 200 + 100}px`;
        ripple.style.height = ripple.style.width;
        ripple.style.animation = `waterRipple ${Math.random() * 4 + 3}s infinite ease-out`;
        ripple.style.animationDelay = `${Math.random() * 2}s`;
        ripple.style.top = `${Math.random() * 100}%`;
        ripple.style.left = `${Math.random() * 100}%`;
        container.appendChild(ripple);
      }
    };
    
    createWaterRipples();
    const interval = setInterval(createWaterRipples, 5000);
    
    return () => clearInterval(interval);
  }, [count, opacity]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br 
                      from-background via-primary/5 to-background" />
        
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] 
                       bg-primary/5 rounded-full ${blur} ${opacity}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[600px] h-[600px] 
                       bg-accent/5 rounded-full ${blur} ${opacity}`} />
        
        <div className="water-ripples-container absolute inset-0" />
        
        <div className={`absolute top-1/3 left-1/3 w-[300px] h-[300px] 
                       bg-secondary/5 rounded-full ${blur} ${opacity}`} />
        
        
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_70%)] opacity-[0.02]" />
      </div>
      
      <style>{`
        @keyframes waterRipple {
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { opacity: 0.1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default BackgroundEffects;