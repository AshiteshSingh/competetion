import { useState, useEffect } from 'react';
import { Plus, Minus, RotateCcw, Sparkles, ExternalLink, Volume2, VolumeX, Edit3, Check } from 'lucide-react';
import { HouseIcon } from './HouseIcons';
import { soundFX } from './sound';
import './Admin.css';

const DEFAULT_CONFIG = {
  eventName: 'INTER-HOUSE CHAMPIONSHIP',
  subtitle: 'ANNUAL SPORTS & ACADEMIC COMPETITION 2026',
  houseNames: {
    red: 'RED PHOENIX',
    blue: 'BLUE TITANS',
    yellow: 'YELLOW SUNS',
    green: 'GREEN HYDRAS',
  },
  taglines: {
    red: 'IGNITE THE FIRE',
    blue: 'STRIKE LIKE LIGHTNING',
    yellow: 'RISE AND SHINE',
    green: 'UNLEASH THE POWER',
  }
};

const DEFAULT_SCORES = {
  red: 0,
  blue: 0,
  yellow: 0,
  green: 0,
};

export default function Admin() {
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualInputs, setManualInputs] = useState({ red: '', blue: '', yellow: '', green: '' });

  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('houseScores');
      if (savedScores) setScores(JSON.parse(savedScores));

      const savedConfig = localStorage.getItem('scoreboardConfig');
      if (savedConfig) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) });

      const savedSound = localStorage.getItem('scoreboardSound');
      if (savedSound !== null) {
        const enabled = savedSound === 'true';
        setSoundEnabled(enabled);
        soundFX.enabled = enabled;
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateScore = (house, change) => {
    const current = Number(scores[house]) || 0;
    const newScore = Math.max(0, current + change);
    const newScores = { ...scores, [house]: newScore };
    setScores(newScores);
    localStorage.setItem('houseScores', JSON.stringify(newScores));

    if (change > 0 && soundEnabled) {
      soundFX.playScoreUp();
    }
  };

  const setExactScore = (house) => {
    const val = parseInt(manualInputs[house], 10);
    if (!isNaN(val) && val >= 0) {
      const newScores = { ...scores, [house]: val };
      setScores(newScores);
      localStorage.setItem('houseScores', JSON.stringify(newScores));
      setManualInputs({ ...manualInputs, [house]: '' });
      if (soundEnabled) soundFX.playScoreUp();
    }
  };

  const triggerConfettiBlast = () => {
    localStorage.setItem('triggerConfetti', String(Date.now()));
    if (soundEnabled) soundFX.playCelebration();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    localStorage.setItem('scoreboardSound', String(next));
  };

  const saveConfig = () => {
    localStorage.setItem('scoreboardConfig', JSON.stringify(config));
    setIsEditingNames(false);
  };

  const resetAllScores = () => {
    if (window.confirm('⚠️ Are you sure you want to reset all house scores back to ZERO?')) {
      setScores(DEFAULT_SCORES);
      localStorage.setItem('houseScores', JSON.stringify(DEFAULT_SCORES));
    }
  };

  const houseKeys = [
    { key: 'red', name: 'RED', color: '#ef473a' },
    { key: 'blue', name: 'BLUE', color: '#00a8ff' },
    { key: 'yellow', name: 'YELLOW', color: '#ffd700' },
    { key: 'green', name: 'GREEN', color: '#38ef7d' },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>SCOREBOARD MASTER CONSOLE</h1>
          <p>Real-time Operator & Telemetry Control</p>
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

      {/* House Name & Event Editor Section */}
      <div className="admin-config-card">
        <div className="config-header">
          <h3>EVENT & HOUSE CUSTOMIZATION</h3>
          <button className="edit-toggle-btn" onClick={() => setIsEditingNames(!isEditingNames)}>
            {isEditingNames ? <Check size={16} /> : <Edit3 size={16} />}
            <span>{isEditingNames ? 'DONE EDITING' : 'EDIT NAMES & TITLES'}</span>
          </button>
        </div>

        {isEditingNames && (
          <div className="config-form">
            <div className="config-row">
              <label>Event Name:</label>
              <input
                type="text"
                value={config.eventName}
                onChange={(e) => setConfig({ ...config, eventName: e.target.value })}
                placeholder="e.g. INTER-HOUSE CHAMPIONSHIP"
              />
            </div>
            <div className="config-row">
              <label>Event Subtitle:</label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                placeholder="e.g. ANNUAL SPORTS & ACADEMIC COMPETITION 2026"
              />
            </div>

            <div className="house-name-inputs-grid">
              {houseKeys.map(({ key, color }) => (
                <div key={key} className="house-input-group" style={{ borderColor: color }}>
                  <label style={{ color }}>{key.toUpperCase()} HOUSE NAME:</label>
                  <input
                    type="text"
                    value={config.houseNames[key] || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        houseNames: { ...config.houseNames, [key]: e.target.value },
                      })
                    }
                  />
                  <label style={{ color, marginTop: '8px' }}>TAGLINE / MOTTO:</label>
                  <input
                    type="text"
                    value={config.taglines[key] || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        taglines: { ...config.taglines, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <button className="save-config-btn" onClick={saveConfig}>
              SAVE EVENT DETAILS
            </button>
          </div>
        )}
      </div>

      {/* 4 House Score Controls */}
      <div className="admin-score-grid">
        {houseKeys.map(({ key, color }) => {
          const houseTitle = (config.houseNames && config.houseNames[key]) || key.toUpperCase();
          const score = scores[key] || 0;

          return (
            <div key={key} className={`admin-house-card ${key}-card`} style={{ '--house-theme': color }}>
              <div className="card-top">
                <div className="house-tag-pill">
                  <HouseIcon house={key} className="house-icon-mini" />
                  <span className="house-code-label">{key.toUpperCase()}</span>
                </div>
                <h2 className="admin-house-name">{houseTitle}</h2>
              </div>

              {/* Current Score Display */}
              <div className="score-big-vault">
                <span className="vault-number">{score}</span>
                <span className="vault-label">CURRENT POINTS</span>
              </div>

              {/* Fast Presets (+1, +5, +10, +25, +50, +100) */}
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
                  placeholder="Set exact points..."
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
