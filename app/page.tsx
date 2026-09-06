import Link from 'next/link';
import SaidWhenLogo from '@/components/SaidWhenLogo';

export default function LandingPage() {
  return (
    <main className="single-frame-viewport">
      {/* THE SINGLE HERO FRAME */}
      <div className="ethereal-master-frame">
        
        {/* 
          BACKGROUND LAYER: 
          Twilight Dusk Sky + Streetlamp + Palm Trees with Leaves Swaying in the Breeze!
        */}
        <div className="frame-scenery-backdrop" aria-hidden="true">
          <svg viewBox="0 0 1440 850" fill="none" preserveAspectRatio="none" className="backdrop-svg">
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0a0614" />
                <stop offset="35%" stopColor="#1c0a27" />
                <stop offset="65%" stopColor="#4a153b" />
                <stop offset="85%" stopColor="#a33252" />
                <stop offset="97%" stopColor="#ea5d56" />
                <stop offset="100%" stopColor="#f58066" />
              </linearGradient>

              <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#8cc5ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8cc5ff" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect x="0" y="0" width="1440" height="850" fill="url(#skyGrad)" />
            <path d="M 0 680 L 450 660 L 720 675 L 1050 665 L 1440 680 L 1440 850 L 0 850 Z" fill="#0d0718" />

            {/* Angled Architectural Facade on Right */}
            <g transform="translate(1120, 220)">
              <polygon points="120,0 320,0 320,630 0,630" fill="#090412" />
              <polygon points="135,10 310,10 310,630 18,630" fill="#130920" />
              <line x1="70" y1="580" x2="160" y2="40" stroke="#ea5d56" strokeWidth="2" opacity="0.25" />
              <line x1="120" y1="590" x2="200" y2="40" stroke="#ea5d56" strokeWidth="2" opacity="0.25" />
            </g>

            {/* Road & Curb */}
            <path d="M 0 740 Q 520 710, 980 745 L 1440 770 L 1440 850 L 0 850 Z" fill="#06030a" />
            <path d="M 120 745 Q 560 715, 960 747" stroke="#2554b3" strokeWidth="5" strokeDasharray="14 14" fill="none" />

            {/* PALM TREE 1 (Swaying Fronds in the Wind) */}
            <g transform="translate(220, 470)">
              <path d="M 35 270 Q 30 140, 45 0" stroke="#08040f" strokeWidth="7.5" strokeLinecap="round" />
              <g className="breeze-tree-left">
                <path d="M 45 0 Q -30 -20, -55 40" stroke="#08040f" strokeWidth="4" fill="none" className="frond-sway-1" />
                <path d="M 45 0 Q 0 -50, 15 -75" stroke="#08040f" strokeWidth="4" fill="none" className="frond-sway-2" />
                <path d="M 45 0 Q 85 -45, 120 -15" stroke="#08040f" strokeWidth="4" fill="none" className="frond-sway-3" />
                <path d="M 45 0 Q 130 -10, 145 45" stroke="#08040f" strokeWidth="4" fill="none" className="frond-sway-4" />
                <path d="M 45 0 Q 45 35, 35 85" stroke="#08040f" strokeWidth="4" fill="none" className="frond-sway-5" />
              </g>
            </g>

            {/* PALM TREE 2 (Swaying Fronds in the Wind) */}
            <g transform="translate(690, 490)">
              <path d="M 28 250 Q 25 120, 34 0" stroke="#08040f" strokeWidth="6" strokeLinecap="round" />
              <g className="breeze-tree-right">
                <path d="M 34 0 Q -35 -20, -45 35" stroke="#08040f" strokeWidth="3.5" fill="none" className="frond-sway-2" />
                <path d="M 34 0 Q 18 -45, 28 -68" stroke="#08040f" strokeWidth="3.5" fill="none" className="frond-sway-3" />
                <path d="M 34 0 Q 85 -30, 105 25" stroke="#08040f" strokeWidth="3.5" fill="none" className="frond-sway-1" />
                <path d="M 34 0 Q 45 30, 38 65" stroke="#08040f" strokeWidth="3.5" fill="none" className="frond-sway-4" />
              </g>
            </g>

            {/* Street Lamp on Left with Glowing Light Beam */}
            <g transform="translate(70, 290)">
              <path d="M 20 450 L 20 100 Q 20 20, 70 15 L 90 20" stroke="#251a36" strokeWidth="4.5" fill="none" />
              <rect x="85" y="16" width="16" height="7" rx="2" fill="#ffffff" />
              <polygon points="93,23 0,510 260,510" fill="url(#lampGlow)" opacity="0.32" />
              <circle cx="93" cy="23" r="16" fill="url(#lampGlow)" />
              <circle cx="93" cy="23" r="5" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* FOREGROUND CONTENT */}
        <div className="frame-content-overlay">
          
          {/* TOP BAR: YOUR ANIMATED MOTION LOGO IN PLACE OF EMAIL */}
          <div className="frame-top-bar">
            <Link href="/" title="SaidWhen Home" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <SaidWhenLogo 
                width={250} 
                height={62} 
                color="#e6dfd5" 
                accentColor="#f58066" 
                animated={true} 
              />
            </Link>

            <div className="cream-access-pill">
              <span className="pill-text">drop audio or query</span>
              <Link href="/app" className="pill-btn">
                Launch Studio &rarr;
              </Link>
            </div>
          </div>

          {/* Numbered Editorial Columns */}
          <div className="frame-columns-grid">
            <div className="frame-col">
              <span className="col-num">&copy; 01 THE RECORD</span>
              <p>Zoom, Google Meet, WhatsApp voice notes, or phone audio. Drop raw recordings directly.</p>
            </div>

            <div className="frame-col">
              <span className="col-num">&copy; 02 THE MEMORY</span>
              <p>Type what you half-remember. We match spoken conversational intent, not exact words.</p>
            </div>

            <div className="frame-col">
              <span className="col-num">&copy; 03 THE SECOND</span>
              <p>Jumps the playhead straight to the exact millisecond decisions were agreed upon.</p>
            </div>

            <div className="frame-col">
              <span className="col-num">&copy; 04 PRIVACY</span>
              <p>Local in-browser session. Zero training on your voice, zero audio resale.</p>
            </div>
          </div>

          {/* BOTTOM STAGE: Giant Serif Wordmark + Iridescent Bloom */}
          <div className="frame-bottom-stage">
            <div className="iridescent-bloom-aura" />
            <div className="grand-serif-saidwhen">
              SaidWhen
            </div>
          </div>

          {/* Micro-Meta Bottom Line */}
          <div className="frame-micro-meta">
            <span>EST. MMXXVI &bull; SOUND INTELLIGENCE</span>
            <div className="meta-links">
              <Link href="/app">WEB STUDIO</Link>
              <span>&bull;</span>
              <span>TERMS</span>
              <span>&bull;</span>
              <span>PRIVACY</span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}