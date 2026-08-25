import { useState, useEffect, useRef } from 'react';
import './Scoreboard.css';

const DEFAULT_SCORES = {
  yellow: 0,
  blue: 0,
  green: 0,
  red: 0,
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
      }, 300); // flash duration
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
    <div className="broadcast-container">
      {/* Background Graphic Elements */}
      <div className="bg-pattern"></div>
      <div className="bg-glow"></div>
      
      <div className="scoreboard-wrapper">
        
        {/* Header Ribbon */}
        <div className="header-ribbon">
          <div className="header-text">INTER-HOUSE CHAMPIONSHIP</div>
        </div>

        {/* Main Score Area */}
        <div className="teams-container">
          
          <div className="team-panel yellow-team">
            <div className="team-name">YELLOW</div>
            <div className="score-box">
              <AnimatedNumber value={scores.yellow} className="score-value" />
            </div>
            <div className="accent-bar"></div>
          </div>

          <div className="team-panel blue-team">
             <div className="team-name">BLUE</div>
             <div className="score-box">
               <AnimatedNumber value={scores.blue} className="score-value" />
             </div>
             <div className="accent-bar"></div>
          </div>

          {/* Central Divider / Logo Area */}
          <div className="center-divider">
            <div className="vs-badge">VS</div>
          </div>

          <div className="team-panel green-team">
             <div className="score-box">
               <AnimatedNumber value={scores.green} className="score-value" />
             </div>
             <div className="team-name">GREEN</div>
             <div className="accent-bar"></div>
          </div>

          <div className="team-panel red-team">
             <div className="score-box">
               <AnimatedNumber value={scores.red} className="score-value" />
             </div>
             <div className="team-name">RED</div>
             <div className="accent-bar"></div>
          </div>
          
        </div>
        
        {/* Footer Ribbon */}
        <div className="footer-ribbon">
          <div className="footer-content">LIVE</div>
          <div className="pulsing-dot"></div>
        </div>

      </div>
    </div>
  );
}

export default Display;
