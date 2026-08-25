import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Maximize, Minimize, Settings, Sparkles, Trophy, Crown } from 'lucide-react';
import BackgroundCanvas from './BackgroundCanvas';
import { HouseIcon } from './HouseIcons';
import { soundFX } from './sound';
import './Scoreboard.css';

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

// Smooth Rolling Number Counter Component
function RollingCounter({ value, color }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isPulsing, setIsPulsing] = useState(false);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (value === displayValue) return;

    setIsPulsing(true);
    const pulseTimer = setTimeout(() => setIsPulsing(false), 600);

    const startVal = displayValue;
    const endVal = value;
    const duration = 500; // ms
    const startTime = performance.now();

    const updateNumber = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateNumber);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateNumber);

    return () => {
      clearTimeout(pulseTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value]);

  return (
    <div className={`score-digit ${isPulsing ? 'score-bump' : ''}`}>
      {displayValue}
    </div>
  );
}

// Glowing Rain / Particle Matrix inside each card
function EnergyRain({ color, houseKey }) {
  const particles = useRef(
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i / 18) * 100 + (Math.random() * 5 - 2.5)}%`,
      duration: `${1.2 + Math.random() * 1.8}s`,
      delay: `${Math.random() * 2}s`,
      opacity: 0.25 + Math.random() * 0.6,
      width: `${2 + Math.random() * 2.5}px`,
      height: `${20 + Math.random() * 35}px`,
    }))
  ).current;

  return (
    <div className="energy-rain-layer">
      {particles.map((p) => (
        <div
          key={p.id}
          className="energy-drop"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            '--drop-opacity': p.opacity,
            width: p.width,
            height: p.height,
            backgroundColor: color,
            color: color,
          }}
        />
      ))}
    </div>
  );
}

export default function Display() {
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const prevScoresRef = useRef(DEFAULT_SCORES);
  const prevLeaderRef = useRef(null);

  // Load scores & config from localStorage
  const loadData = () => {
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
  };

  useEffect(() => {
    loadData();

    const handleStorage = (e) => {
      if (e.key === 'houseScores' && e.newValue) {
        setScores(JSON.parse(e.newValue));
      }
      if (e.key === 'scoreboardConfig' && e.newValue) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(e.newValue) });
      }
      if (e.key === 'scoreboardSound') {
        const enabled = e.newValue === 'true';
        setSoundEnabled(enabled);
        soundFX.enabled = enabled;
      }
      if (e.key === 'triggerConfetti') {
        triggerVictoryConfetti();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Audio & Confetti response on score change
  useEffect(() => {
    const prev = prevScoresRef.current;
    let scoreIncreased = false;
    let maxIncreasedHouse = null;

    Object.keys(scores).forEach((key) => {
      if (scores[key] > (prev[key] || 0)) {
        scoreIncreased = true;
        maxIncreasedHouse = key;
      }
    });

    if (scoreIncreased) {
      soundFX.playScoreUp();

      // Check if leader changed
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const currentLeader = sorted[0][1] > 0 ? sorted[0][0] : null;

      if (currentLeader && currentLeader !== prevLeaderRef.current && prevLeaderRef.current !== null) {
        soundFX.playLeaderChange();
        triggerLeaderConfetti(currentLeader);
      }
      prevLeaderRef.current = currentLeader;
    }

    prevScoresRef.current = scores;
  }, [scores]);

  // Live Clock updater
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Confetti celebrations
  const triggerVictoryConfetti = () => {
    soundFX.playCelebration();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ef473a', '#00a8ff', '#ffd700', '#38ef7d', '#ffffff'],
    });
  };

  const triggerLeaderConfetti = (houseKey) => {
    const colorMap = {
      red: ['#ef473a', '#ff7675', '#ffffff'],
      blue: ['#00a8ff', '#74b9ff', '#ffffff'],
      yellow: ['#ffd700', '#ffeaa7', '#ffffff'],
      green: ['#38ef7d', '#55efc4', '#ffffff'],
    };
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: colorMap[houseKey] || ['#ffffff'],
    });
  };

  // Toggle Sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    localStorage.setItem('scoreboardSound', String(next));
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Compute live ranks and lead info
  const sortedHouses = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const ranks = {};
  sortedHouses.forEach(([house], index) => {
    ranks[house] = index + 1; // 1st, 2nd, 3rd, 4th
  });

  const getRankBadge = (rank) => {
    if (rank === 1) return { label: '1ST PLACE', icon: <Crown size={18} className="crown-icon" />, className: 'rank-1' };
    if (rank === 2) return { label: '2ND PLACE', icon: <Trophy size={16} />, className: 'rank-2' };
    if (rank === 3) return { label: '3RD PLACE', icon: <Trophy size={16} />, className: 'rank-3' };
    return { label: '4TH PLACE', icon: null, className: 'rank-4' };
  };

  const housesConfig = [
    { key: 'red', color: '#ef473a', borderGlow: 'rgba(239, 71, 58, 0.7)', code: 'RED-01' },
    { key: 'blue', color: '#00a8ff', borderGlow: 'rgba(0, 168, 255, 0.7)', code: 'BLU-02' },
    { key: 'yellow', color: '#ffd700', borderGlow: 'rgba(255, 215, 0, 0.7)', code: 'YEL-03' },
    { key: 'green', color: '#38ef7d', borderGlow: 'rgba(56, 239, 125, 0.7)', code: 'GRN-04' },
  ];

  return (
    <div className="scoreboard-master-container">
      {/* Interactive Nebula & Constellation Canvas */}
      <BackgroundCanvas />

      {/* Dynamic Top Broadcast Header */}
      <header className="broadcast-header">
        <div className="header-left">
          <div className="live-badge">
            <span className="live-radar-ping"></span>
            <span className="live-text">LIVE MATCH</span>
          </div>
          <div className="clock-widget">
            <span className="time-display">{currentTime}</span>
            <span className="date-display">{currentDate}</span>
          </div>
        </div>

        <div className="header-center">
          <div className="event-title-badge">
            <Sparkles size={16} className="sparkle-icon" />
            <span>OFFICIAL LEADERBOARD</span>
            <Sparkles size={16} className="sparkle-icon" />
          </div>
          <h1 className="competition-title">{config.eventName}</h1>
          <p className="competition-subtitle">{config.subtitle}</p>
        </div>

        <div className="header-right">
          <button className="control-icon-btn" onClick={toggleSound} title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}>
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button className="control-icon-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <a href="/admin" target="_blank" rel="noreferrer" className="control-icon-btn" title="Open Admin Control Panel">
            <Settings size={20} />
          </a>
        </div>
      </header>

      {/* 2x2 Cyber Sports Grid */}
      <main className="cyber-grid-container">
        {housesConfig.map(({ key, color, borderGlow, code }) => {
          const score = scores[key] || 0;
          const rank = ranks[key] || 4;
          const rankBadge = getRankBadge(rank);
          const houseName = (config.houseNames && config.houseNames[key]) || key.toUpperCase();
          const tagline = (config.taglines && config.taglines[key]) || '';
          const isLeader = rank === 1 && score > 0;

          return (
            <div
              key={key}
              className={`cyber-house-card ${key}-card ${isLeader ? 'leader-card' : ''}`}
              style={{ '--house-color': color, '--house-glow': borderGlow }}
            >
              {/* Energy Matrix Rain Backdrop */}
              <EnergyRain color={color} houseKey={key} />

              {/* Card Ambient Header */}
              <div className="card-top-bar">
                <div className="house-badge-pill">
                  <HouseIcon house={key} className="house-crest-icon" />
                  <span className="house-code-tag">{code}</span>
                </div>

                {/* Live Rank Tag */}
                <div className={`rank-tag ${rankBadge.className}`}>
                  {rankBadge.icon}
                  <span>{rankBadge.label}</span>
                </div>
              </div>

              {/* House Identity & Title */}
              <div className="house-identity">
                <h2 className="house-main-title">{houseName}</h2>
                <div className="house-tagline">{tagline}</div>
              </div>

              {/* Holographic Glowing Score Box */}
              <div className="hologram-score-vault">
                <div className="vault-corner tl"></div>
                <div className="vault-corner tr"></div>
                <div className="vault-corner bl"></div>
                <div className="vault-corner br"></div>

                <div className="vault-inner-glow"></div>

                <RollingCounter value={score} color={color} />

                <div className="points-label">POINTS</div>
              </div>

              {/* Bottom Cyber Laser Accent */}
              <div className="card-bottom-laser"></div>
            </div>
          );
        })}

        {/* Central Glowing Crosshair Dividers */}
        <div className="cyber-crosshair-v"></div>
        <div className="cyber-crosshair-h"></div>
      </main>

      {/* Broadcast Ticker Footer */}
      <footer className="broadcast-footer-ticker">
        <div className="ticker-label">STATUS</div>
        <div className="ticker-marquee">
          <span>
            ⚡ TOURNAMENT LIVE &bull; SCORES SYNCED IN REAL-TIME &bull; OPEN <strong>/admin</strong> ON MOBILE OR LAPTOP TO CONTROL &bull; PRESS <strong>F11</strong> FOR STADIUM FULLSCREEN
          </span>
        </div>
      </footer>
    </div>
  );
}
