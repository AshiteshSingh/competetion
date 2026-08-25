import { useState, useEffect } from 'react';
import './Admin.css';

const DEFAULT_SCORES = {
  yellow: 0,
  blue: 0,
  green: 0,
  red: 0,
};

function Admin() {
  const [scores, setScores] = useState(DEFAULT_SCORES);

  useEffect(() => {
    // Load initial scores from localStorage
    const savedScores = localStorage.getItem('houseScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    } else {
      localStorage.setItem('houseScores', JSON.stringify(DEFAULT_SCORES));
    }
  }, []);

  const updateScore = (house, change) => {
    const newScores = {
      ...scores,
      [house]: Math.max(0, scores[house] + change),
    };
    setScores(newScores);
    localStorage.setItem('houseScores', JSON.stringify(newScores));
  };

  const resetScores = () => {
    if(window.confirm('Are you sure you want to reset all scores?')) {
      setScores(DEFAULT_SCORES);
      localStorage.setItem('houseScores', JSON.stringify(DEFAULT_SCORES));
    }
  }

  return (
    <div className="admin-container">
      <h2>Scoreboard Control Panel</h2>
      <p>Changes here will automatically update the main display screen.</p>
      
      <div className="admin-grid">
        {['yellow', 'blue', 'green', 'red'].map((house) => (
          <div key={house} className={`admin-card ${house}`}>
            <h3>{house.toUpperCase()}</h3>
            <div className="score-control">
              <button onClick={() => updateScore(house, -1)}>-</button>
              <span className="current-score">{scores[house]}</span>
              <button onClick={() => updateScore(house, 1)}>+</button>
            </div>
            <div className="score-control-large">
               <button onClick={() => updateScore(house, 10)}>+10</button>
               <button onClick={() => updateScore(house, -10)}>-10</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="admin-actions">
        <button className="reset-btn" onClick={resetScores}>Reset All Scores</button>
      </div>
    </div>
  );
}

export default Admin;
