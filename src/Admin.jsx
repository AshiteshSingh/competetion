import { useState, useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { HouseIcon } from './HouseIcons';
import { soundFX } from './sound';
import './Admin.css';

const DEFAULT_SCORES = {
  red: 0,
  blue: 0,
  yellow: 0,
  green: 0,
};

const HOUSES = [
  { key: 'red', name: 'RED', color: '#dc322f' },
  { key: 'blue', name: 'BLUE', color: '#268bd2' },
  { key: 'yellow', name: 'YELLOW', color: '#b58900' },
  { key: 'green', name: 'GREEN', color: '#859900' },
];

export default function Admin() {
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualInputs, setManualInputs] = useState({ red: '', blue: '', yellow: '', green: '' });
  const channelRef = useRef(null);

  useEffect(() => {
    // Setup BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('scoreboard_sync_channel');
    }

    try {
      const savedScores = localStorage.getItem('houseScores');
      if (savedScores) setScores(JSON.parse(savedScores));

      const savedSound = localStorage.getItem('scoreboardSound');
      if (savedSound !== null) {
        const enabled = savedSound === 'true';
        setSoundEnabled(enabled);
        soundFX.enabled = enabled;
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (channelRef.current) channelRef.current.close();
    };
  }, []);

  const broadcastScores = (newScores) => {
    setScores(newScores);
    localStorage.setItem('houseScores', JSON.stringify(newScores));
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'UPDATE_SCORES', scores: newScores });
    }
  };

  const updateScore = (house, change) => {
    const current = Number(scores[house]) || 0;
    const newScore = Math.max(0, current + change);
    const newScores = { ...scores, [house]: newScore };
    broadcastScores(newScores);

    if (change > 0 && soundEnabled) {
      soundFX.playScoreUp();
    }
  };

  const setExactScore = (house) => {
    const val = parseInt(manualInputs[house], 10);
    if (!isNaN(val) && val >= 0) {
      const newScores = { ...scores, [house]: val };
      broadcastScores(newScores);
      setManualInputs({ ...manualInputs, [house]: '' });
      if (soundEnabled) soundFX.playScoreUp();
    }
  };

  const triggerConfettiBlast = () => {
    localStorage.setItem('triggerConfetti', String(Date.now()));
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'CONFETTI' });
    }
    if (soundEnabled) soundFX.playCelebration();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    localStorage.setItem('scoreboardSound', String(next));
  };

  const resetAllScores = () => {
    if (window.confirm('⚠️ Are you sure you want to reset all house scores back to ZERO?')) {
      broadcastScores(DEFAULT_SCORES);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>SCOREBOARD OPERATOR CONSOLE</h1>
          <p>Real-time Control Panel &bull; Auto-syncs with Main Display</p>
        </div>

        <div className="admin-header-actions">
          <button className="cyber-btn sound-btn" onClick={toggleSound}>
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>{soundEnabled ? 'SOUND ON' : 'MUTED'}</span>
          </button>

          <button className="cyber-btn confetti-btn" onClick={triggerConfettiBlast}>
            <Sparkles size={18} />
            <span>TRIGGER CONFETTI</span>
          </button>

          <a href="/" target="_blank" rel="noreferrer" className="cyber-btn live-btn">
            <ExternalLink size={18} />
            <span>OPEN DISPLAY</span>
          </a>
        </div>
      </header>

      {/* 4 House Score Controls */}
      <div className="admin-score-grid">
        {HOUSES.map(({ key, name, color }) => {
          const score = scores[key] || 0;

          return (
            <div key={key} className={`admin-house-card ${key}-card`} style={{ '--house-theme': color }}>
              <div className="card-top">
                <div className="house-tag-pill">
                  <HouseIcon house={key} className="house-icon-mini" />
                  <span className="house-code-label">{name}</span>
                </div>
                <h2 className="admin-house-name">{name} HOUSE</h2>
              </div>

              {/* Current Score Display */}
              <div className="score-big-vault">
                <span className="vault-number">{score}</span>
                <span className="vault-label">CURRENT POINTS</span>
              </div>

              {/* Fast Presets */}
              <div className="control-button-cluster">
                <div className="btn-row plus-row">
                  <button className="score-step-btn add" onClick={() => updateScore(key, 1)}>+1</button>
                  <button className="score-step-btn add" onClick={() => updateScore(key, 5)}>+5</button>
                  <button className="score-step-btn add" onClick={() => updateScore(key, 10)}>+10</button>
                  <button className="score-step-btn add" onClick={() => updateScore(key, 25)}>+25</button>
                  <button className="score-step-btn add high" onClick={() => updateScore(key, 50)}>+50</button>
                  <button className="score-step-btn add high" onClick={() => updateScore(key, 100)}>+100</button>
                </div>

                <div className="btn-row minus-row">
                  <button className="score-step-btn sub" onClick={() => updateScore(key, -1)}>-1</button>
                  <button className="score-step-btn sub" onClick={() => updateScore(key, -5)}>-5</button>
                  <button className="score-step-btn sub" onClick={() => updateScore(key, -10)}>-10</button>
                  <button className="score-step-btn sub" onClick={() => updateScore(key, -25)}>-25</button>
                </div>
              </div>

              {/* Direct Number Input */}
              <div className="manual-set-row">
                <input
                  type="number"
                  placeholder="Enter exact score..."
                  value={manualInputs[key]}
                  onChange={(e) => setManualInputs({ ...manualInputs, [key]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setExactScore(key);
                  }}
                />
                <button onClick={() => setExactScore(key)}>SET</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Reset Action */}
      <footer className="admin-footer-bar">
        <button className="danger-reset-btn" onClick={resetAllScores}>
          <RotateCcw size={18} />
          <span>RESET ALL SCORES TO ZERO</span>
        </button>
      </footer>
    </div>
  );
}
