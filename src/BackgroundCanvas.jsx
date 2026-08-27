import { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // ── Static off-screen background (drawn only on resize) ──────────────────
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d');

    const buildStaticBackground = () => {
      bgCanvas.width = width;
      bgCanvas.height = height;

      // Base gradient
      const bgGrad = bgCtx.createRadialGradient(
        width / 2, height / 2, 100,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#073642');
      bgGrad.addColorStop(0.5, '#002b36');
      bgGrad.addColorStop(1, '#001e26');
      bgCtx.fillStyle = bgGrad;
      bgCtx.fillRect(0, 0, width, height);

      // 4 house corner flares — static, drawn once
      const corners = [
        { x: 0,     y: 0,      color: 'rgba(220, 50, 47,  0.13)' },  // Red  TL
        { x: width, y: 0,      color: 'rgba(38, 139, 210, 0.14)' },  // Blue TR
        { x: 0,     y: height, color: 'rgba(181, 137, 0,  0.12)' },  // Yellow BL
        { x: width, y: height, color: 'rgba(133, 153, 0,  0.12)' },  // Green BR
      ];
      corners.forEach(({ x, y, color }) => {
        const r = width * 0.45;
        const grad = bgCtx.createRadialGradient(x, y, 10, x, y, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, width, height);
      });

      // Grid lines — drawn once as a single path batch
      bgCtx.strokeStyle = 'rgba(88, 110, 117, 0.07)';
      bgCtx.lineWidth = 1;
      const gridSize = 50;
      bgCtx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        bgCtx.moveTo(x, 0);
        bgCtx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        bgCtx.moveTo(0, y);
        bgCtx.lineTo(width, y);
      }
      bgCtx.stroke();
    };

    buildStaticBackground();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      buildStaticBackground();
    };
    window.addEventListener('resize', handleResize);

    // ── Particles — reduced count, no shadowBlur ──────────────────────────────
    const PARTICLE_COUNT = 40; // was 70
    const CONNECT_DIST = 90;   // was 100
    const colors = [
      'rgba(220, 50, 47,  0.65)',
      'rgba(38, 139, 210, 0.65)',
      'rgba(181, 137, 0,  0.65)',
      'rgba(133, 153, 0,  0.65)',
      'rgba(42, 161, 152, 0.65)',
    ];

    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      baseAlpha: Math.random() * 0.45 + 0.25,
    }));

    let time = 0;
    let lastFrame = 0;
    const TARGET_FPS = 40; // cap to 40fps — plenty for a background
    const FRAME_MS  = 1000 / TARGET_FPS;

    const render = (timestamp) => {
      animationFrameId = requestAnimationFrame(render);
      const delta = timestamp - lastFrame;
      if (delta < FRAME_MS) return; // skip frame if too soon
      lastFrame = timestamp - (delta % FRAME_MS);

      time += 0.015;

      // Stamp pre-baked static background (1 drawImage call)
      ctx.drawImage(bgCanvas, 0, 0);

      // Move & draw particles
      // Build simple cell-grid for O(n) neighbour lookup instead of O(n²)
      const cellSize = CONNECT_DIST;
      const cols = Math.ceil(width  / cellSize) + 1;
      const grid = {};

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)      p.x = width;
        if (p.x > width)  p.x = 0;
        if (p.y < 0)      p.y = height;
        if (p.y > height) p.y = 0;

        const alpha = Math.max(0.08, Math.min(0.95,
          p.baseAlpha + Math.sin(time * 1.8 + idx) * 0.2
        ));

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Register in spatial grid
        const cx = Math.floor(p.x / cellSize);
        const cy = Math.floor(p.y / cellSize);
        const key = cx + cy * cols;
        if (!grid[key]) grid[key] = [];
        grid[key].push(p);
      });

      // Connect nearby particles via spatial grid (O(n) average)
      ctx.lineWidth = 0.7;
      particles.forEach((p) => {
        const cx = Math.floor(p.x / cellSize);
        const cy = Math.floor(p.y / cellSize);

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighbors = grid[(cx + dx) + (cy + dy) * cols];
            if (!neighbors) continue;
            neighbors.forEach((p2) => {
              if (p2 === p) return;
              const ddx = p.x - p2.x;
              const ddy = p.y - p2.y;
              const dist = Math.sqrt(ddx * ddx + ddy * ddy);
              if (dist < CONNECT_DIST) {
                ctx.globalAlpha = (1 - dist / CONNECT_DIST) * 0.1;
                ctx.strokeStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
            });
          }
        }
      });

      ctx.globalAlpha = 1;
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
