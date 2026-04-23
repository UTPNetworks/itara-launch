// Itara Mission Control — the signed-in landing page.
// Two variations: A) Cockpit (sidebar + grid) · B) Command HUD (top-nav big canvas)

const D = (() => {
  const { useState, useEffect, useMemo, useRef } = React;
  const U = window.ITARA_DASH;

  // ---- Shared atoms ----
  function Clock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
    const pad = n => String(n).padStart(2, '0');
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const mos = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return <span>{days[now.getDay()]} · {pad(now.getDate())} {mos[now.getMonth()]} · {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())} UTC</span>;
  }

  function AnimatedNum({ value, fmt = n => n.toFixed(2), dur = 1200 }) {
    const [v, setV] = useState(0);
    const started = useRef(false);
    useEffect(() => {
      if (started.current) { setV(value); return; }
      started.current = true;
      const start = performance.now();
      const tick = now => {
        const t = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        setV(value * e);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, [value]);
    return <>{fmt(v)}</>;
  }

  function Sparkline({ data, color = '#6C5CE7', h = 60 }) {
    const max = Math.max(...data), min = Math.min(...data);
    const w = 280;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min)) * (h - 4) - 2;
      return `${x},${y}`;
    }).join(' ');
    const area = `M 0,${h} L ${pts.split(' ').join(' L ')} L ${w},${h} Z`;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.4" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark-g)" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  function Bars({ data, h = 120, color = '#6C5CE7' }) {
    const max = Math.max(...data);
    return (
      <div className="d-bars" style={{ height: h }}>
        {data.map((v, i) => (
          <span key={i} className="d-bar" style={{ height: `${(v / max) * 100}%`, background: color, animationDelay: `${i * 30}ms` }} />
        ))}
      </div>
    );
  }

  function MarketTicker(intervalMs = 2200) {
    const [rows, setRows] = useState(() => window.ITARA_DATA.GPUS.slice(0, 6).map(g => ({ ...g, livePrice: g.price, flash: null })));
    useEffect(() => {
      const t = setInterval(() => {
        setRows(prev => prev.map(r => {
          if (Math.random() > 0.45) return { ...r, flash: null };
          const d = (Math.random() - 0.5) * 0.12;
          const p = Math.max(0.15, +(r.livePrice + d).toFixed(2));
          return { ...r, livePrice: p, flash: d > 0 ? 'up' : 'down' };
        }));
      }, intervalMs);
      return () => clearInterval(t);
    }, []);
    return rows;
  }

  // ============================================================
  // VARIATION A — COCKPIT (sidebar + modular grid)
  // ============================================================

  // Modal components
  function ListGPUModal({ onClose }) {
    const [gpuType, setGpuType] = useState('h100');
    const [hourlyRate, setHourlyRate] = useState('2.49');
    const [sshAccess, setSshAccess] = useState(true);
    const [vram, setVram] = useState('80gb');
    const [availability, setAvailability] = useState('24/7');

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>⚡ LIST A GPU RESOURCE</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>GPU Type</label>
              <select value={gpuType} onChange={e => setGpuType(e.target.value)}>
                <option value="h100">NVIDIA H100 (80GB)</option>
                <option value="h200">NVIDIA H200 (141GB)</option>
                <option value="a100">NVIDIA A100 (80GB)</option>
                <option value="rtx4090">RTX 4090 (24GB)</option>
                <option value="rtx6000">RTX 6000 (48GB)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rent per Hour (USD)</label>
              <input type="text" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>SSH Access</label>
              <div className="toggle-switch">
                <input type="checkbox" checked={sshAccess} onChange={e => setSshAccess(e.target.checked)} />
                <span>{sshAccess ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>VRAM</label>
              <select value={vram} onChange={e => setVram(e.target.value)}>
                <option value="24gb">24GB</option>
                <option value="48gb">48GB</option>
                <option value="80gb">80GB</option>
                <option value="141gb">141GB</option>
              </select>
            </div>
            <div className="form-group">
              <label>Availability</label>
              <select value={availability} onChange={e => setAvailability(e.target.value)}>
                <option value="24/7">24/7 Always On</option>
                <option value="scheduled">Scheduled Hours</option>
                <option value="on-demand">On Demand</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={onClose}>List GPU</button>
          </div>
        </div>
      </div>
    );
  }

  function UploadModelModal({ onClose }) {
    const [modelName, setModelName] = useState('');
    const [modelType, setModelType] = useState('llm');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🤖 UPLOAD A MODEL</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Model Name</label>
              <input type="text" value={modelName} onChange={e => setModelName(e.target.value)} placeholder="e.g., FineTuned-Llama-7B" />
            </div>
            <div className="form-group">
              <label>Model Type</label>
              <select value={modelType} onChange={e => setModelType(e.target.value)}>
                <option value="llm">Large Language Model</option>
                <option value="vision">Vision Model</option>
                <option value="multimodal">Multimodal</option>
                <option value="embeddings">Embeddings</option>
                <option value="diffusion">Diffusion</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price (USD)</label>
              <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this model do? Any special capabilities?" rows="3" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={onClose}>Upload Model</button>
          </div>
        </div>
      </div>
    );
  }

  function PostTaskModal({ onClose }) {
    const [title, setTitle] = useState('');
    const [budget, setBudget] = useState('');
    const [category, setCategory] = useState('development');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>📋 POST A TASK</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Task Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Fine-tune GPT model on domain data" />
            </div>
            <div className="form-group">
              <label>Budget (USD)</label>
              <input type="text" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="development">Model Development</option>
                <option value="finetuning">Fine-tuning</option>
                <option value="testing">Testing & Eval</option>
                <option value="deployment">Deployment</option>
                <option value="research">Research</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed requirements..." rows="3" />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={onClose}>Post Task</button>
          </div>
        </div>
      </div>
    );
  }

  function RentComputeModal({ onClose }) {
    const [gpuModel, setGpuModel] = useState('h100');
    const [hours, setHours] = useState('1');
    const [region, setRegion] = useState('us-west');

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-compact" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🔧 RENT COMPUTE</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>GPU Type</label>
              <select value={gpuModel} onChange={e => setGpuModel(e.target.value)}>
                <option value="h100">H100 - $2.49/hr</option>
                <option value="a100">A100 - $1.89/hr</option>
                <option value="rtx4090">RTX 4090 - $0.49/hr</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hours</label>
              <input type="number" value={hours} onChange={e => setHours(e.target.value)} min="1" max="720" />
            </div>
            <div className="form-group">
              <label>Region</label>
              <select value={region} onChange={e => setRegion(e.target.value)}>
                <option value="us-west">US West (lowest latency)</option>
                <option value="us-east">US East</option>
                <option value="eu-west">EU West</option>
                <option value="ap-south">Asia Pacific</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={onClose}>Rent Now</button>
          </div>
        </div>
      </div>
    );
  }

  function HireTalentModal({ onClose }) {
    const [expertise, setExpertise] = useState('ml-engineer');
    const [budget, setBudget] = useState('');
    const [duration, setDuration] = useState('project');

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-compact" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>👤 HIRE TALENT</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Role Needed</label>
              <select value={expertise} onChange={e => setExpertise(e.target.value)}>
                <option value="ml-engineer">ML Engineer</option>
                <option value="prompt-engineer">Prompt Engineer</option>
                <option value="data-scientist">Data Scientist</option>
                <option value="devops">DevOps Engineer</option>
                <option value="researcher">Researcher</option>
              </select>
            </div>
            <div className="form-group">
              <label>Budget (USD)</label>
              <input type="text" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)}>
                <option value="project">Project (one-time)</option>
                <option value="part-time">Part-time (ongoing)</option>
                <option value="full-time">Full-time (exclusive)</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={onClose}>Browse Talent</button>
          </div>
        </div>
      </div>
    );
  }

  function CockpitPage() {
    const [nav, setNav] = useState('mission');
    const [modal, setModal] = useState(null);
    const rows = MarketTicker();

    // Check if user is new (no listings, no earnings)
    const isNewUser = U.LISTINGS.length === 0 && U.earnings.every(e => e === 0);

    return (
      <div className="dA-root" data-screen-label="DA Cockpit">
        <aside className="dA-side">
          <div className="dA-brand"><Wordmark size={20} /></div>
          <div className="dA-nav">
            {[
              ['mission','MISSION','◈'],
              ['compute','COMPUTE','▣'],
              ['exchange','EXCHANGE','◆'],
              ['neural','NEURALWORK','◉'],
              ['axis','AXIS','✦'],
              ['wallet','WALLET','§'],
            ].map(([id, label, g]) => (
              <button key={id} className={`dA-nav-item ${nav === id ? 'active' : ''}`} onClick={() => setNav(id)}>
                <span className="dA-nav-glyph">{g}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="dA-side-foot">
            <div className="dA-status"><span className="dA-dot" /> ALL SYSTEMS NOMINAL</div>
            <div className="dA-side-user">
              <div className="dA-avatar">{U.USER.name[0]}</div>
              <div>
                <div className="dA-username">{U.USER.name}</div>
                <div className="dA-userhandle">{U.USER.handle} · {U.USER.tier}</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="dA-main">
          {/* Header */}
          <header className="dA-header">
            <div>
              <div className="dA-eyebrow"><Clock /></div>
              <h1 className="dA-greet">GOOD MORNING,<br/><span className="dA-greet-accent">{U.USER.name.toUpperCase()}.</span></h1>
              {!isNewUser ? (
                <p className="dA-subgreet">You earned <b>$482.40</b> while you were asleep. 2 rentals active. 1 task awaiting your review.</p>
              ) : (
                <p className="dA-subgreet">Welcome to Itara Mission Control. Get started by listing your first GPU, model, or posting a task.</p>
              )}
            </div>
            <div className="dA-cmdk">
              <span className="dA-cmdk-icon">⌕</span>
              <span>Search compute, models, tasks…</span>
              <kbd>⌘K</kbd>
            </div>
          </header>

          {/* KPI strip */}
          <section className="dA-kpis">
            <div className="dA-kpi">
              <span className="dA-kpi-k">BALANCE</span>
              <span className="dA-kpi-v">$<AnimatedNum value={isNewUser ? 0 : U.USER.balance} fmt={n => n.toFixed(2)} /></span>
              <span className="dA-kpi-foot">{isNewUser ? 'Earn by listing GPUs, models, or completing tasks' : '+$482.40 today · '}<a>{!isNewUser && 'withdraw →'}</a></span>
            </div>
            <div className="dA-kpi">
              <span className="dA-kpi-k">IN ESCROW</span>
              <span className="dA-kpi-v dA-violet">$<AnimatedNum value={isNewUser ? 0 : U.USER.escrow} fmt={n => n.toFixed(2)} /></span>
              <span className="dA-kpi-foot">{isNewUser ? 'Escrow protects all transactions' : '3 open transactions'}</span>
            </div>
            <div className="dA-kpi">
              <span className="dA-kpi-k">GPU HOURS SOLD</span>
              <span className="dA-kpi-v dA-blue"><AnimatedNum value={isNewUser ? 0 : 412} fmt={n => Math.round(n).toLocaleString()} /></span>
              <span className="dA-kpi-foot">{isNewUser ? 'Start renting to earn' : 'last 30 days · +24%'}</span>
            </div>
            <div className="dA-kpi">
              <span className="dA-kpi-k">LISTINGS LIVE</span>
              <span className="dA-kpi-v dA-pink"><AnimatedNum value={isNewUser ? 0 : 4} fmt={n => Math.round(n)} /></span>
              <span className="dA-kpi-foot">{isNewUser ? 'List your first GPU or model above' : '2 GPU · 2 models'}</span>
            </div>
          </section>

          {/* Quick actions */}
          <section className="dA-quick">
            <button className="dA-q dA-q-violet" onClick={() => setModal('list-gpu')}>+ LIST A GPU</button>
            <button className="dA-q dA-q-pink" onClick={() => setModal('upload-model')}>+ UPLOAD A MODEL</button>
            <button className="dA-q dA-q-blue" onClick={() => setModal('post-task')}>+ POST A TASK</button>
            <button className="dA-q dA-q-yellow" onClick={() => setModal('rent-compute')}>RENT COMPUTE →</button>
            <button className="dA-q dA-q-ghost" onClick={() => setModal('hire-talent')}>HIRE TALENT →</button>
          </section>

          {/* Module tiles */}
          <section className="dA-grid">
            <div className="dA-tile dA-tile-wide">
              <div className="dA-tile-head">
                <div>
                  <span className="dA-tile-k">§ 01 · COMPUTE</span>
                  <h2>Your GPU fleet.</h2>
                </div>
                <button className="dA-tile-cta">MANAGE →</button>
              </div>
              <div className="dA-fleet">
                {U.LISTINGS.filter(l => l.kind === 'GPU').map(l => (
                  <div key={l.name} className={`dA-fleet-row dA-st-${l.status.toLowerCase()}`}>
                    <div>
                      <div className="dA-fleet-name">{l.name}</div>
                      <div className="dA-fleet-sub">{l.price} · {Math.round(l.util * 100)}% utilised</div>
                    </div>
                    <div className="dA-util-bar"><span style={{ width: `${l.util * 100}%` }} /></div>
                    <div className="dA-fleet-earn">${l.earnings.toFixed(2)}</div>
                    <div className="dA-fleet-status">{l.status}</div>
                  </div>
                ))}
              </div>
              <div className="dA-fleet-foot">2 active rentals · $530.72 running spend</div>
            </div>

            <div className="dA-tile dA-tile-earnings">
              <div className="dA-tile-head">
                <div>
                  <span className="dA-tile-k">§ 02 · EARNINGS</span>
                  <h2>30d revenue.</h2>
                </div>
              </div>
              <div className="dA-earn-big">$<AnimatedNum value={7480} fmt={n => Math.round(n).toLocaleString()} /></div>
              <div className="dA-earn-delta">▲ 34.2% vs prior 30d</div>
              <Sparkline data={U.earnings} color="#FF6AC7" h={90} />
              <div className="dA-earn-legend">
                <span><b className="dA-vio-dot" />Models $3,564</span>
                <span><b className="dA-blu-dot" />GPU $2,361</span>
                <span><b className="dA-pin-dot" />Tasks $1,555</span>
              </div>
            </div>

            <div className="dA-tile dA-tile-market">
              <div className="dA-tile-head">
                <div>
                  <span className="dA-tile-k">§ 03 · MARKET PULSE</span>
                  <h2>GPU spot.</h2>
                </div>
                <span className="dA-live"><span className="dA-pulse-dot" />LIVE</span>
              </div>
              <div className="dA-market">
                {rows.map((r, i) => (
                  <div key={i} className={`dA-market-row ${r.flash ? 'f-' + r.flash : ''}`}>
                    <span className="dA-m-model">{r.model}</span>
                    <span className="dA-m-region">{r.region}</span>
                    <span className={`dA-m-price ${r.flash === 'up' ? 'up' : r.flash === 'down' ? 'down' : ''}`}>
                      ${r.livePrice.toFixed(2)}
                      {r.flash === 'up' && <span className="dA-arrow up">▲</span>}
                      {r.flash === 'down' && <span className="dA-arrow down">▼</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dA-tile dA-tile-trend">
              <div className="dA-tile-head">
                <div>
                  <span className="dA-tile-k">§ 04 · TRENDING</span>
                  <h2>On the Exchange.</h2>
                </div>
                <button className="dA-tile-cta">EXPLORE →</button>
              </div>
              <div className="dA-trend">
                {U.TRENDING.map((m, i) => (
                  <div key={m.name} className="dA-trend-row">
                    <span className="dA-trend-rank">0{i+1}</span>
                    <div>
                      <div className="dA-trend-name">{m.name}</div>
                      <div className="dA-trend-kind">{m.kind}</div>
                    </div>
                    <span className="dA-trend-price">${m.price}</span>
                    <span className={`dA-trend-delta ${m.delta >= 0 ? 'up' : 'down'}`}>
                      {m.delta >= 0 ? '▲' : '▼'} {Math.abs(m.delta)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dA-tile dA-tile-tasks">
              <div className="dA-tile-head">
                <div>
                  <span className="dA-tile-k">§ 05 · NEURALWORK</span>
                  <h2>Your tasks.</h2>
                </div>
                <button className="dA-tile-cta">ALL →</button>
              </div>
              {U.TASKS.map(t => (
                <div key={t.title} className="dA-task">
                  <div className="dA-task-title">{t.title}</div>
                  <div className="dA-task-meta">
                    <span className="dA-task-budget">${t.budget.toLocaleString()}</span>
                    <span className="dA-task-stage">{t.stage}</span>
                  </div>
                </div>
              ))}
              <button className="dA-task-new">+ POST A NEW TASK</button>
            </div>

            <div className="dA-tile dA-tile-notif">
              <div className="dA-tile-head">
                <div>
                  <span className="dA-tile-k">§ 06 · FEED</span>
                  <h2>Recent activity.</h2>
                </div>
              </div>
              {U.NOTIFS.map((n, i) => (
                <div key={i} className="dA-notif">
                  <span className="dA-notif-g">{n.icon}</span>
                  <span className="dA-notif-t">{n.text}</span>
                  <span className="dA-notif-time">{n.t}</span>
                </div>
              ))}
            </div>

            <div className="dA-tile dA-tile-checklist">
              <div className="dA-tile-head">
                <div>
                  <span className="dA-tile-k">§ 07 · LEVEL UP</span>
                  <h2>Earn Pro+ status.</h2>
                </div>
                <span className="dA-ck-prog">3 / 5</span>
              </div>
              <div className="dA-ck-bar"><span style={{ width: '60%' }} /></div>
              {U.CHECKLIST.map(c => (
                <div key={c.t} className={`dA-ck ${c.done ? 'done' : ''}`}>
                  <span className="dA-ck-box">{c.done ? '✓' : ''}</span>
                  <span>{c.t}</span>
                  {!c.done && <span className="dA-ck-go">→</span>}
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Modal rendering */}
        {modal === 'list-gpu' && <ListGPUModal onClose={() => setModal(null)} />}
        {modal === 'upload-model' && <UploadModelModal onClose={() => setModal(null)} />}
        {modal === 'post-task' && <PostTaskModal onClose={() => setModal(null)} />}
        {modal === 'rent-compute' && <RentComputeModal onClose={() => setModal(null)} />}
        {modal === 'hire-talent' && <HireTalentModal onClose={() => setModal(null)} />}
      </div>
    );
  }

  // ============================================================
  // Universal Search Bar — sits between hero and stat blocks
  // ============================================================
  function UniversalSearch() {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const inputRef = useRef(null);
    const wrapRef = useRef(null);

    // Search corpus — pulls from real data
    const corpus = useMemo(() => [
      ...window.ITARA_DATA.GPUS.map(g => ({ type: 'GPU', label: g.model, sub: `${g.region} · $${g.price}/hr`, icon: '▣', href: '#compute' })),
      ...window.ITARA_DATA.MODELS.map(m => ({ type: 'MODEL', label: m.name, sub: `${m.kind} · $${m.price}`, icon: '◆', href: '#exchange' })),
      ...U.TASKS.map(t => ({ type: 'TASK', label: t.title, sub: `$${t.budget.toLocaleString()} · ${t.stage}`, icon: '◉', href: '#neuralwork' })),
      ...U.TRENDING.map(m => ({ type: 'TRENDING', label: m.name, sub: `${m.kind} · ${m.delta >= 0 ? '▲' : '▼'} ${Math.abs(m.delta)}%`, icon: '✦', href: '#exchange' })),
      { type: 'NAV', label: 'Compute', sub: 'GPU Rentals', icon: '▣', href: '#compute' },
      { type: 'NAV', label: 'Exchange', sub: 'AI Marketplace', icon: '◆', href: '#exchange' },
      { type: 'NAV', label: 'NeuralWork', sub: 'Task Freelancer', icon: '◉', href: '#neuralwork' },
      { type: 'NAV', label: 'AXIS', sub: 'AI Intelligence Hub', icon: '✦', href: '#axis' },
      { type: 'NAV', label: 'Wallet', sub: 'Earnings & Payouts', icon: '§', href: '#wallet' },
    ], []);

    const results = useMemo(() => {
      if (!q.trim()) return [];
      const s = q.toLowerCase();
      return corpus.filter(c => c.label.toLowerCase().includes(s) || c.sub.toLowerCase().includes(s) || c.type.toLowerCase().includes(s)).slice(0, 8);
    }, [q, corpus]);

    useEffect(() => {
      if (results.length > 0) setOpen(true);
      else setOpen(false);
      setActive(-1);
    }, [results]);

    // Close on outside click
    useEffect(() => {
      function handler(e) {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    function handleKey(e) {
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      if (e.key === 'Enter' && active >= 0) { window.location.hash = results[active].href; setOpen(false); setQ(''); }
      if (e.key === 'Escape') { setOpen(false); setQ(''); }
    }

    // Keyboard shortcut ⌘K / Ctrl+K
    useEffect(() => {
      function shortcut(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }
      }
      document.addEventListener('keydown', shortcut);
      return () => document.removeEventListener('keydown', shortcut);
    }, []);

    return (
      <div className="dB-usearch" ref={wrapRef}>
        <div className={`dB-usearch-bar ${open ? 'is-open' : ''}`}>
          <span className="dB-usearch-icon">⌕</span>
          <input
            ref={inputRef}
            className="dB-usearch-input"
            type="text"
            placeholder="Search GPUs, models, tasks, pages…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            onKeyDown={handleKey}
            autoComplete="off"
            spellCheck="false"
          />
          {q && <button className="dB-usearch-clear" onClick={() => { setQ(''); setOpen(false); inputRef.current?.focus(); }}>✕</button>}
          <kbd className="dB-usearch-kbd">⌘K</kbd>
        </div>
        {open && results.length > 0 && (
          <div className="dB-usearch-drop">
            {results.map((r, i) => (
              <div
                key={i}
                className={`dB-usearch-row ${active === i ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => { window.location.hash = r.href; setOpen(false); setQ(''); }}
              >
                <span className="dB-usearch-row-icon">{r.icon}</span>
                <div className="dB-usearch-row-body">
                  <span className="dB-usearch-row-label">{r.label}</span>
                  <span className="dB-usearch-row-sub">{r.sub}</span>
                </div>
                <span className="dB-usearch-row-type">{r.type}</span>
              </div>
            ))}
          </div>
        )}
        {open && results.length === 0 && q.trim() && (
          <div className="dB-usearch-drop dB-usearch-empty">
            <span className="dB-usearch-row-icon">○</span>
            <span style={{ opacity: 0.5 }}>No results for "{q}"</span>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // VARIATION B — COMMAND HUD (top nav, hero canvas)
  // ============================================================
  function CommandPageProfileDropdown({ isOpen, onClose, avatarRef }) {
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

    const handleSignOut = () => {
      localStorage.removeItem('itara_session');
      window.location.href = '/index.html';
    };

    return (
      <div className="dB-profile-dropdown" ref={dropdownRef} style={{ top: `${position.top}px`, right: `${position.right}px` }}>
        <div className="dB-profile-header">
          <div className="dB-profile-avatar-large">{U.USER.name[0]}</div>
          <div>
            <div className="dB-profile-name">{U.USER.name}</div>
            <div className="dB-profile-tier">{U.USER.tier} · {U.USER.handle}</div>
          </div>
        </div>
        <div className="dB-profile-divider"></div>
        <button className="dB-dropdown-item" onClick={onClose}>
          <span className="dB-dropdown-icon">👤</span>
          <div>
            <span>My Profile</span>
            <span className="dB-dropdown-sub">View & edit your profile</span>
          </div>
        </button>
        <button className="dB-dropdown-item" onClick={onClose}>
          <span className="dB-dropdown-icon">⚙️</span>
          <div>
            <span>Settings</span>
            <span className="dB-dropdown-sub">Preferences & integrations</span>
          </div>
        </button>
        <button className="dB-dropdown-item" onClick={onClose}>
          <span className="dB-dropdown-icon">💼</span>
          <div>
            <span>My Wallet</span>
            <span className="dB-dropdown-sub">${U.USER.balance.toFixed(2)} available</span>
          </div>
        </button>
        <button className="dB-dropdown-item" onClick={onClose}>
          <span className="dB-dropdown-icon">📊</span>
          <div>
            <span>Analytics</span>
            <span className="dB-dropdown-sub">View your stats & reports</span>
          </div>
        </button>
        <div className="dB-profile-divider"></div>
        <button className="dB-dropdown-item dB-dropdown-danger" onClick={handleSignOut}>
          <span className="dB-dropdown-icon">🚪</span>
          <div>
            <span>Sign Out</span>
            <span className="dB-dropdown-sub">See you next time</span>
          </div>
        </button>
      </div>
    );
  }

  function CommandPage() {
    const [profileOpen, setProfileOpen] = useState(false);
    const avatarRef = useRef(null);
    const rows = MarketTicker(2500);
    return (
      <div className="dB-root" data-screen-label="DB Command">
        <nav className="dB-nav">
          <div className="dB-nav-l"><Wordmark size={20} /><span className="dB-sep" />MISSION CONTROL</div>
          <div className="dB-nav-m">
            <a>MISSION</a>
            <a href="compute.html" style={{cursor:'pointer'}}>COMPUTE</a>
            <a href="market.html" style={{cursor:'pointer'}}>EXCHANGE</a>
            <a href="neuralwork.html" style={{cursor:'pointer'}}>NEURALWORK</a>
            <a href="axis.html" style={{cursor:'pointer'}}>AXIS</a>
            <a>WALLET</a>
          </div>
          <div className="dB-nav-r">
            <div className="dB-nav-theme" id="mc-theme-btn-nav" aria-label="Toggle theme">
              <div className="dB-nav-tgl-track"><div className="dB-nav-tgl-thumb"></div></div>
              <span className="dB-nav-theme-label" id="mc-theme-label">DARK</span>
            </div>
            <div ref={avatarRef} className="dB-avatar" onClick={() => setProfileOpen(!profileOpen)} style={{ cursor: 'pointer' }}>{U.USER.name[0]}</div>
            <CommandPageProfileDropdown isOpen={profileOpen} onClose={() => setProfileOpen(false)} avatarRef={avatarRef} />
          </div>
        </nav>

        {/* Hero / big greeting */}
        <section className="dB-hero">
          <div className="dB-hero-top">
            <span><Clock /></span>
            <span>ESCROW · $1,280 LOCKED</span>
            <span className="dB-live"><span className="dB-pulse" /> ALL SYSTEMS NOMINAL</span>
          </div>
          <h1 className="dB-h1">
            WELCOME BACK,<br/>
            <span className="dB-h1-accent">{U.USER.name.toUpperCase()}.</span>
          </h1>
          <UniversalSearch />
          <div className="dB-hero-sub">
            <div className="dB-hero-stat">
              <span className="dB-stat-k">EARNED WHILE AWAY</span>
              <span className="dB-stat-v">$<AnimatedNum value={482.40} /></span>
            </div>
            <div className="dB-hero-stat">
              <span className="dB-stat-k">ACTIVE NOW</span>
              <span className="dB-stat-v">2<small> rentals</small></span>
            </div>
            <div className="dB-hero-stat">
              <span className="dB-stat-k">AWAITING YOU</span>
              <span className="dB-stat-v">14<small> bids</small></span>
            </div>
            <div className="dB-hero-stat">
              <span className="dB-stat-k">BALANCE</span>
              <span className="dB-stat-v">$<AnimatedNum value={U.USER.balance} fmt={n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /></span>
            </div>
          </div>
        </section>

        {/* Four pillar modules — the four rails as interactive tiles */}
        <section className="dB-rails">
          {[
            { k: '01', lab: 'COMPUTE', title: 'GPU', stat: '2 listed · 1 renting', hot: '$1,840 earned', cls: 'violet', cta: 'Manage fleet →', href: 'compute.html' },
            { k: '02', lab: 'EXCHANGE', title: 'MARKET', stat: '2 models live · 3,564 sold', hot: '$3,564 earned', cls: 'pink', cta: 'Open shop →', href: 'market.html' },
            { k: '03', lab: 'NEURALWORK', title: 'TALENT', stat: '2 tasks · 14 bids in', hot: '$1,555 awarded', cls: 'blue', cta: 'Review bids →', href: 'neuralwork.html' },
            { k: '04', lab: 'AXIS', title: 'INTEL', stat: '6 alerts saved', hot: 'H100 ▲ 4.2%', cls: 'yellow', cta: 'Open Axis →', href: 'axis.html' },
          ].map(r => (
            <div
              key={r.k}
              className={`dB-rail dB-${r.cls}`}
              onClick={() => r.href && (window.location.href = r.href)}
              style={r.href ? { cursor: 'pointer' } : {}}
            >
              <div className="dB-rail-top">
                <span className="dB-rail-k">{r.k} · {r.lab}</span>
                <span className="dB-rail-hot">{r.hot}</span>
              </div>
              <div className="dB-rail-title">{r.title}</div>
              <div className="dB-rail-stat">{r.stat}</div>
              <div className="dB-rail-cta">{r.cta}</div>
            </div>
          ))}
        </section>

        {/* Two-column: earnings + market */}
        <section className="dB-two">
          <div className="dB-panel dB-earn">
            <div className="dB-panel-head">
              <span className="dB-panel-k">§ EARNINGS · LAST 30 DAYS</span>
              <div className="dB-earn-tabs"><button className="active">30D</button><button>90D</button><button>1Y</button></div>
            </div>
            <div className="dB-earn-val">$<AnimatedNum value={7480} fmt={n => Math.round(n).toLocaleString()} /></div>
            <div className="dB-earn-delta">▲ 34.2% VS PRIOR 30D · PROJECTED $9,840 NEXT 30D</div>
            <Bars data={U.earnings} h={160} color="#FF6AC7" />
            <div className="dB-earn-grid">
              <div><b>$3,564</b><span>Models · Orion, VoxSuno</span></div>
              <div><b>$2,361</b><span>Compute · 412 GPU hrs sold</span></div>
              <div><b>$1,555</b><span>Tasks · 2 completed</span></div>
            </div>
          </div>

          <div className="dB-panel dB-market">
            <div className="dB-panel-head">
              <span className="dB-panel-k">§ MARKET PULSE · GPU SPOT</span>
              <span className="dB-live"><span className="dB-pulse" />LIVE</span>
            </div>
            <div className="dB-market-cols">
              <span>MODEL</span><span>REGION</span><span>$/HR</span>
            </div>
            {rows.map((r, i) => (
              <div key={i} className={`dB-market-row ${r.flash ? 'f-' + r.flash : ''}`}>
                <span className="dB-m-model">{r.model}</span>
                <span className="dB-m-region">{r.region}</span>
                <span className={`dB-m-price ${r.flash === 'up' ? 'up' : r.flash === 'down' ? 'down' : ''}`}>
                  ${r.livePrice.toFixed(2)}
                </span>
              </div>
            ))}
            <button className="dB-panel-cta">RENT ON THE SPOT →</button>
          </div>
        </section>

        {/* Trending + checklist */}
        <section className="dB-two">
          <div className="dB-panel dB-trend">
            <div className="dB-panel-head">
              <span className="dB-panel-k">§ TRENDING ON THE EXCHANGE</span>
              <button className="dB-panel-lnk">SEE ALL →</button>
            </div>
            <div className="dB-trend-grid">
              {U.TRENDING.map((m, i) => (
                <div key={m.name} className="dB-trend-cell">
                  <div className="dB-trend-rank">0{i+1}</div>
                  <div className="dB-trend-name">{m.name}</div>
                  <div className="dB-trend-kind">{m.kind}</div>
                  <div className="dB-trend-foot">
                    <span>${m.price}</span>
                    <span className={m.delta >= 0 ? 'up' : 'down'}>{m.delta >= 0 ? '▲' : '▼'} {Math.abs(m.delta)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dB-panel dB-ck">
            <div className="dB-panel-head">
              <span className="dB-panel-k">§ LEVEL UP · PRO+ STATUS</span>
              <span>3 / 5</span>
            </div>
            <div className="dB-ck-bar"><span style={{ width: '60%' }} /></div>
            {U.CHECKLIST.map(c => (
              <div key={c.t} className={`dB-ck-item ${c.done ? 'done' : ''}`}>
                <span className="dB-ck-box">{c.done ? '✓' : ''}</span>
                <span>{c.t}</span>
                {!c.done && <span className="dB-ck-arr">→</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions ribbon */}
        <section className="dB-quick">
          {['+ LIST A GPU', '+ UPLOAD A MODEL', '+ POST A TASK', 'RENT COMPUTE →', 'HIRE TALENT →'].map((t, i) => (
            <button key={t} className={`dB-q dB-q-${i}`}>{t}</button>
          ))}
        </section>

        {/* Activity stream */}
        <section className="dB-feed">
          <div className="dB-panel-head">
            <span className="dB-panel-k">§ FEED · LAST HOUR</span>
            <span className="dB-live"><span className="dB-pulse" />LIVE</span>
          </div>
          <div className="dB-feed-grid">
            {U.NOTIFS.map((n, i) => (
              <div key={i} className="dB-feed-row">
                <span className="dB-feed-g">{n.icon}</span>
                <span className="dB-feed-t">{n.text}</span>
                <span className="dB-feed-time">{n.t}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return { CockpitPage, CommandPage };
})();

window.D = D;
