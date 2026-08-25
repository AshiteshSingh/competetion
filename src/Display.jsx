import { useState, useEffect, useRef } from 'react';
import './Scoreboard.css';

const DEFAULT_SCORES = {
  red: 0,
  blue: 0,
  yellow: 0,
  green: 0,
};

function AnimatedNumber({ value, className }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (value !== displayValue) {
      setIsUpdating(true);
      setDisplayValue(value);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsUpdating(false);
      }, 300);
    }
  }, [value, displayValue]);

  return (
    <div className={`${className} ${isUpdating ? 'flash' : ''}`}>
      {displayValue}
    </div>
  );
}

function Display() {
  const [scores, setScores] = useState(DEFAULT_SCORES);

  useEffect(() => {
    const savedScores = localStorage.getItem('houseScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }

    const handleStorageChange = (e) => {
      if (e.key === 'houseScores') {
        setScores(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="fullscreen-container">
      {/* Background Graphic Elements */}
      <div className="bg-pattern"></div>
      <div className="bg-glow"></div>
      
      <div className="board-header">
        <h1>INTER-HOUSE SCORE</h1>
      </div>

      <div className="grid-container">
        
        {/* Top Left: RED */}
        <div className="grid-cell red-cell">
          <div className="house-name">RED</div>
          <div className="score-box">
             <AnimatedNumber value={scores.red || 0} className="score-value" />
          </div>
        </div>

        {/* Top Right: BLUE */}
        <div className="grid-cell blue-cell">
          <div className="house-name">BLUE</div>
          <div className="score-box">
             <AnimatedNumber value={scores.blue || 0} className="score-value" />
          </div>
        </div>

        {/* Bottom Left: YELLOW */}
        <div className="grid-cell yellow-cell">
          <div className="house-name">YELLOW</div>
          <div className="score-box">
             <AnimatedNumber value={scores.yellow || 0} className="score-value" />
          </div>
        </div>

        {/* Bottom Right: GREEN */}
        <div className="grid-cell green-cell">
          <div className="house-name">GREEN</div>
          <div className="score-box">
             <AnimatedNumber value={scores.green || 0} className="score-value" />
          </div>
        </div>

        {/* Crosshair Dividers */}
        <div className="divider-vertical"></div>
        <div className="divider-horizontal"></div>
      </div>
    </div>
  );
}

export default Display;
