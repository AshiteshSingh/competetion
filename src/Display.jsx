import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Maximize, Minimize } from 'lucide-react';
import BackgroundCanvas from './BackgroundCanvas';
import { HouseIcon } from './HouseIcons';
import { soundFX } from './sound';
import './Scoreboard.css';

const DEFAULT_SCORES = {
  red: 0,
  blue: 0,
  yellow: 0,
  green: 0,
};

const BASE_HOUSES = [
  { key: 'red', name: 'RED', color: '#ef473a', borderGlow: 'rgba(239, 71, 58, 0.7)', code: 'RED-01', defaultOrder: 1 },
  { key: 'blue', name: 'BLUE', color: '#00a8ff', borderGlow: 'rgba(0, 168, 255, 0.7)', code: 'BLU-02', defaultOrder: 2 },
  { key: 'yellow', name: 'YELLOW', color: '#ffd700', borderGlow: 'rgba(255, 215, 0, 0.7)', code: 'YEL-03', defaultOrder: 3 },
  { key: 'green', name: 'GREEN', color: '#38ef7d', borderGlow: 'rgba(56, 239, 125, 0.7)', code: 'GRN-04', defaultOrder: 4 },
];

// Smooth Rolling Number Counter Component
function RollingCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isPulsing, setIsPulsing] = useState(false);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (value === displayValue) return;

    setIsPulsing(true);
    const pulseTimer = setTimeout(() => setIsPulsing(false), 500);

    const startVal = displayValue;
    const endVal = value;
    const duration = 400; // ms
    const startTime = performance.now();

    const updateNumber = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
function EnergyRain({ color }) {
  const particles = useRef(
    Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: `${(i / 16) * 100 + (Math.random() * 4 - 2)}%`,
      duration: `${1.2 + Math.random() * 1.8}s`,
      delay: `${Math.random() * 2}s`,
      opacity: 0.25 + Math.random() * 0.6,
      width: `${2 + Math.random() * 2}px`,
      height: `${18 + Math.random() * 30}px`,
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
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const prevScoresRef = useRef(DEFAULT_SCORES);
  const prevLeaderRef = useRef(null);

  // BroadcastChannel for instant cross-tab sync
  const channelRef = useRef(null);

  const loadScores = () => {
    try {
      const savedScores = localStorage.getItem('houseScores');
      if (savedScores) setScores(JSON.parse(savedScores));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadScores();

    // Setup BroadcastChannel for 0ms cross-window communication
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('scoreboard_sync_channel');
      channelRef.current.onmessage = (event) => {
        if (event.data && event.data.type === 'UPDATE_SCORES') {
          setScores(event.data.scores);
        } else if (event.data && event.data.type === 'CONFETTI') {
          triggerVictoryConfetti();
        }
      };
    }

    const handleStorage = (e) => {
      if (e.key === 'houseScores' && e.newValue) {
        setScores(JSON.parse(e.newValue));
      }
      if (e.key === 'triggerConfetti') {
        triggerVictoryConfetti();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channelRef.current) channelRef.current.close();
    };
  }, []);

  // Audio & Confetti response on score change
  useEffect(() => {
    const prev = prevScoresRef.current;
    let scoreIncreased = false;

    Object.keys(scores).forEach((key) => {
      if (scores[key] > (prev[key] || 0)) {
        scoreIncreased = true;
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

  // DYNAMIC SORTING: Sort houses by score descending (highest score first)
  // Top-Left = 1st, Top-Right = 2nd, Bottom-Left = 3rd, Bottom-Right = 4th
  const sortedHouses = useMemo(() => {
    return [...BASE_HOUSES].sort((a, b) => {
      const scoreA = Number(scores[a.key]) || 0;
      const scoreB = Number(scores[b.key]) || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Highest score first
      }
      return a.defaultOrder - b.defaultOrder; // Preserves stable initial order when tied
    });
  }, [scores]);

  const getRankBadge = (rank) => {
    if (rank === 1) return { label: '1ST PLACE', icon: <Crown size={18} className="crown-icon" />, className: 'rank-1' };
    if (rank === 2) return { label: '2ND PLACE', icon: <Trophy size={16} />, className: 'rank-2' };
    if (rank === 3) return { label: '3RD PLACE', icon: <Trophy size={16} />, className: 'rank-3' };
    return { label: '4TH PLACE', icon: null, className: 'rank-4' };
  };

  return (
    <div className="scoreboard-master-container">
      {/* Interactive Nebula & Constellation Canvas */}
      <BackgroundCanvas />

      {/* Dynamic Top Broadcast Header */}
      <header className="broadcast-header">
        {/* Top Left: LIVE + Clock */}
        <div className="header-left">
          <div className="live-badge">
            <span className="live-radar-ping"></span>
            <span className="live-text">LIVE</span>
          </div>
          <div className="clock-widget">
            <span className="time-display">{currentTime}</span>
            <span className="date-display">{currentDate}</span>
          </div>
        </div>

        {/* Top Center: Clean Event Title */}
        <div className="header-center">
          <h1 className="competition-title">INTER-HOUSE CHAMPIONSHIP</h1>
        </div>

        {/* Top Right: Fullscreen Toggle */}
        <div className="header-right">
          <button className="control-icon-btn fullscreen-btn" onClick={toggleFullscreen} title="Toggle Fullscreen (F11)">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* 2x2 Cyber Sports Grid with Smooth Layout Animation */}
      <main className="cyber-grid-container">
        {sortedHouses.map((house, index) => {
          const rank = index + 1; // 1st (Top-Left), 2nd (Top-Right), 3rd (Bottom-Left), 4th (Bottom-Right)
          const score = scores[house.key] || 0;
          const rankBadge = getRankBadge(rank);
          const isLeader = rank === 1 && score > 0;

          return (
            <motion.div
              layout
              key={house.key}
              transition={{
                layout: { type: 'spring', stiffness: 220, damping: 28 },
                duration: 0.6,
              }}
              className={`cyber-house-card ${house.key}-card ${isLeader ? 'leader-card' : ''}`}
              style={{ '--house-color': house.color, '--house-glow': house.borderGlow }}
            >
              {/* Energy Matrix Rain Backdrop */}
              <EnergyRain color={house.color} />

              {/* Card Top Bar */}
              <div className="card-top-bar">
                <div className="house-badge-pill">
                  <HouseIcon house={house.key} className="house-crest-icon" />
                  <span className="house-code-tag">{house.code}</span>
                </div>

                {/* Live Rank Tag */}
                <div className={`rank-tag ${rankBadge.className}`}>
                  {rankBadge.icon}
                  <span>{rankBadge.label}</span>
                </div>
              </div>

              {/* House Identity - House Name ONLY */}
              <div className="house-identity">
                <h2 className="house-main-title">{house.name}</h2>
              </div>

              {/* Holographic Glowing Score Box */}
              <div className="hologram-score-vault">
                <div className="vault-corner tl"></div>
                <div className="vault-corner tr"></div>
                <div className="vault-corner bl"></div>
                <div className="vault-corner br"></div>

                <div className="vault-inner-glow"></div>

                <RollingCounter value={score} />

                <div className="points-label">POINTS</div>
              </div>

              {/* Bottom Cyber Laser Accent */}
              <div className="card-bottom-laser"></div>
            </motion.div>
          );
        })}

        {/* Central Glowing Crosshair Dividers */}
        <div className="cyber-crosshair-v"></div>
        <div className="cyber-crosshair-h"></div>
      </main>
    </div>
  );
}
