// Itara Market — shared primitives
// Exports: window.MKT = { SearchBar, PillRow, ProductCard, MiniChart, LiveDot, formatPrice, DetailView, Drawer, sortItems, filterItems }

(() => {
  const { useState, useEffect, useRef, useMemo } = React;
  const M = window.ITARA_MARKET;

  // ---- format ----
  function formatPrice(p, unit = '') {
    if (p >= 1000) return '$' + p.toLocaleString() + unit;
    if (p >= 10) return '$' + p.toFixed(0) + unit;
    if (p >= 1) return '$' + p.toFixed(2) + unit;
    return '$' + p.toFixed(4) + unit;
  }

  // ---- Tiny sparkline (for hover chart) ----
  function MiniChart({ seed = 1, color = '#6C5CE7', w = 220, h = 56, points = 28, bias = 0 }) {
    const data = useMemo(() => {
      const rng = (s => () => { s = (s * 9301 + 49297) % 233280; return s / 233280; })(seed * 1000 + 7);
      const out = [];
      let v = 50 + rng() * 30;
      for (let i = 0; i < points; i++) {
        v += (rng() - 0.5) * 14 + bias * 0.6;
        out.push(Math.max(5, Math.min(95, v)));
      }
      return out;
    }, [seed, bias, points]);
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return `${x},${y}`;
    }).join(' ');
    const area = `M 0,${h} L ${pts.split(' ').join(' L ')} L ${w},${h} Z`;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mkt-mini">
        <defs>
          <linearGradient id={`mkt-grad-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.45" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#mkt-grad-${seed})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  }

  // ---- Live price (ticks every ~2s if active) ----
  function useLivePrice(initial, delta, active = true, hz = 2200) {
    const [p, setP] = useState(initial);
    const [flash, setFlash] = useState(null);
    useEffect(() => {
      if (!active) return;
      const t = setInterval(() => {
        const jitter = (Math.random() - 0.5) * (initial * 0.02) + (delta / 200) * initial;
        setP(prev => {
          const next = Math.max(initial * 0.5, +(prev + jitter).toFixed(initial > 100 ? 0 : 2));
          setFlash(next >= prev ? 'up' : 'down');
          return next;
        });
        setTimeout(() => setFlash(null), 400);
      }, hz + Math.random() * 800);
      return () => clearInterval(t);
    }, [initial, delta, active, hz]);
    return [p, flash];
  }

  function LivePrice({ value, unit, delta, color, active = true }) {
    const [p, flash] = useLivePrice(value, delta, active);
    return (
      <span className={`mkt-live-p ${flash || ''}`} style={{ color: color || '' }}>
        {formatPrice(p, '')}
        {unit && <small>{unit}</small>}
      </span>
    );
  }

  // ---- LiveDot ----
  function LiveDot({ color = '#4ADE80' }) {
    return <span className="mkt-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />;
  }

  // ---- Search bar ----
  function SearchBar({ value, onChange, placeholder = 'Search models, agents, GPUs, credits…', large = false }) {
    return (
      <div className={`mkt-search ${large ? 'mkt-search-lg' : ''}`}>
        <span className="mkt-search-icon">⌕</span>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <kbd>⌘K</kbd>
      </div>
    );
  }

  // ---- Pill row (categories) ----
  function PillRow({ cats, active, onPick }) {
    return (
      <div className="mkt-pills">
        {cats.map(c => (
          <button
            key={c.id}
            className={`mkt-pill ${active === c.id ? 'active' : ''}`}
            onClick={() => onPick(c.id)}
          >
            {c.label}
            <span className="mkt-pill-n">{c.count.toLocaleString()}</span>
          </button>
        ))}
      </div>
    );
  }

  // ---- Auth Dropdown ----
  function CommandPageProfileDropdown({ isOpen, onClose, avatarRef, onOpenProfile, user }) {
    const dropdownRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, right: 0 });

    useEffect(() => {
      if (isOpen && avatarRef.current) {
        const rect = avatarRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 12,
          right: window.innerWidth - rect.right
        });
      }
    }, [isOpen, avatarRef]);

    useEffect(() => {
      function handleClickOutside(e) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          if (avatarRef.current && !avatarRef.current.contains(e.target)) {
            onClose();
          }
        }
      }
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, onClose, avatarRef]);

    if (!isOpen) return null;

    const name = user?.user_metadata?.full_name || user?.email || 'User';

    return (
      <div className="dB-profile-dropdown" ref={dropdownRef} style={{ position: 'fixed', top: `${position.top}px`, right: `${position.right}px`, zIndex: 1001, background: 'var(--ink-2)', border: '1px solid var(--line-2)', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', minWidth: '220px' }}>
        <div className="dB-profile-header" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <div className="dB-profile-avatar-large" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--violet)', display: 'grid', placeItems: 'center', fontWeight: 'bold', color: 'white' }}>{name[0].toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div className="dB-profile-name" style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--bone)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div className="dB-profile-tier" style={{ fontSize: '11px', color: 'var(--mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <div className="dB-profile-divider" style={{ height: '1px', background: 'var(--line)', margin: '0 -16px 12px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button className="dB-dropdown-item" style={{ background: 'transparent', border: '0', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', color: 'var(--bone)', cursor: 'pointer', fontSize: '13px' }} onClick={() => { onOpenProfile('profile'); onClose(); }}>Profile</button>
          <button className="dB-dropdown-item" style={{ background: 'transparent', border: '0', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', color: 'var(--bone)', cursor: 'pointer', fontSize: '13px' }} onClick={() => { onOpenProfile('listings'); onClose(); }}>My Listings</button>
          <button className="dB-dropdown-item" style={{ background: 'transparent', border: '0', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', color: 'var(--bone)', cursor: 'pointer', fontSize: '13px' }} onClick={() => { onOpenProfile('security'); onClose(); }}>Security & MFA</button>
          <div className="dB-profile-divider" style={{ height: '1px', background: 'var(--line)', margin: '4px -16px' }}></div>
          <button className="dB-dropdown-item dB-dropdown-danger" style={{ background: 'transparent', border: '0', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', color: '#FF5C5C', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }} onClick={() => { onOpenProfile('signout'); onClose(); }}>Sign out</button>
        </div>
      </div>
    );
  }

  // Professional Profile Page with sidebar
  function ProfilePage({ onClose, user, initialSection = 'overview' }) {
    const [activeSection, setActiveSection] = useState(initialSection);
    const email = user?.email || 'user@itara.ai';
    const name = user?.user_metadata?.full_name || 'User';

    const sections = [
      { id: 'overview', label: 'Overview' },
      { id: 'listings', label: 'My Listings' },
      { id: 'security', label: 'Security & MFA' },
    ];

    if (activeSection === 'signout') {
      (async () => {
        if (window.supabase) {
          const { error } = await window.supabase.auth.signOut();
          window.location.href = '/index.html';
        }
      })();
      return null;
    }

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
        <div style={{ background: 'var(--ink)', border: '1px solid var(--line-2)', borderRadius: '24px', width: '100%', maxWidth: '1000px', height: '80vh', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} onClick={e => e.stopPropagation()}>
          {/* Left Sidebar */}
          <div style={{ width: '260px', background: 'var(--ink-2)', borderRight: '1px solid var(--line)', padding: '40px 0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 32px', marginBottom: '40px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet) 0%, var(--pink) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px', color: 'white', fontWeight: 'bold' }}>{name[0].toUpperCase()}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--bone)', marginBottom: '4px' }}>{name}</div>
              <div style={{ fontSize: '12px', color: 'var(--mute)', wordBreak: 'break-all' }}>{email}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    padding: '12px 32px',
                    textAlign: 'left',
                    border: 'none',
                    background: activeSection === section.id ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                    color: activeSection === section.id ? 'var(--violet)' : 'var(--mute)',
                    fontWeight: activeSection === section.id ? 'bold' : '500',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderLeft: `3px solid ${activeSection === section.id ? 'var(--violet)' : 'transparent'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveSection('signout')}
              style={{
                marginTop: 'auto',
                width: '100%',
                padding: '12px 32px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                color: '#FF5C5C',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Sign out
            </button>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: '48px', overflowY: 'auto', color: 'var(--bone)' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--mute)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>✕ CLOSE</button>
            
            {activeSection === 'overview' && (
              <div>
                <h2 style={{ fontSize: '32px', marginBottom: '32px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>Profile Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                  <div style={{ background: 'var(--ink-2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                    <div style={{ color: 'var(--mute)', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '8px' }}>MEMBERSHIP</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--violet)' }}>FREE PLAN</div>
                  </div>
                  <div style={{ background: 'var(--ink-2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                    <div style={{ color: 'var(--mute)', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '8px' }}>MEMBER SINCE</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>APR 2026</div>
                  </div>
                </div>
                <div style={{ background: 'var(--ink-2)', padding: '32px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Personal Info</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ color: 'var(--mute)', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>FULL NAME</div>
                      <div style={{ fontSize: '14px' }}>{name}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--mute)', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>EMAIL ADDRESS</div>
                      <div style={{ fontSize: '14px' }}>{email}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'listings' && (
              <div>
                <h2 style={{ fontSize: '32px', marginBottom: '32px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>My Listings</h2>
                <div style={{ background: 'var(--ink-2)', padding: '48px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                  <div style={{ color: 'var(--bone)', fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>No active listings</div>
                  <div style={{ color: 'var(--mute)', fontSize: '14px', marginBottom: '24px' }}>Start selling your AI models, agents, or compute.</div>
                  <button onClick={() => { onClose(); if(window.openListingModal) window.openListingModal(); }} style={{ background: 'var(--violet)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ CREATE LISTING</button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h2 style={{ fontSize: '32px', marginBottom: '32px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>Security & MFA</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'var(--ink-2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: '13px', color: 'var(--mute)' }}>Add an extra layer of security to your account.</div>
                    </div>
                    <button style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--bone)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>ENABLE</button>
                  </div>
                  <div style={{ background: 'var(--ink-2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Passkeys</div>
                      <div style={{ fontSize: '13px', color: 'var(--mute)' }}>Login using biometrics or security keys.</div>
                    </div>
                    <button style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--bone)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>ADD KEY</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- Product card (square, hover chart) ----
  const KIND_COLOR = {
    LLM: '#6C5CE7', AGENT: '#FF6AC7', VISION: '#4A7BFF', AUDIO: '#FFD84D',
    CODE: '#4ADE80', GPU: '#FF6AC7', WORKSTATION: '#4A7BFF', 'AI PC': '#4A7BFF',
    'AI PHONE': '#6C5CE7', 'AI TABLET': '#6C5CE7', SERVER: '#FFD84D', 'AI SERVER': '#FFD84D',
    'GPU RENT': '#FF6AC7', CREDITS: '#4ADE80', API: '#6C5CE7', STORAGE: '#4A7BFF',
    'VECTOR DB': '#4A7BFF', INFERENCE: '#FF6AC7',
  };
  const kindColor = (k) => KIND_COLOR[k] || '#6C5CE7';

  function ProductCard({ item, onOpen, size = 'md', live = true }) {
    const [hover, setHover] = useState(false);
    const c = kindColor(item.kind);

    // Render type-specific visual elements
    const renderArtVisual = () => {
      if (item.imageUrl) {
        return (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="mkt-card-img"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
              transform: hover ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        );
      }

      const seed = item.name.length * 7;
      const rng = (() => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();

      if (item.kind === 'LLM') {
        return (
          <svg viewBox="0 0 100 100" className="mkt-card-visual" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
            <rect x="10" y="20" width="30" height="60" fill="none" stroke={c} strokeWidth="1.5" rx="2"/>
            <rect x="50" y="15" width="35" height="70" fill="none" stroke={c} strokeWidth="1.5" rx="2"/>
            <circle cx="25" cy="35" r="4" fill={c} opacity="0.7"/>
            <circle cx="67" cy="30" r="5" fill={c} opacity="0.6"/>
            <line x1="15" y1="50" x2="35" y2="50" stroke={c} strokeWidth="1" opacity="0.5"/>
            <line x1="55" y1="50" x2="80" y2="50" stroke={c} strokeWidth="1" opacity="0.5"/>
          </svg>
        );
      } else if (item.kind === 'GPU') {
        return (
          <svg viewBox="0 0 100 100" className="mkt-card-visual" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
            <rect x="15" y="15" width="70" height="70" fill="none" stroke={c} strokeWidth="2" rx="3"/>
            {[0,1,2,3].map(i => <rect key={i} x={25+i*15} y="30" width="10" height="50" fill={c} opacity={0.3+i*0.15} rx="1"/>)}
            <line x1="20" y1="25" x2="80" y2="25" stroke={c} strokeWidth="1.5" opacity="0.5"/>
          </svg>
        );
      } else if (item.kind === 'AGENT') {
        return (
          <svg viewBox="0 0 100 100" className="mkt-card-visual" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
            <circle cx="50" cy="40" r="18" fill="none" stroke={c} strokeWidth="2"/>
            <circle cx="50" cy="40" r="10" fill={c} opacity="0.4"/>
            <line x1="35" y1="50" x2="25" y2="65" stroke={c} strokeWidth="2"/>
            <line x1="65" y1="50" x2="75" y2="65" stroke={c} strokeWidth="2"/>
            <circle cx="25" cy="65" r="5" fill="none" stroke={c} strokeWidth="1.5"/>
            <circle cx="75" cy="65" r="5" fill="none" stroke={c} strokeWidth="1.5"/>
          </svg>
        );
      } else if (item.kind === 'VISION') {
        return (
          <svg viewBox="0 0 100 100" className="mkt-card-visual" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
            <circle cx="50" cy="45" r="28" fill="none" stroke={c} strokeWidth="2"/>
            <circle cx="50" cy="45" r="18" fill="none" stroke={c} strokeWidth="1.5" opacity="0.6"/>
            <circle cx="50" cy="45" r="8" fill={c} opacity="0.5"/>
            <path d="M 50 20 Q 60 30 60 45 Q 60 60 50 70 Q 40 60 40 45 Q 40 30 50 20" fill="none" stroke={c} strokeWidth="1" opacity="0.4"/>
          </svg>
        );
      } else if (item.kind === 'AUDIO') {
        return (
          <svg viewBox="0 0 100 100" className="mkt-card-visual" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
            <circle cx="50" cy="50" r="8" fill={c} opacity="0.7"/>
            <path d="M 50 50 Q 35 35 35 50 Q 35 65 50 50" fill="none" stroke={c} strokeWidth="2" opacity="0.6"/>
            <path d="M 50 50 Q 30 30 30 50 Q 30 70 50 50" fill="none" stroke={c} strokeWidth="1.5" opacity="0.4"/>
            <path d="M 50 50 Q 65 35 65 50 Q 65 65 50 50" fill="none" stroke={c} strokeWidth="2" opacity="0.6"/>
            <path d="M 50 50 Q 70 30 70 50 Q 70 70 50 50" fill="none" stroke={c} strokeWidth="1.5" opacity="0.4"/>
          </svg>
        );
      } else if (item.kind === 'CODE') {
        return (
          <svg viewBox="0 0 100 100" className="mkt-card-visual" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
            <path d="M 25 30 L 40 50 L 25 70" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 75 30 L 60 50 L 75 70" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="45" y1="25" x2="55" y2="75" stroke={c} strokeWidth="1.5" opacity="0.5"/>
            <circle cx="50" cy="50" r="22" fill="none" stroke={c} strokeWidth="1" opacity="0.3" strokeDasharray="3,3"/>
          </svg>
        );
      } else {
        // Default visual for other types
        return (
          <svg viewBox="0 0 100 100" className="mkt-card-visual" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
            <defs>
              <pattern id={`pat-${seed}`} patternUnits="userSpaceOnUse" width="10" height="10">
                <line x1="0" y1="0" x2="10" y2="10" stroke={c} strokeWidth="0.8" opacity="0.4"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={`url(#pat-${seed})`}/>
            <circle cx="50" cy="50" r="25" fill="none" stroke={c} strokeWidth="1.5" opacity="0.6"/>
          </svg>
        );
      }
    };

    return (
      <div
        className={`mkt-card mkt-card-${size}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onOpen?.(item)}
      >
        <div className="mkt-card-art" style={{ background: `linear-gradient(135deg, ${c}22, ${c}66)`, position: 'relative', overflow: 'hidden' }}>
          {renderArtVisual()}
          <div className="mkt-card-overlay" style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(10, 10, 12, 0.7) 100%)',
            opacity: item.imageUrl ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }} />
          <div className="mkt-card-kind" style={{ color: item.imageUrl ? '#FFFFFF' : c, position: 'relative', zIndex: 2, textShadow: item.imageUrl ? '0 1px 4px rgba(0,0,0,0.4)' : 'none' }}>{item.kind}</div>
          {!item.imageUrl && (
            <div className="mkt-card-sigil" style={{ color: c, position: 'relative', zIndex: 2, fontSize: '3em' }}>
              {item.kind === 'LLM' ? '◈' : item.kind === 'AGENT' ? '◉' : item.kind === 'VISION' ? '◆' :
               item.kind === 'AUDIO' ? '♪' : item.kind === 'CODE' ? '§' : item.kind === 'GPU' ? '▣' :
               item.kind === 'CREDITS' ? '¢' : item.kind === 'API' ? '⎔' : item.kind.includes('SERVER') ? '▤' :
               item.kind === 'GPU RENT' ? '⏱' : '◧'}
            </div>
          )}
          {item.tag && <span className="mkt-card-tag" style={{ background: c, color: c === '#FFD84D' ? '#0A0A0C' : '#F4F2EC', position: 'relative', zIndex: 2 }}>{item.tag}</span>}
          {hover && <div className="mkt-card-chart"><MiniChart seed={item.name.length * 3} color={c} bias={item.delta / 20} w={220} h={80} /></div>}
        </div>
        <div className="mkt-card-body">
          <div className="mkt-card-name">{item.name}</div>
          <div className="mkt-card-creator">{item.creator}</div>
          <div className="mkt-card-foot">
            <LivePrice value={item.price} unit={item.priceUnit} delta={item.delta} color={c} active={live} />
            <span className={`mkt-card-delta ${item.delta >= 0 ? 'up' : 'down'}`}>
              {item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ---- Compact row ----
  function ProductRow({ item, onOpen, live = true, rank }) {
    const c = kindColor(item.kind);
    return (
      <div className="mkt-row" onClick={() => onOpen?.(item)}>
        {rank && <span className="mkt-row-rank">{rank}</span>}
        <span className="mkt-row-sigil" style={{ color: c }}>
          {item.kind === 'LLM' ? '◈' : item.kind === 'AGENT' ? '◉' : item.kind === 'GPU' ? '▣' : item.kind === 'GPU RENT' ? '⏱' : '◆'}
        </span>
        <div className="mkt-row-main">
          <div className="mkt-row-name">{item.name}</div>
          <div className="mkt-row-sub">{item.creator} · {item.kind}</div>
        </div>
        <span className="mkt-row-rating">★ {item.rating}</span>
        <span className="mkt-row-price"><LivePrice value={item.price} unit={item.priceUnit} delta={item.delta} color={c} active={live} /></span>
        <span className={`mkt-row-delta ${item.delta >= 0 ? 'up' : 'down'}`}>{item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}%</span>
      </div>
    );
  }

  // ---- Filter + sort ----
  function filterItems(items, { cat, q, priceMax, sort }) {
    let out = items;
    if (cat && cat !== 'all') out = out.filter(i => i.cat === cat);
    if (q) {
      const s = q.toLowerCase();
      out = out.filter(i => i.name.toLowerCase().includes(s) || i.creator.toLowerCase().includes(s) || i.kind.toLowerCase().includes(s));
    }
    if (priceMax != null) out = out.filter(i => i.price <= priceMax);
    if (sort === 'new') out = [...out].sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0) || b.sales - a.sales);
    if (sort === 'trending') out = [...out].sort((a,b) => b.delta - a.delta);
    if (sort === 'top') out = [...out].sort((a,b) => b.rating - a.rating);
    if (sort === 'price-asc') out = [...out].sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') out = [...out].sort((a,b) => b.price - a.price);
    if (sort === 'popular' || !sort) out = [...out].sort((a,b) => b.sales - a.sales);
    return out;
  }

  // ---- Full-page detail view ----
  function DetailView({ item, onClose, live = true }) {
    const c = kindColor(item.kind);
    const similar = M.ITEMS.filter(i => i.cat === item.cat && i.id !== item.id).slice(0, 4);
    return (
      <div className="mkt-detail" onClick={(e) => { if (e.target.classList.contains('mkt-detail')) onClose(); }}>
        <div className="mkt-detail-inner">
          <button className="mkt-detail-close" onClick={onClose}>✕ CLOSE</button>

          <div className="mkt-detail-hero">
            <div className="mkt-detail-art" style={{ background: `linear-gradient(135deg, ${c}33, ${c}88, ${c}33)`, position: 'relative', overflow: 'hidden' }}>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <div className="mkt-card-overlay" style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 30%, rgba(10, 10, 12, 0.8) 100%)',
                opacity: item.imageUrl ? 1 : 0
              }} />
              {!item.imageUrl && (
                <div className="mkt-detail-sigil" style={{ color: c, position: 'relative', zIndex: 2 }}>
                  {item.kind === 'LLM' ? '◈' : item.kind === 'AGENT' ? '◉' : item.kind === 'GPU' ? '▣' : '◆'}
                </div>
              )}
              <div className="mkt-detail-kind" style={{ color: item.imageUrl ? '#FFFFFF' : c, position: 'relative', zIndex: 2, textShadow: item.imageUrl ? '0 1px 8px rgba(0,0,0,0.5)' : 'none' }}>{item.kind}</div>
            </div>
            <div className="mkt-detail-meta">
              <div className="mkt-eyebrow">§ {item.creator}</div>
              <h1 className="mkt-detail-h1">{item.name}</h1>
              <p className="mkt-detail-desc">
                {item.kind === 'LLM' ? 'An open-weight language model. Instruction-tuned, multilingual, benchmarked against frontier systems. MIT license with commercial usage.' :
                 item.kind === 'AGENT' ? 'Autonomous execution agent. Browser control, tool use, long-context memory. Handles 30+ hour continuous operation with checkpointing.' :
                 item.kind === 'GPU' ? 'Enterprise-class graphics accelerator. Shipped from authorized distributor. 3-year warranty. Volume discounts available.' :
                 item.kind === 'GPU RENT' ? 'Bare-metal compute cluster. InfiniBand interconnect. Per-second billing. SSH access within 90 seconds of purchase.' :
                 'Premium AI infrastructure. Verified by Itara. Pays out in escrow on delivery.'}
              </p>
              <div className="mkt-detail-stats">
                <div><span>RATING</span><b>★ {item.rating}</b></div>
                <div><span>SALES</span><b>{item.sales.toLocaleString()}</b></div>
                <div><span>PRICE</span><b style={{ color: c }}><LivePrice value={item.price} unit={item.priceUnit} delta={item.delta} active={live} /></b></div>
                <div><span>CHANGE 24H</span><b className={item.delta >= 0 ? 'up' : 'down'}>{item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}%</b></div>
              </div>
              <div className="mkt-detail-ctas">
                <button className="mkt-cta-primary" style={{ background: c, color: c === '#FFD84D' ? '#0A0A0C' : '#F4F2EC' }}>
                  {item.priceUnit === '/hr' ? 'RENT NOW →' : item.priceUnit === '/mo' ? 'SUBSCRIBE →' : item.kind === 'GPU' || item.kind.includes('SERVER') || item.kind === 'WORKSTATION' || item.kind.includes('AI') ? 'BUY NOW →' : 'PURCHASE →'}
                </button>
                <button className="mkt-cta-ghost">ADD TO COLLECTION</button>
                <button className="mkt-cta-ghost">TRY DEMO</button>
              </div>
            </div>
          </div>

          <div className="mkt-detail-grid">
            <div className="mkt-detail-panel">
              <div className="mkt-panel-k">§ PRICE · LAST 30 DAYS</div>
              <MiniChart seed={item.name.length * 7} color={c} w={600} h={200} points={42} bias={item.delta / 10} />
              <div className="mkt-detail-chart-foot">
                <span>30D LOW <b>{formatPrice(item.price * 0.82)}</b></span>
                <span>30D HIGH <b>{formatPrice(item.price * 1.18)}</b></span>
                <span>AVG <b>{formatPrice(item.price)}</b></span>
              </div>
            </div>

            <div className="mkt-detail-panel">
              <div className="mkt-panel-k">§ SPECS</div>
              <div className="mkt-specs">
                {(item.cat === 'llm' ? [['Parameters','70B'],['Context','128K'],['Quantization','Q4 / Q8 / FP16'],['License','Apache 2.0'],['Languages','42']] :
                  item.cat === 'agent' ? [['Max session','30 hr'],['Tools','Browser, Code, Shell'],['Memory','Vector + Episodic'],['Runtime','Docker / K8s']] :
                  item.cat === 'gpu' ? [['VRAM','80 GB HBM3'],['FP16','989 TFLOPS'],['Interface','SXM5'],['Warranty','3 years']] :
                  item.cat === 'compute' ? [['GPUs','8× H100'],['Interconnect','NVLink 900GB/s'],['Region','US-East-1'],['Billing','Per second']] :
                  [['Delivery','< 24h digital'],['Refund','30 days'],['Support','Priority']]
                ).map(([k, v]) => (
                  <div key={k} className="mkt-spec"><span>{k}</span><b>{v}</b></div>
                ))}
              </div>
            </div>
          </div>

          <div className="mkt-detail-sim">
            <div className="mkt-panel-k">§ SIMILAR ON ITARA</div>
            <div className="mkt-sim-grid">
              {similar.map(s => <ProductCard key={s.id} item={s} size="sm" live={live} onOpen={(it) => { onClose(); setTimeout(() => window.MKT.openItem?.(it), 40); }} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Error Boundary ----
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
      console.error("Market Runtime Error:", error, errorInfo);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⛈️</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Terminal Session Crashed</h2>
            <p style={{ color: 'rgba(244,242,236,0.6)', maxWidth: '500px', lineHeight: '1.6', marginBottom: '32px' }}>
              The Itara Market interface encountered a runtime exception. Your session remains secure, but the view needs to be reset.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => window.location.reload()} style={{ background: '#6C5CE7', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>RELOAD TERMINAL</button>
              <button onClick={() => this.setState({ hasError: false })} style={{ background: 'transparent', border: '1px solid rgba(244,242,236,0.2)', color: 'white', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>TRY AGAIN</button>
            </div>
            {this.state.error && (
              <pre style={{ marginTop: '40px', padding: '16px', background: 'rgba(255,0,0,0.05)', borderRadius: '8px', fontSize: '11px', color: '#FF5C5C', maxWidth: '100%', overflow: 'auto' }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        );
      }
      return this.props.children;
    }
  }

  window.MKT = {
    SearchBar, PillRow, ProductCard, ProductRow, MiniChart, LiveDot, LivePrice,
    formatPrice, filterItems, DetailView, kindColor,
    CommandPageProfileDropdown, ProfilePage, ErrorBoundary
  };
})();
