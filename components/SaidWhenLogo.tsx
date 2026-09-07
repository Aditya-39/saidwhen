'use client';

import React from 'react';

interface SaidWhenLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  color?: string;
  accentColor?: string;
  animated?: boolean;
  showText?: boolean;
}

export default function SaidWhenLogo({
  width = 250,
  height = 56,
  className = '',
  color = '#e6dfd5',        // Text ka color
  accentColor = '#f58066',  // Waveform bars ka pulse color
  animated = true,
  showText = true,
}: SaidWhenLogoProps) {
  const viewBox = showText ? '0 0 358 76' : '0 0 74 76';

  return (
    <div
      className={`sw-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: '100%', height: 'auto', overflow: 'visible' }}
      >
        <style>{`
          @keyframes sw-pulse-dot {
            0%, 100% { transform: scale(0.7); opacity: 0.5; }
            50% { transform: scale(1.3); opacity: 1; }
          }
          @keyframes sw-bar-1 {
            0%, 100% { transform: scaleY(0.45); opacity: 0.6; }
            50% { transform: scaleY(1.15); opacity: 1; }
          }
          @keyframes sw-bar-2 {
            0%, 100% { transform: scaleY(0.35); opacity: 0.7; }
            50% { transform: scaleY(1.25); opacity: 1; }
          }
          @keyframes sw-bar-3 {
            0%, 100% { transform: scaleY(0.5); opacity: 0.6; }
            50% { transform: scaleY(1.1); opacity: 1; }
          }

          .sw-dot {
            transform-box: fill-box;
            transform-origin: center;
            animation: ${animated ? 'sw-pulse-dot 1.5s ease-in-out infinite' : 'none'};
          }
          .sw-b1 {
            transform-box: fill-box;
            transform-origin: center;
            animation: ${animated ? 'sw-bar-1 1.5s ease-in-out infinite' : 'none'};
            animation-delay: 0.15s;
          }
          .sw-b2 {
            transform-box: fill-box;
            transform-origin: center;
            animation: ${animated ? 'sw-bar-2 1.5s ease-in-out infinite' : 'none'};
            animation-delay: 0.3s;
          }
          .sw-b3 {
            transform-box: fill-box;
            transform-origin: center;
            animation: ${animated ? 'sw-bar-3 1.5s ease-in-out infinite' : 'none'};
            animation-delay: 0.45s;
          }

          .sw-logo-wrapper:hover .sw-b1 { animation-duration: 0.75s; }
          .sw-logo-wrapper:hover .sw-b2 { animation-duration: 0.75s; }
          .sw-logo-wrapper:hover .sw-b3 { animation-duration: 0.75s; }
        `}</style>

        {/* 1. EXACT GEOMETRIC FACE PROFILE (from user drawing) */}
        <path
          d="M 16 16
             L 31 16
             C 35 16 38 18 40 21
             L 45 30
             C 46 32 45 34 44 36
             L 43 40
             L 32 46
             L 41 52
             L 41 56
             C 41 60 38 62 34 62
             L 24 62
             C 18 62 14 66 12 72"
          stroke={color}
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 2. SOUNDWAVE BARS (Radiating from the mouth opening) */}
        <circle cx="37" cy="46" r="2.2" fill={accentColor} className="sw-dot" />
        <line x1="49" y1="39" x2="49" y2="53" stroke={accentColor} strokeWidth="3.8" strokeLinecap="round" className="sw-b1" />
        <line x1="58" y1="31" x2="58" y2="61" stroke={accentColor} strokeWidth="3.8" strokeLinecap="round" className="sw-b2" />
        <line x1="67" y1="37" x2="67" y2="55" stroke={accentColor} strokeWidth="3.8" strokeLinecap="round" className="sw-b3" />

        {/* "saidwhen" wordmark */}
        {showText && (
          <g
            stroke={color}
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M 103 30 L 92 30 C 86 30 82 34 82 40 C 82 45 86 46 92 46 L 95 46 C 101 46 104 48 104 52 C 104 57 100 58 92 58 L 82 58" />
            <path d="M 137 30 L 137 58" />
            <path d="M 137 34 L 124 34 C 117 34 113 39 113 46 C 113 53 117 58 124 58 L 137 58" />
            <circle cx="152" cy="20" r="2.2" fill={color} stroke="none" />
            <path d="M 152 30 L 152 58" />
            <path d="M 189 14 L 189 58" />
            <path d="M 189 34 L 176 34 C 169 34 165 39 165 46 C 165 53 169 58 176 58 L 189 58" />
            <path d="M 203 30 L 203 50 C 203 56 206 58 211 58 C 216 58 218 55 220 48 C 221 43 222 43 223 48 C 225 55 227 58 232 58 C 237 58 240 56 240 50 L 240 30" />
            <path d="M 252 14 L 252 58" />
            <path d="M 252 38 C 253 32 258 30 264 30 L 266 30 C 272 30 276 34 276 40 L 276 58" />
            <path d="M 289 44 L 311 44 C 311 34 305 30 299 30 C 293 30 289 35 289 44 C 289 53 294 58 301 58 C 307 58 311 55 313 50" />
            <path d="M 324 30 L 324 58" />
            <path d="M 324 38 C 325 32 330 30 336 30 L 338 30 C 344 30 348 34 348 40 L 348 58" />
          </g>
        )}
      </svg>
    </div>
  );
}