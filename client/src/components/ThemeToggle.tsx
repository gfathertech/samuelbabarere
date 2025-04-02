
import { Moon, Sun, Stars } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className={`w-10 h-10 rounded-full overflow-hidden relative transition-all duration-300 
        ${theme === 'dark' 
          ? 'bg-purple-900/30 border-purple-400/30 hover:bg-purple-800/40 hover:border-purple-400/50' 
          : 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
        } ${isAnimating ? 'scale-90' : 'scale-100'}`}
    >
      <div className={`absolute inset-0 transition-opacity duration-500 flex items-center justify-center
        ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/10"></div>
        <Stars className="h-4 w-4 text-purple-300 absolute top-1.5 right-1.5" />
        <Sun className="h-5 w-5 text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
      </div>
      
      <div className={`absolute inset-0 transition-opacity duration-500 flex items-center justify-center
        ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-gray-100/20"></div>
        <Moon className="h-5 w-5 text-blue-700" />
      </div>
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
