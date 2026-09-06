'use client';

import React, { useEffect, useRef } from 'react';

interface WaveConfig {
  yOffset: number;
  baseAmp: number;
  burstAmp: number;
  freq1: number;
  freq2: number;
  speed: number;
  phase: number;
  baseAlpha: number;
  isCenter?: boolean;
}

const WAVES: WaveConfig[] = [
  { yOffset: -24, baseAmp: 5,  burstAmp: 16, freq1: 0.006, freq2: 0.016, speed: 0.0006, phase: 0.4, baseAlpha: 0.12 },
  { yOffset: -10, baseAmp: 9,  burstAmp: 24, freq1: 0.008, freq2: 0.022, speed: 0.0009, phase: 1.8, baseAlpha: 0.22 },
  { yOffset: 0,   baseAmp: 13, burstAmp: 38, freq1: 0.007, freq2: 0.019, speed: 0.0008, phase: 0.0, baseAlpha: 0.35, isCenter: true },
  { yOffset: 10,  baseAmp: 9,  burstAmp: 22, freq1: 0.009, freq2: 0.024, speed: 0.0011, phase: 2.7, baseAlpha: 0.22 },
  { yOffset: 24,  baseAmp: 5,  burstAmp: 14, freq1: 0.005, freq2: 0.017, speed: 0.0007, phase: 4.2, baseAlpha: 0.12 },
];

export default function WaveformBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const computed = getComputedStyle(canvas);
    const accentColor = computed.getPropertyValue('--accent').trim() || '#e0a13c';

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = entry.contentRect.width;
      height = entry.contentRect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        draw(0);
      }
    });

    resizeObserver.observe(canvas);

    const computeY = (x: number, wave: WaveConfig, t: number, centerY: number): number => {
      const u = x / (width || 1);
      const drift = t * wave.speed;

      const w1 = Math.sin(x * wave.freq1 + drift + wave.phase);
      const w2 = Math.sin(x * wave.freq2 - drift * 0.8 + wave.phase * 1.5) * 0.45;
      const raw = w1 + w2;

      const edgeFade = Math.sin(u * Math.PI);
      const centerDist = Math.abs(u - 0.5) / 0.09;
      const centerWeight = centerDist < 1 ? Math.cos(centerDist * (Math.PI / 2)) : 0;

      const voiceHarmonic = centerWeight > 0
        ? Math.sin(x * 0.036 + drift * 1.8) * Math.cos(x * 0.015 - drift * 0.5) * 0.55 * centerWeight
        : 0;

      const amplitude = (wave.baseAmp + wave.burstAmp * centerWeight) * Math.pow(Math.max(0, edgeFade), 0.6);
      return centerY + wave.yOffset + (raw + voiceHarmonic) * amplitude;
    };

    const draw = (t: number) => {
      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);

      const centerY = height * 0.5;
      const step = 3;

      const hlStart = Math.floor(width * 0.43);
      const hlEnd = Math.ceil(width * 0.57);
      const pulse = prefersReducedMotion ? 1 : 0.82 + 0.18 * Math.sin(t * 0.0018);

      WAVES.forEach((wave) => {
        const baseGrad = ctx.createLinearGradient(0, 0, width, 0);
        baseGrad.addColorStop(0, 'rgba(142, 138, 130, 0)');
        baseGrad.addColorStop(0.12, `rgba(142, 138, 130, ${wave.baseAlpha * 0.5})`);
        baseGrad.addColorStop(0.40, `rgba(142, 138, 130, ${wave.baseAlpha})`);
        baseGrad.addColorStop(0.60, `rgba(142, 138, 130, ${wave.baseAlpha})`);
        baseGrad.addColorStop(0.88, `rgba(142, 138, 130, ${wave.baseAlpha * 0.5})`);
        baseGrad.addColorStop(1, 'rgba(142, 138, 130, 0)');

        ctx.beginPath();
        ctx.strokeStyle = baseGrad;
        ctx.lineWidth = wave.isCenter ? 1.4 : 1.0;
        ctx.shadowBlur = 0;

        for (let x = 0; x <= width; x += step) {
          const y = computeY(x, wave, t, centerY);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const hlGrad = ctx.createLinearGradient(hlStart, 0, hlEnd, 0);
        hlGrad.addColorStop(0, 'rgba(224, 161, 60, 0)');
        hlGrad.addColorStop(0.2, `rgba(224, 161, 60, ${0.95 * pulse})`);
        hlGrad.addColorStop(0.5, `rgba(224, 161, 60, ${1.0 * pulse})`);
        hlGrad.addColorStop(0.8, `rgba(224, 161, 60, ${0.95 * pulse})`);
        hlGrad.addColorStop(1, 'rgba(224, 161, 60, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = hlGrad;
        ctx.lineWidth = wave.isCenter ? 1.8 : 1.2;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = (wave.isCenter ? 14 : 7) * pulse;

        for (let x = hlStart; x <= hlEnd; x += step) {
          const y = computeY(x, wave, t, centerY);
          if (x === hlStart) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      });
    };

    const tick = (now: number) => {
      const delta = Math.min(now - lastTime, 40);
      lastTime = now;
      elapsed += delta;

      draw(elapsed);

      if (!prefersReducedMotion && !document.hidden) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const startAnimation = () => {
      cancelAnimationFrame(animationFrameId);
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(tick);
    };

    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        cancelAnimationFrame(animationFrameId);
        draw(0);
      } else {
        startAnimation();
      }
    };
    motionQuery.addEventListener('change', onMotionChange);

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (!prefersReducedMotion) {
        startAnimation();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (!prefersReducedMotion) {
      startAnimation();
    } else {
      draw(0);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-canvas"
      aria-hidden="true"
    />
  );
}