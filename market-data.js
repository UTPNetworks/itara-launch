// Itara Market — sprawling catalog: hardware · compute · credits · models · agents · APIs · cloud
window.ITARA_MARKET = (() => {
  const CATS = [
    { id: 'all',      label: 'ALL',          count: 2847 },
    { id: 'llm',      label: 'LLMs',         count: 412 },
    { id: 'agent',    label: 'AGENTS',       count: 286 },
    { id: 'vision',   label: 'VISION',       count: 198 },
    { id: 'audio',    label: 'AUDIO',        count: 124 },
    { id: 'code',     label: 'CODE',         count: 94 },
    { id: 'gpu',      label: 'GPUs',         count: 340 },
    { id: 'hardware', label: 'HARDWARE',     count: 186 },
    { id: 'server',   label: 'SERVERS',      count: 97 },
    { id: 'compute',  label: 'COMPUTE',      count: 420 },
    { id: 'credits',  label: 'CREDITS',      count: 62 },
    { id: 'api',      label: 'API ACCESS',   count: 108 },
    { id: 'cloud',    label: 'CLOUD',        count: 74 },
  ];

  // Featured (front-page hero / carousel)
  const FEATURED = [
    {
      id: 'orion-70b',
      kind: 'LLM',
      cat: 'llm',
      name: 'Orion-70B-Instruct',
      creator: 'Atlas Labs',
      desc: 'The new open-weight flagship. Out-benching GPT-4o on 6 of 9 reasoning benchmarks.',
      price: 149, priceUnit: '/mo',
      delta: +18, rating: 4.92, sales: 14200,
      tag: 'NEW DROP',
      color: '#6C5CE7',
    },
    {
      id: 'dgx-spark',
      kind: 'HARDWARE',
      cat: 'hardware',
      name: 'NVIDIA DGX Spark',
      creator: 'NVIDIA · Authorized',
      desc: 'Petascale AI workstation. 128GB unified, 1PFLOPS FP4. Pre-orders open.',
      price: 3999, priceUnit: '',
      delta: +4, rating: 4.88, sales: 840,
      tag: 'LIMITED',
      color: '#FFD84D',
    },
    {
      id: 'phoenix-agent',
      kind: 'AGENT',
      cat: 'agent',
      name: 'Phoenix-Agent v3',
      creator: 'Parallax',
      desc: 'Autonomous research agent. Browser + codegen + memory. Runs 30h continuous.',
      price: 349, priceUnit: '/mo',
      delta: +9, rating: 4.81, sales: 3480,
      tag: 'TOP RATED',
      color: '#FF6AC7',
    },
    {
      id: 'h100-spot',
      kind: 'COMPUTE',
      cat: 'compute',
      name: '8× H100 Spot — US-East',
      creator: 'NovaCompute',
      desc: 'Bare-metal cluster. InfiniBand. Pay per second. Available NOW.',
      price: 12.74, priceUnit: '/hr',
      delta: -4, rating: 4.77, sales: 9200,
      tag: 'LIVE',
      color: '#4A7BFF',
    },
  ];

  // A massive product catalog — mixed categories
  const ITEMS = [
    // ===== LLMs =====
    { id:'orion-70b',    cat:'llm', kind:'LLM',    name:'Orion-70B-Instruct', creator:'Atlas Labs',       price:149,  priceUnit:'/mo',  delta:+18, rating:4.92, sales:14200, isNew:true,  tag:'TRENDING' },
    { id:'orion-7b',     cat:'llm', kind:'LLM',    name:'Orion-7B-Mini',      creator:'Atlas Labs',       price:29,   priceUnit:'/mo',  delta:+11, rating:4.71, sales:8400 },
    { id:'kali-34b',     cat:'llm', kind:'LLM',    name:'KaliCode-34B',       creator:'DeepForge',        price:199,  priceUnit:'/mo',  delta:-4,  rating:4.66, sales:5120 },
    { id:'vega-13b',     cat:'llm', kind:'LLM',    name:'Vega-13B-Legal',     creator:'Sigma Labs',       price:89,   priceUnit:'/mo',  delta:+6,  rating:4.58, sales:2840 },
    { id:'helix-1t',     cat:'llm', kind:'LLM',    name:'Helix-1T-MoE',       creator:'Parallax',         price:499,  priceUnit:'/mo',  delta:+22, rating:4.89, sales:1240, tag:'NEW' },
    { id:'orion-mini',   cat:'llm', kind:'LLM',    name:'Orion-Mini 3B',      creator:'Atlas Labs',       price:9,    priceUnit:'/mo',  delta:+2,  rating:4.41, sales:24000 },

    // ===== Agents =====
    { id:'phoenix',      cat:'agent', kind:'AGENT', name:'Phoenix-Agent v3',  creator:'Parallax',          price:349, priceUnit:'/mo',  delta:+9,  rating:4.81, sales:3480, tag:'TOP RATED' },
    { id:'sentinel',     cat:'agent', kind:'AGENT', name:'Sentinel SOC',      creator:'Cyberdyne',         price:899, priceUnit:'/mo',  delta:+3,  rating:4.72, sales:620 },
    { id:'archon',       cat:'agent', kind:'AGENT', name:'Archon Ops',        creator:'Parallax',          price:249, priceUnit:'/mo',  delta:+18, rating:4.68, sales:1480, isNew:true },
    { id:'clerk',        cat:'agent', kind:'AGENT', name:'Clerk-Finance',     creator:'Merlin',            price:149, priceUnit:'/mo',  delta:-2,  rating:4.44, sales:2840 },

    // ===== Vision =====
    { id:'midas-vl',     cat:'vision', kind:'VISION', name:'Midas-VL',        creator:'Lumen',             price:89,  priceUnit:'/mo',  delta:+42, rating:4.77, sales:4200, tag:'HOT' },
    { id:'argus-seg',    cat:'vision', kind:'VISION', name:'Argus-Seg-XL',    creator:'Optic',             price:129, priceUnit:'/mo',  delta:+7,  rating:4.62, sales:1840 },
    { id:'pixel-diff',   cat:'vision', kind:'VISION', name:'Pixel-Diffuse 3', creator:'Lumen',             price:49,  priceUnit:'/mo',  delta:+14, rating:4.55, sales:7200 },

    // ===== Audio =====
    { id:'vox-suno',     cat:'audio', kind:'AUDIO',  name:'VoxSuno-Fine',     creator:'Acoustic Co.',      price:59,  priceUnit:'/mo',  delta:+77, rating:4.83, sales:6400, tag:'BLOWING UP' },
    { id:'whisper-pro',  cat:'audio', kind:'AUDIO',  name:'WhisperPro-XXL',   creator:'OpenMic',           price:39,  priceUnit:'/mo',  delta:+5,  rating:4.69, sales:8200 },

    // ===== Code =====
    { id:'kali-34b-c',   cat:'code', kind:'CODE',    name:'KaliCode-34B',     creator:'DeepForge',         price:199, priceUnit:'/mo',  delta:-4,  rating:4.66, sales:5120 },
    { id:'repo-guru',    cat:'code', kind:'CODE',    name:'RepoGuru-IDE',     creator:'Stackhouse',        price:19,  priceUnit:'/mo',  delta:+24, rating:4.74, sales:12400 },

    // ===== GPUs (resale / retail) =====
    { id:'rtx-5090',     cat:'gpu', kind:'GPU',      name:'NVIDIA RTX 5090',         creator:'NVIDIA · Retail',  price:1999, priceUnit:'', delta:+2, rating:4.91, sales:4200, tag:'IN STOCK' },
    { id:'rtx-4090-u',   cat:'gpu', kind:'GPU',      name:'RTX 4090 — Used (A-grade)', creator:'Fleet Resale',   price:1199, priceUnit:'', delta:-8, rating:4.62, sales:1840 },
    { id:'h100-80',      cat:'gpu', kind:'GPU',      name:'H100 SXM5 80GB',          creator:'Enterprise Auth',  price:32000, priceUnit:'', delta:+1, rating:4.94, sales:240 },
    { id:'mi300x',       cat:'gpu', kind:'GPU',      name:'AMD Instinct MI300X',     creator:'AMD · Authorized', price:14999, priceUnit:'', delta:+12, rating:4.78, sales:120, tag:'NEW' },
    { id:'rtx-6000-ada', cat:'gpu', kind:'GPU',      name:'RTX 6000 Ada 48GB',       creator:'NVIDIA · Retail',  price:6800, priceUnit:'', delta:0, rating:4.81, sales:640 },
    { id:'a100-40',      cat:'gpu', kind:'GPU',      name:'A100 40GB — Used',        creator:'Fleet Resale',     price:6200, priceUnit:'', delta:-5, rating:4.52, sales:920 },

    // ===== Hardware / AI PCs / phones =====
    { id:'dgx-spark',    cat:'hardware', kind:'WORKSTATION', name:'NVIDIA DGX Spark',     creator:'NVIDIA',       price:3999, priceUnit:'', delta:+4, rating:4.88, sales:840, tag:'PRE-ORDER' },
    { id:'mac-m4-max',   cat:'hardware', kind:'WORKSTATION', name:'Mac Studio M4 Max',    creator:'Apple',        price:3999, priceUnit:'', delta:+3, rating:4.89, sales:2400 },
    { id:'mac-mini-m4',  cat:'hardware', kind:'WORKSTATION', name:'Mac Mini M4 Pro',      creator:'Apple',        price:1499, priceUnit:'', delta:+6, rating:4.82, sales:6200 },
    { id:'ai-pc-x',      cat:'hardware', kind:'AI PC',       name:'Framework AI Desktop', creator:'Framework',    price:2499, priceUnit:'', delta:+14, rating:4.71, sales:420, isNew:true },
    { id:'pixel-ai',     cat:'hardware', kind:'AI PHONE',    name:'Pixel AI Pro',         creator:'Google',       price:999,  priceUnit:'', delta:+2, rating:4.61, sales:8400 },
    { id:'ai-tab',       cat:'hardware', kind:'AI TABLET',   name:'Atlas AI Tab',         creator:'Atlas',        price:699,  priceUnit:'', delta:+22, rating:4.44, sales:1200, tag:'NEW' },

    // ===== Servers =====
    { id:'dell-r760',    cat:'server', kind:'SERVER',        name:'Dell PowerEdge R760xa', creator:'Dell · Auth', price:18400, priceUnit:'', delta:+1, rating:4.77, sales:160 },
    { id:'lenovo-sr',    cat:'server', kind:'SERVER',        name:'Lenovo ThinkSystem SR675', creator:'Lenovo · Auth', price:21900, priceUnit:'', delta:+3, rating:4.71, sales:92 },
    { id:'supermicro',   cat:'server', kind:'AI SERVER',     name:'Supermicro GPU SuperServer', creator:'Supermicro', price:29800, priceUnit:'', delta:+6, rating:4.82, sales:48 },
    { id:'hgx-h200',     cat:'server', kind:'AI SERVER',     name:'HGX H200 8-GPU Box',   creator:'Enterprise',   price:284000, priceUnit:'', delta:+9, rating:4.93, sales:12, tag:'LIMITED' },

    // ===== Compute =====
    { id:'h100-spot',    cat:'compute', kind:'GPU RENT',     name:'8× H100 Spot · US-East',  creator:'NovaCompute', price:12.74, priceUnit:'/hr', delta:-4, rating:4.77, sales:9200, tag:'LIVE' },
    { id:'h200-spot',    cat:'compute', kind:'GPU RENT',     name:'4× H200 · EU-West',       creator:'Aurora',      price:8.99,  priceUnit:'/hr', delta:+11, rating:4.68, sales:3400 },
    { id:'a100-spot',    cat:'compute', kind:'GPU RENT',     name:'2× A100 80GB',            creator:'Helix Cloud', price:3.99,  priceUnit:'/hr', delta:+2, rating:4.55, sales:14200 },
    { id:'mi300-spot',   cat:'compute', kind:'GPU RENT',     name:'1× MI300X',               creator:'AMD Cloud',   price:4.49,  priceUnit:'/hr', delta:+18, rating:4.62, sales:1840, isNew:true },
    { id:'b100-spot',    cat:'compute', kind:'GPU RENT',     name:'8× B100 Blackwell',       creator:'NovaCompute', price:18.90, priceUnit:'/hr', delta:+34, rating:4.89, sales:420, tag:'HOT' },

    // ===== Credits =====
    { id:'cred-gpt',     cat:'credits', kind:'CREDITS',      name:'GPT-class · 10M tokens',  creator:'OpenRoute',   price:12,   priceUnit:'', delta:-2, rating:4.44, sales:48200 },
    { id:'cred-claude',  cat:'credits', kind:'CREDITS',      name:'Claude-class · 10M tokens', creator:'OpenRoute', price:15,  priceUnit:'', delta:+4, rating:4.68, sales:28400 },
    { id:'cred-image',   cat:'credits', kind:'CREDITS',      name:'Diffusion · 1000 gen',    creator:'Lumen',       price:8,    priceUnit:'', delta:+14, rating:4.55, sales:18200 },
    { id:'cred-tts',     cat:'credits', kind:'CREDITS',      name:'TTS · 1M chars',          creator:'VoxSuno',     price:6,    priceUnit:'', delta:+7, rating:4.71, sales:9400 },

    // ===== API access =====
    { id:'api-orion',    cat:'api', kind:'API',              name:'Orion API — Unlimited',   creator:'Atlas Labs',  price:499, priceUnit:'/mo', delta:+8, rating:4.78, sales:1240 },
    { id:'api-phoenix',  cat:'api', kind:'API',              name:'Phoenix Agent API',       creator:'Parallax',    price:349, priceUnit:'/mo', delta:+9, rating:4.73, sales:980 },
    { id:'api-voice',    cat:'api', kind:'API',              name:'VoxSuno Voice API',       creator:'Acoustic Co.',price:149, priceUnit:'/mo', delta:+14, rating:4.66, sales:2400 },
    { id:'api-vision',   cat:'api', kind:'API',              name:'Midas Vision API',        creator:'Lumen',       price:99,  priceUnit:'/mo', delta:+21, rating:4.61, sales:3200 },

    // ===== Cloud =====
    { id:'cloud-s3',     cat:'cloud', kind:'STORAGE',        name:'Helix Object · 10TB',     creator:'Helix Cloud', price:89,  priceUnit:'/mo', delta:+2, rating:4.55, sales:4200 },
    { id:'cloud-vec',    cat:'cloud', kind:'VECTOR DB',      name:'Atlas Vector · 100M',     creator:'Atlas Labs',  price:149, priceUnit:'/mo', delta:+18, rating:4.78, sales:1840, tag:'NEW' },
    { id:'cloud-infer',  cat:'cloud', kind:'INFERENCE',      name:'Nova Inference Node',     creator:'NovaCompute', price:0.0012, priceUnit:'/req', delta:+11, rating:4.66, sales:28400 },
  ];

  // Editorial collections (Spotify-style curated rows)
  const COLLECTIONS = [
    {
      id: 'starter',
      title: 'The Starter Kit',
      subtitle: 'Everything a solo builder needs. Zero to shipping in a weekend.',
      color: '#6C5CE7',
      itemIds: ['orion-mini', 'api-voice', 'cred-gpt', 'cloud-vec', 'repo-guru']
    },
    {
      id: 'trading-desk',
      title: 'Build a Trading Desk',
      subtitle: '4 models + 2 agents + compute. Scaled to 20 req/sec.',
      color: '#FF6AC7',
      itemIds: ['clerk', 'helix-1t', 'api-orion', 'h100-spot', 'cloud-vec']
    },
    {
      id: 'on-prem',
      title: 'Go On-Prem',
      subtitle: 'Bring the whole stack home. Hardware + orchestration.',
      color: '#4A7BFF',
      itemIds: ['dgx-spark', 'mi300x', 'supermicro', 'hgx-h200', 'h100-80']
    },
    {
      id: 'creative',
      title: 'The Creative Studio',
      subtitle: 'Vision, voice, video. One subscription.',
      color: '#FFD84D',
      itemIds: ['pixel-diff', 'midas-vl', 'vox-suno', 'whisper-pro', 'argus-seg']
    },
  ];

  // Recently-viewed (for logged-in user state)
  const RECENT = ['orion-70b', 'dgx-spark', 'h100-spot', 'midas-vl', 'mi300x', 'vox-suno'];

  // Top creators (leaderboard-esque)
  const CREATORS = [
    { name: 'Atlas Labs',      listings: 28, rating: 4.88, sales: '142K', verified: true },
    { name: 'Parallax',        listings: 14, rating: 4.82, sales: '96K',  verified: true },
    { name: 'Lumen',           listings: 18, rating: 4.77, sales: '84K',  verified: true },
    { name: 'NovaCompute',     listings: 42, rating: 4.74, sales: '64K',  verified: true },
    { name: 'DeepForge',       listings:  9, rating: 4.69, sales: '38K',  verified: false },
  ];

  // Build a quick lookup
  const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));

  return { CATS, FEATURED, ITEMS, COLLECTIONS, RECENT, CREATORS, byId };
})();
