// Itara Market — three variants
// A · Discovery (Spotify-for-AI rows)   B · Terminal (Bloomberg+gallery)   C · Index (brutalist list)

(() => {
  const { useState, useEffect, useRef, useMemo } = React;
  const M = window.ITARA_MARKET;
  const MKT = window.MKT;

  // =============================================================
  // VARIANT A — DISCOVERY (Spotify for AI)
  // =============================================================
  function DiscoveryPage({ onOpen, live }) {
    const [cat, setCat] = useState('all');
    const [q, setQ] = useState('');
    const [sort, setSort] = useState('popular');
    const [priceMax, setPriceMax] = useState(40000);

    const filtered = useMemo(() => MKT.filterItems(M.ITEMS, { cat, q, priceMax, sort }), [cat, q, priceMax, sort]);
    const recents = M.RECENT.map(id => M.byId[id]).filter(Boolean);

    return (
      <div className="mkA-root" data-screen-label="MA Discovery">
        {/* Top bar */}
        <header className="mkA-top">
          <div className="mkA-top-l">
            <Wordmark size={20} />
            <span className="mkA-sep" />
            <span className="mkA-crumb">MARKET</span>
          </div>
          <div className="mkA-top-r">
            <button className="mkA-link">SELL</button>
            <button className="mkA-link">COLLECTIONS</button>
            <div className="mkA-avatar">A</div>
          </div>
        </header>

        {/* Hero — search-first */}
        <section className="mkA-hero">
          <div className="mkA-hero-eyebrow">
            <MKT.LiveDot color="#4ADE80" />
            <span>ITARA MARKET · 2,847 ITEMS LIVE · UPDATED JUST NOW</span>
          </div>
          <h1 className="mkA-h1">
            Everything <span className="mkA-h1-pink">AI</span>.<br/>
            One <span className="mkA-h1-blue">market</span>.
          </h1>
          <p className="mkA-hero-sub">
            From H100 clusters to voice agents to Mac Studios. Bought, rented, subscribed, bid.
            Escrow-protected. Delivered worldwide.
          </p>
          <div className="mkA-hero-search">
            <MKT.SearchBar value={q} onChange={setQ} large />
          </div>
          <div className="mkA-hero-quick">
            <span className="mkA-hero-q-k">TRENDING SEARCHES</span>
            {['H100 spot', 'Orion-70B', 'DGX Spark', 'Voice agents', 'RTX 5090', 'API credits'].map(t => (
              <button key={t} onClick={() => setQ(t)} className="mkA-hero-q">{t}</button>
            ))}
          </div>
        </section>

        {/* Category pills */}
        <section className="mkA-pills-wrap">
          <MKT.PillRow cats={M.CATS} active={cat} onPick={setCat} />
        </section>

        {/* If search/filter active, show grid instead of rows */}
        {(q || cat !== 'all') ? (
          <section className="mkA-grid-wrap">
            <div className="mkA-grid-head">
              <div>
                <span className="mkA-k">§ RESULTS</span>
                <h2 className="mkA-h2">
                  {filtered.length} items
                  {cat !== 'all' && <span className="mkA-h2-sub"> in {M.CATS.find(c => c.id === cat)?.label}</span>}
                  {q && <span className="mkA-h2-sub"> matching "{q}"</span>}
                </h2>
              </div>
              <div className="mkA-grid-controls">
                <select value={sort} onChange={e => setSort(e.target.value)} className="mkA-select">
                  <option value="popular">POPULAR</option>
                  <option value="new">NEWEST</option>
                  <option value="trending">TRENDING ▲</option>
                  <option value="top">TOP RATED</option>
                  <option value="price-asc">PRICE ↑</option>
                  <option value="price-desc">PRICE ↓</option>
                </select>
              </div>
            </div>
            <div className="mkA-grid">
              {filtered.map(it => <MKT.ProductCard key={it.id} item={it} onOpen={onOpen} live={live} />)}
            </div>
          </section>
        ) : (
          <>
            {/* Featured hero row */}
            <section className="mkA-featured">
              <div className="mkA-section-head">
                <div>
                  <span className="mkA-k">§ FEATURED · THIS WEEK</span>
                  <h2 className="mkA-h2">Editor's picks.</h2>
                </div>
                <button className="mkA-see">SEE ALL →</button>
              </div>
              <div className="mkA-featured-grid">
                {M.FEATURED.map((f, i) => (
                  <div
                    key={f.id}
                    className={`mkA-feat mkA-feat-${i}`}
                    style={{ background: `linear-gradient(135deg, ${f.color}33, ${f.color}BB)` }}
                    onClick={() => onOpen(M.byId[f.id] || f)}
                  >
                    <span className="mkA-feat-tag" style={{ background: f.color, color: f.color === '#FFD84D' ? '#0A0A0C' : '#F4F2EC' }}>{f.tag}</span>
                    <div className="mkA-feat-kind">{f.kind}</div>
                    <h3 className="mkA-feat-name">{f.name}</h3>
                    <p className="mkA-feat-desc">{f.desc}</p>
                    <div className="mkA-feat-foot">
                      <span className="mkA-feat-price">{MKT.formatPrice(f.price, f.priceUnit)}</span>
                      <span className={`mkA-feat-delta ${f.delta >= 0 ? 'up' : 'down'}`}>
                        {f.delta >= 0 ? '▲' : '▼'} {Math.abs(f.delta)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recently viewed */}
            {recents.length > 0 && (
              <Shelf title="Pick up where you left off." k="§ RECENTLY VIEWED" items={recents} onOpen={onOpen} live={live} />
            )}

            {/* Collections */}
            <section className="mkA-collections">
              <div className="mkA-section-head">
                <div>
                  <span className="mkA-k">§ CURATED COLLECTIONS</span>
                  <h2 className="mkA-h2">Stacks, not just parts.</h2>
                </div>
                <button className="mkA-see">SEE ALL →</button>
              </div>
              <div className="mkA-coll-grid">
                {M.COLLECTIONS.map(c => (
                  <div key={c.id} className="mkA-coll" style={{ background: `linear-gradient(180deg, ${c.color}22, ${c.color}55)` }}>
                    <div className="mkA-coll-stack">
                      {c.itemIds.slice(0, 4).map((id, i) => {
                        const it = M.byId[id]; if (!it) return null;
                        const kc = MKT.kindColor(it.kind);
                        return (
                          <div key={id} className="mkA-coll-chip" style={{ background: `linear-gradient(135deg, ${kc}44, ${kc}88)`, transform: `translate(${i*8}px, ${i*4}px) rotate(${(i-1)*3}deg)`, zIndex: 4-i }}>
                            <span style={{ color: kc, fontSize: 18 }}>{it.kind === 'LLM' ? '◈' : it.kind === 'AGENT' ? '◉' : '◆'}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mkA-coll-meta">
                      <span className="mkA-k" style={{ color: c.color }}>{c.itemIds.length} ITEMS · BUNDLE</span>
                      <h3>{c.title}</h3>
                      <p>{c.subtitle}</p>
                      <button className="mkA-coll-cta">EXPLORE →</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shelves by category */}
            <Shelf title="Frontier LLMs." k="§ LANGUAGE MODELS" items={M.ITEMS.filter(i => i.cat === 'llm')} onOpen={onOpen} live={live} />
            <Shelf title="GPU spot — bare metal." k="§ COMPUTE · AVAILABLE NOW" items={M.ITEMS.filter(i => i.cat === 'compute')} onOpen={onOpen} live={live} accent="#FF6AC7" />
            <Shelf title="Hardware shelf." k="§ GPUs · WORKSTATIONS · PHONES" items={M.ITEMS.filter(i => i.cat === 'gpu' || i.cat === 'hardware')} onOpen={onOpen} live={live} accent="#4A7BFF" />
            <Shelf title="Agents that ship." k="§ AUTONOMOUS AGENTS" items={M.ITEMS.filter(i => i.cat === 'agent')} onOpen={onOpen} live={live} accent="#FF6AC7" />
            <Shelf title="Credits & API access." k="§ TOKENS · CALLS · QUOTAS" items={M.ITEMS.filter(i => i.cat === 'credits' || i.cat === 'api')} onOpen={onOpen} live={live} accent="#4ADE80" />
            <Shelf title="Servers & racks." k="§ ENTERPRISE IRON" items={M.ITEMS.filter(i => i.cat === 'server')} onOpen={onOpen} live={live} accent="#FFD84D" />
          </>
        )}

        {/* Footer creator leaderboard */}
        <section className="mkA-creators">
          <div className="mkA-section-head">
            <div>
              <span className="mkA-k">§ TOP CREATORS · THIS MONTH</span>
              <h2 className="mkA-h2">Shops you should know.</h2>
            </div>
          </div>
          <div className="mkA-cr-grid">
            {M.CREATORS.map((c, i) => (
              <div key={c.name} className="mkA-cr">
                <div className="mkA-cr-rank">0{i+1}</div>
                <div className="mkA-cr-name">{c.name} {c.verified && <span className="mkA-cr-v">✓</span>}</div>
                <div className="mkA-cr-stats">
                  <span>★ {c.rating}</span>
                  <span>{c.listings} listings</span>
                  <span>{c.sales} sold</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Horizontal scroll shelf
  function Shelf({ title, k, items, onOpen, live, accent }) {
    const ref = useRef(null);
    const scroll = (dir) => { if (ref.current) ref.current.scrollBy({ left: dir * 720, behavior: 'smooth' }); };
    if (!items || items.length === 0) return null;
    return (
      <section className="mkA-shelf">
        <div className="mkA-section-head">
          <div>
            <span className="mkA-k" style={accent ? { color: accent } : null}>{k}</span>
            <h2 className="mkA-h2">{title}</h2>
          </div>
          <div className="mkA-shelf-nav">
            <button onClick={() => scroll(-1)}>←</button>
            <button onClick={() => scroll(1)}>→</button>
          </div>
        </div>
        <div className="mkA-shelf-track" ref={ref}>
          {items.map(it => <MKT.ProductCard key={it.id} item={it} onOpen={onOpen} live={live} />)}
        </div>
      </section>
    );
  }

  // =============================================================
  // VARIANT B — TERMINAL (Bloomberg + Gallery)
  // =============================================================
  function TerminalPage({ onOpen, live }) {
    const [cat, setCat] = useState('all');
    const [q, setQ] = useState('');
    const [sort, setSort] = useState('trending');
    const filtered = useMemo(() => MKT.filterItems(M.ITEMS, { cat, q, sort }), [cat, q, sort]);
    const topTick = M.ITEMS.slice(0, 20);

    return (
      <div className="mkB-root" data-screen-label="MB Terminal">
        {/* Header */}
        <header className="mkB-top">
          <div className="mkB-top-l"><Wordmark size={18} /><span>/ MARKET TERMINAL</span></div>
          <div className="mkB-top-m">
            <MKT.SearchBar value={q} onChange={setQ} placeholder="Search 2,847 items · ⌘K" />
          </div>
          <div className="mkB-top-r">
            <span className="mkB-status"><MKT.LiveDot />MARKETS OPEN</span>
            <div className="mkB-avatar">A</div>
          </div>
        </header>

        {/* Ticker */}
        <div className="mkB-ticker">
          <div className="mkB-ticker-label">● LIVE TICKER</div>
          <div className="mkB-ticker-track">
            {[...topTick, ...topTick].map((t, i) => {
              const c = MKT.kindColor(t.kind);
              return (
                <span key={i} className="mkB-tk">
                  <span className="mkB-tk-kind" style={{ color: c }}>{t.kind}</span>
                  <span className="mkB-tk-name">{t.name.length > 22 ? t.name.slice(0, 22) + '…' : t.name}</span>
                  <span className="mkB-tk-price"><MKT.LivePrice value={t.price} unit={t.priceUnit} delta={t.delta} active={live} /></span>
                  <span className={`mkB-tk-d ${t.delta >= 0 ? 'up' : 'down'}`}>{t.delta >= 0 ? '▲' : '▼'} {Math.abs(t.delta)}%</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Editorial hero + ticker-right */}
        <section className="mkB-hero">
          <div className="mkB-hero-editorial" onClick={() => onOpen(M.byId[M.FEATURED[0].id] || M.FEATURED[0])}>
            <div className="mkB-hero-eyebrow">§ COVER · WEEK 16</div>
            <h1 className="mkB-h1">Orion-70B<br/><span className="mkB-h1-pink">eats the frontier.</span></h1>
            <p className="mkB-hero-p">The new open-weight flagship from Atlas Labs just out-benched GPT-4o on 6 of 9 reasoning benchmarks. Apache 2.0. Available now.</p>
            <div className="mkB-hero-stats">
              <span><b>$149</b><small>/mo</small></span>
              <span className="up"><b>▲ 18%</b><small>24h</small></span>
              <span><b>★ 4.92</b><small>rating</small></span>
              <span><b>14.2K</b><small>sales</small></span>
            </div>
            <button className="mkB-hero-cta">INSPECT → </button>
          </div>
          <div className="mkB-hero-movers">
            <div className="mkB-panel-k">§ TOP MOVERS · 24H</div>
            {M.ITEMS.filter(i => i.delta > 0).sort((a,b) => b.delta - a.delta).slice(0, 8).map((it, i) => (
              <div key={it.id} className="mkB-mover" onClick={() => onOpen(it)}>
                <span className="mkB-mover-rank">0{i+1}</span>
                <div>
                  <div className="mkB-mover-name">{it.name}</div>
                  <div className="mkB-mover-kind">{it.kind}</div>
                </div>
                <MKT.MiniChart seed={it.name.length * 2} color="#4ADE80" w={60} h={24} points={16} bias={it.delta / 8} />
                <span className="mkB-mover-d up">▲ {it.delta}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Category pills */}
        <section className="mkB-pills-wrap">
          <MKT.PillRow cats={M.CATS} active={cat} onPick={setCat} />
        </section>

        {/* Results: dense two-column — main grid + sidebar filters */}
        <section className="mkB-main">
          <aside className="mkB-filters">
            <div className="mkB-filter-grp">
              <span className="mkB-panel-k">§ SORT</span>
              {[['trending', 'TRENDING ▲'], ['popular', 'POPULAR'], ['new', 'NEWEST'], ['top', 'TOP RATED'], ['price-asc', 'PRICE ↑'], ['price-desc', 'PRICE ↓']].map(([v, l]) => (
                <button key={v} className={`mkB-f-opt ${sort === v ? 'active' : ''}`} onClick={() => setSort(v)}>{l}</button>
              ))}
            </div>
            <div className="mkB-filter-grp">
              <span className="mkB-panel-k">§ PRICE RANGE</span>
              <div className="mkB-pr">
                {[['$0 – 100', 100], ['$100 – 1K', 1000], ['$1K – 10K', 10000], ['$10K+', Infinity]].map(([l, v]) => (
                  <button key={l} className="mkB-f-opt">{l}</button>
                ))}
              </div>
            </div>
            <div className="mkB-filter-grp">
              <span className="mkB-panel-k">§ STACK</span>
              {['Compatible w/ my stack', 'Self-hostable', 'Commercial license', 'Demo available'].map(l => (
                <label key={l} className="mkB-f-check"><input type="checkbox" /><span>{l}</span></label>
              ))}
            </div>
            <div className="mkB-filter-grp">
              <span className="mkB-panel-k">§ FEATURED COLLECTIONS</span>
              {M.COLLECTIONS.map(c => (
                <div key={c.id} className="mkB-coll-lnk" style={{ borderLeftColor: c.color }}>
                  <b>{c.title}</b>
                  <small>{c.itemIds.length} items</small>
                </div>
              ))}
            </div>
          </aside>
          <div className="mkB-grid">
            <div className="mkB-grid-head">
              <span>{filtered.length} ITEMS · {sort.toUpperCase()}</span>
              <span className="mkB-live-n"><MKT.LiveDot />LIVE PRICING</span>
            </div>
            <div className="mkB-grid-items">
              {filtered.map(it => <MKT.ProductCard key={it.id} item={it} onOpen={onOpen} live={live} size="md" />)}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // =============================================================
  // VARIANT C — INDEX (brutalist list)
  // =============================================================
  function IndexPage({ onOpen, live }) {
    const [cat, setCat] = useState('all');
    const [q, setQ] = useState('');
    const [sort, setSort] = useState('popular');
    const filtered = useMemo(() => MKT.filterItems(M.ITEMS, { cat, q, sort }), [cat, q, sort]);

    return (
      <div className="mkC-root" data-screen-label="MC Index">
        <header className="mkC-top">
          <Wordmark size={18} />
          <span className="mkC-crumb">MARKET · INDEX</span>
          <div className="mkC-top-r">
            <button>SELL</button>
            <div className="mkC-avatar">A</div>
          </div>
        </header>

        {/* massive type hero */}
        <section className="mkC-hero">
          <div className="mkC-hero-k">§ THE ITARA MARKET · 2,847 ITEMS · 186 CREATORS · $42.8M TRADED · APR 2026</div>
          <h1 className="mkC-h1">
            BUY.<br/>SELL.<br/>RENT.<br/><span className="mkC-h1-u">SHIP.</span>
          </h1>
          <div className="mkC-hero-bar">
            <MKT.SearchBar value={q} onChange={setQ} large />
            <select value={sort} onChange={e => setSort(e.target.value)} className="mkC-select">
              <option value="popular">POPULAR</option>
              <option value="new">NEWEST</option>
              <option value="trending">TRENDING</option>
              <option value="top">TOP RATED</option>
              <option value="price-asc">$ ASC</option>
              <option value="price-desc">$ DESC</option>
            </select>
          </div>
          <div className="mkC-pills-wrap">
            <MKT.PillRow cats={M.CATS} active={cat} onPick={setCat} />
          </div>
        </section>

        {/* Column headers */}
        <section className="mkC-table">
          <div className="mkC-head">
            <span>#</span>
            <span>ITEM</span>
            <span>CATEGORY</span>
            <span>CREATOR</span>
            <span>RATING</span>
            <span>24H</span>
            <span>PRICE</span>
          </div>
          {filtered.map((it, i) => {
            const c = MKT.kindColor(it.kind);
            return (
              <div key={it.id} className="mkC-row" onClick={() => onOpen(it)}>
                <span className="mkC-n">{String(i+1).padStart(3, '0')}</span>
                <span className="mkC-name">
                  <span className="mkC-sigil" style={{ color: c }}>
                    {it.kind === 'LLM' ? '◈' : it.kind === 'AGENT' ? '◉' : it.kind === 'GPU' ? '▣' : it.kind === 'GPU RENT' ? '⏱' : '◆'}
                  </span>
                  {it.name}
                  {it.tag && <span className="mkC-tag" style={{ color: c, borderColor: c }}>{it.tag}</span>}
                </span>
                <span className="mkC-kind" style={{ color: c }}>{it.kind}</span>
                <span className="mkC-creator">{it.creator}</span>
                <span className="mkC-rating">★ {it.rating}</span>
                <span className={`mkC-delta ${it.delta >= 0 ? 'up' : 'down'}`}>
                  {it.delta >= 0 ? '▲' : '▼'} {Math.abs(it.delta)}%
                </span>
                <span className="mkC-price">
                  <MKT.LivePrice value={it.price} unit={it.priceUnit} delta={it.delta} color={c} active={live} />
                </span>
              </div>
            );
          })}
        </section>

        <section className="mkC-foot">
          <div><b>{filtered.length}</b> OF <b>{M.ITEMS.length}</b> SHOWN</div>
          <div>LAST UPDATE · {new Date().toLocaleTimeString()}</div>
        </section>
      </div>
    );
  }

  window.MKT_PAGES = { DiscoveryPage, TerminalPage, IndexPage };
})();
