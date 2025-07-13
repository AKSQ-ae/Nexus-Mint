import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export const SplashScreen = ({ onComplete, duration = 2000 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary safe-area-top safe-area-bottom">
      <div className="text-center">
        {/* NEXUS MINT Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-white">NEXUS</span>
            <span className="text-orange-400"> MINT</span>
          </h1>
          <p className="text-blue-100 text-sm font-medium">
            Own • Earn • Multiply
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
          <span className="text-white font-medium">Loading...</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-48 h-1 bg-blue-400/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
            style={{
              width: '100%',
              animation: `progress-fill ${duration}ms ease-out forwards`
            }}
          />
        </div>
      </div>
    </div>
  );
};