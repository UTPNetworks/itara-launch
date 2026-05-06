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

    // Mock product visualization based on item type
    const renderProductArt = () => {
      const gradId = `grad-${item.id}`;

      if (item.kind === 'LLM') {
        return (
          <svg viewBox="0 0 240 165" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={c} stopOpacity="0.3" />
                <stop offset="100%" stopColor={c} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <rect width="240" height="165" fill={`url(#${gradId})`} />
            <circle cx="120" cy="60" r="35" fill={c} opacity="0.4" />
            <circle cx="120" cy="60" r="30" fill="none" stroke={c} strokeWidth="1.5" opacity="0.6" />
            <path d="M 80 100 Q 120 80 160 100" fill="none" stroke={c} strokeWidth="2" opacity="0.5" />
            <path d="M 85 110 Q 120 95 155 110" fill="none" stroke={c} strokeWidth="1.5" opacity="0.4" />
            <circle cx="120" cy="60" r="8" fill={c} opacity="0.9" />
          </svg>
        );
      }

      if (item.kind === 'GPU' || item.kind === 'GPU RENT') {
        return (
          <svg viewBox="0 0 240 165" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={c} stopOpacity="0.3" />
                <stop offset="100%" stopColor={c} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <rect width="240" height="165" fill={`url(#${gradId})`} />
            <rect x="60" y="40" width="120" height="85" fill="none" stroke={c} strokeWidth="2" opacity="0.7" rx="4" />
            <rect x="70" y="50" width="30" height="30" fill={c} opacity="0.3" rx="2" />
            <rect x="105" y="50" width="30" height="30" fill={c} opacity="0.5" rx="2" />
            <rect x="140" y="50" width="30" height="30" fill={c} opacity="0.3" rx="2" />
            <line x1="65" y1="95" x2="175" y2="95" stroke={c} strokeWidth="1" opacity="0.4" />
            <circle cx="80" cy="110" r="4" fill={c} opacity="0.6" />
            <circle cx="120" cy="110" r="4" fill={c} opacity="0.6" />
            <circle cx="160" cy="110" r="4" fill={c} opacity="0.6" />
          </svg>
        );
      }

      if (item.kind === 'AGENT') {
        return (
          <svg viewBox="0 0 240 165" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={c} stopOpacity="0.3" />
                <stop offset="100%" stopColor={c} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <rect width="240" height="165" fill={`url(#${gradId})`} />
            <circle cx="120" cy="55" r="18" fill={c} opacity="0.7" />
            <circle cx="120" cy="55" r="15" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5" />
            <rect x="70" y="90" width="100" height="50" fill={c} opacity="0.15" rx="6" />
            <path d="M 90 90 L 90 110" stroke={c} strokeWidth="1.5" opacity="0.6" />
            <path d="M 120 90 L 120 110" stroke={c} strokeWidth="1.5" opacity="0.6" />
            <path d="M 150 90 L 150 110" stroke={c} strokeWidth="1.5" opacity="0.6" />
            <circle cx="85" cy="125" r="3" fill={c} opacity="0.8" />
            <circle cx="120" cy="125" r="3" fill={c} opacity="0.8" />
            <circle cx="155" cy="125" r="3" fill={c} opacity="0.8" />
          </svg>
        );
      }

      if (item.kind === 'VISION' || item.kind === 'CODE' || item.kind === 'AUDIO') {
        return (
          <svg viewBox="0 0 240 165" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={c} stopOpacity="0.3" />
                <stop offset="100%" stopColor={c} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <rect width="240" height="165" fill={`url(#${gradId})`} />
            {item.kind === 'CODE' && (
              <>
                <rect x="50" y="45" width="140" height="75" fill="none" stroke={c} strokeWidth="1.5" opacity="0.6" rx="3" />
                <line x1="60" y1="55" x2="100" y2="55" stroke={c} strokeWidth="1" opacity="0.5" />
                <line x1="60" y1="70" x2="110" y2="70" stroke={c} strokeWidth="1" opacity="0.5" />
                <line x1="60" y1="85" x2="90" y2="85" stroke={c} strokeWidth="1" opacity="0.5" />
                <line x1="60" y1="100" x2="105" y2="100" stroke={c} strokeWidth="1" opacity="0.5" />
              </>
            )}
            {item.kind === 'VISION' && (
              <>
                <circle cx="120" cy="75" r="35" fill="none" stroke={c} strokeWidth="1.5" opacity="0.6" />
                <circle cx="120" cy="75" r="25" fill={c} opacity="0.2" />
                <circle cx="120" cy="75" r="12" fill={c} opacity="0.5" />
              </>
            )}
            {item.kind === 'AUDIO' && (
              <>
                <path d="M 100 65 Q 110 45 120 60 Q 130 45 140 65" fill="none" stroke={c} strokeWidth="2" opacity="0.6" />
                <path d="M 95 80 Q 110 50 120 75 Q 130 50 145 80" fill="none" stroke={c} strokeWidth="1.5" opacity="0.4" />
                <line x1="120" y1="45" x2="120" y2="105" stroke={c} strokeWidth="1" opacity="0.3" />
              </>
            )}
          </svg>
        );
      }

      // Default/fallback visualization
      return (
        <svg viewBox="0 0 240 165" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c} stopOpacity="0.3" />
              <stop offset="100%" stopColor={c} stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <rect width="240" height="165" fill={`url(#${gradId})`} />
          <circle cx="60" cy="50" r="12" fill={c} opacity="0.6" />
          <circle cx="120" cy="70" r="14" fill={c} opacity="0.5" />
          <circle cx="180" cy="45" r="11" fill={c} opacity="0.7" />
          <path d="M 60 50 L 120 70 L 180 45" fill="none" stroke={c} strokeWidth="1" opacity="0.3" />
        </svg>
      );
    };

    return (
      <div
        className={`mkt-card mkt-card-${size}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onOpen?.(item)}
      >
        <div className="mkt-card-art" style={{ background: `linear-gradient(135deg, ${c}22, ${c}66)` }}>
          {renderProductArt()}
          <div className="mkt-card-kind" style={{ color: c, position: 'relative', zIndex: 2 }}>{item.kind}</div>
          <div className="mkt-card-sigil" style={{ color: c, position: 'relative', zIndex: 2 }}>
            {item.kind === 'LLM' ? '◈' : item.kind === 'AGENT' ? '◉' : item.kind === 'VISION' ? '◆' :
             item.kind === 'AUDIO' ? '♪' : item.kind === 'CODE' ? '§' : item.kind === 'GPU' ? '▣' :
             item.kind === 'CREDITS' ? '¢' : item.kind === 'API' ? '⎔' : item.kind.includes('SERVER') ? '▤' :
             item.kind === 'GPU RENT' ? '⏱' : '◧'}
          </div>
          {item.tag && <span className="mkt-card-tag" style={{ background: c, color: c === '#FFD84D' ? '#0A0A0C' : '#F4F2EC', position: 'relative', zIndex: 3 }}>{item.tag}</span>}
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
            <div className="mkt-detail-art" style={{ background: `linear-gradient(135deg, ${c}33, ${c}88, ${c}33)` }}>
              <div className="mkt-detail-sigil" style={{ color: c }}>
                {item.kind === 'LLM' ? '◈' : item.kind === 'AGENT' ? '◉' : item.kind === 'GPU' ? '▣' : '◆'}
              </div>
              <div className="mkt-detail-kind" style={{ color: c }}>{item.kind}</div>
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

  window.MKT = {
    SearchBar, PillRow, ProductCard, ProductRow, MiniChart, LiveDot, LivePrice,
    formatPrice, filterItems, DetailView, kindColor,
  };
})();
