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

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles system
    const particleCount = 70;
    const particles = [];
    const colors = [
      'rgba(239, 71, 58, 0.6)',   // Red
      'rgba(0, 168, 255, 0.6)',   // Blue
      'rgba(255, 215, 0, 0.6)',   // Yellow
      'rgba(56, 239, 125, 0.6)',  // Green
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        alpha: Math.random() * 0.7 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.3,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Deep dark cyber background gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#0a0d18');
      bgGrad.addColorStop(0.5, '#05070e');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 4 Ambient Neon Corner Flares (matching Red, Blue, Yellow, Green houses)
      // Top-Left (RED)
      const redGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, width * 0.45);
      redGlow.addColorStop(0, 'rgba(239, 71, 58, 0.12)');
      redGlow.addColorStop(1, 'rgba(239, 71, 58, 0)');
      ctx.fillStyle = redGlow;
      ctx.fillRect(0, 0, width * 0.5, height * 0.5);

      // Top-Right (BLUE)
      const blueGlow = ctx.createRadialGradient(width, 0, 10, width, 0, width * 0.45);
      blueGlow.addColorStop(0, 'rgba(0, 168, 255, 0.14)');
      blueGlow.addColorStop(1, 'rgba(0, 168, 255, 0)');
      ctx.fillStyle = blueGlow;
      ctx.fillRect(width * 0.5, 0, width * 0.5, height * 0.5);

      // Bottom-Left (YELLOW)
      const yellowGlow = ctx.createRadialGradient(0, height, 10, 0, height, width * 0.45);
      yellowGlow.addColorStop(0, 'rgba(255, 215, 0, 0.10)');
      yellowGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = yellowGlow;
      ctx.fillRect(0, height * 0.5, width * 0.5, height * 0.5);

      // Bottom-Right (GREEN)
      const greenGlow = ctx.createRadialGradient(width, height, 10, width, height, width * 0.45);
      greenGlow.addColorStop(0, 'rgba(56, 239, 125, 0.12)');
      greenGlow.addColorStop(1, 'rgba(56, 239, 125, 0)');
      ctx.fillStyle = greenGlow;
      ctx.fillRect(width * 0.5, height * 0.5, width * 0.5, height * 0.5);

      // Subtle cyber grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and connect floating energy particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.baseAlpha + Math.sin(time * 2 + idx) * 0.25;

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        // Connect nearby particles with glowing filaments
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 100) * 0.12;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

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
