// Shared hooks, components, and brand primitives
const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

// ---- Brand mark (SVG replica of the isometric cube) ----
function ItaraMark({ size = 28, className = '' }) {
  // Isometric cube: top face, left face, right face + magenta glow dot
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className={className} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="im-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8C7DFF" />
          <stop offset="1" stopColor="#6C5CE7" />
        </linearGradient>
        <linearGradient id="im-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5B4DD1" />
          <stop offset="1" stopColor="#3E47B8" />
        </linearGradient>
        <linearGradient id="im-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A7BFF" />
          <stop offset="1" stopColor="#2F56E0" />
        </linearGradient>
        <radialGradient id="im-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FF6AC7" stopOpacity="1" />
          <stop offset="1" stopColor="#FF4FB4" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* top rhombus */}
      <path d="M28 6 L50 18 L28 30 L6 18 Z" fill="url(#im-top)" />
      {/* left face */}
      <path d="M6 18 L28 30 L28 52 L6 40 Z" fill="url(#im-left)" />
      {/* right face */}
      <path d="M50 18 L28 30 L28 52 L50 40 Z" fill="url(#im-right)" />
      {/* inner pink glow */}
      <circle cx="28" cy="24" r="6" fill="url(#im-glow)" />
      <circle cx="28" cy="24" r="1.8" fill="#FF6AC7" />
    </svg>
  );
}

function Wordmark({ size = 22, color = 'currentColor' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <ItaraMark size={size + 6} />
      <span style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '-0.03em',
        color,
      }}>itara</span>
    </div>
  );
}

// ---- Hooks ----
function useLiveFeed(maxItems = 8, intervalMs = 1500) {
  const [items, setItems] = useState(() => {
    const seed = [];
    for (let i = 0; i < maxItems; i++) seed.push({ ...window.ITARA_DATA.genActivity(), id: Math.random(), age: i });
    return seed;
  });
  useEffect(() => {
    const t = setInterval(() => {
      setItems(prev => {
        const next = [{ ...window.ITARA_DATA.genActivity(), id: Math.random(), age: 0 }, ...prev.map(p => ({ ...p, age: p.age + 1 }))];
        return next.slice(0, maxItems);
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [maxItems, intervalMs]);
  return items;
}

function useCountUp(target, duration = 1400, format = n => n.toLocaleString()) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = now => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(target * eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target, duration]);
  return [ref, format(val)];
}

function useGpuTicker(intervalMs = 2200) {
  const [rows, setRows] = useState(() => window.ITARA_DATA.GPUS.map(g => ({ ...g, flash: null, livePrice: g.price })));
  useEffect(() => {
    const t = setInterval(() => {
      setRows(prev => prev.map(r => {
        if (Math.random() > 0.35) return { ...r, flash: null };
        const delta = (Math.random() - 0.5) * 0.12;
        const newPrice = Math.max(0.12, +(r.livePrice + delta).toFixed(2));
        return { ...r, livePrice: newPrice, flash: delta > 0 ? 'up' : 'down' };
      }));
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return rows;
}

Object.assign(window, { ItaraMark, Wordmark, useLiveFeed, useCountUp, useGpuTicker });
