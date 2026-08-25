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

// Generates falling rain/particles in the background of each house cell
function RainingParticles({ color }) {
  // Generate random particles once on mount
  const particles = useRef(
    Array.from({ length: 15 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDuration: `${1.5 + Math.random() * 2}s`,
      animationDelay: `${Math.random() * 2}s`,
      '--drop-opacity': 0.2 + Math.random() * 0.6,
      width: `${2 + Math.random() * 3}px`,
      height: `${15 + Math.random() * 30}px`,
    }))
  ).current;

  return (
    <div className="rain-container">
      {particles.map((style, i) => (
        <div key={i} className="rain-drop" style={{ ...style, backgroundColor: color, color: color }} />
      ))}
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
          <RainingParticles color="#ff5252" />
          <div className="house-name">RED</div>
          <div className="score-box">
             <AnimatedNumber value={scores.red || 0} className="score-value" />
          </div>
        </div>

        {/* Top Right: BLUE */}
        <div className="grid-cell blue-cell">
          <RainingParticles color="#4facfe" />
          <div className="house-name">BLUE</div>
          <div className="score-box">
             <AnimatedNumber value={scores.blue || 0} className="score-value" />
          </div>
        </div>

        {/* Bottom Left: YELLOW */}
        <div className="grid-cell yellow-cell">
          <RainingParticles color="#ffeaa7" />
          <div className="house-name">YELLOW</div>
          <div className="score-box">
             <AnimatedNumber value={scores.yellow || 0} className="score-value" />
          </div>
        </div>

        {/* Bottom Right: GREEN */}
        <div className="grid-cell green-cell">
          <RainingParticles color="#55efc4" />
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
