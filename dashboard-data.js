// Dashboard data — simulated state for an active power user
window.ITARA_DASH = (() => {
  const USER = {
    name: 'Arjun',
    handle: '@arjun.k',
    tier: 'PRO',
    joined: 'Jan 2026',
    balance: 8241.40,
    escrow: 1280.00,
    pendingPayout: 342.18,
  };

  const LISTINGS = [
    { kind: 'GPU', name: '4× H100 SXM5 cluster', status: 'RENTED', price: '$2.49/hr', earnings: 1840.20, util: 0.92 },
    { kind: 'GPU', name: '2× A100 80GB', status: 'AVAILABLE', price: '$1.79/hr', earnings: 520.80, util: 0.41 },
    { kind: 'MODEL', name: 'Orion-Legal-7B', status: 'LIVE', price: '$149', earnings: 2384.00, util: 0.77 },
    { kind: 'MODEL', name: 'VoxSuno-Fine', status: 'LIVE', price: '$59', earnings: 1180.00, util: 0.64 },
  ];

  const RENTALS = [
    { name: '8× H100 @ NovaCompute', runs: '3d 14h', spend: 482.12, status: 'RUNNING' },
    { name: 'Phoenix-Agent instance', runs: '6h 22m', spend: 48.60, status: 'RUNNING' },
  ];

  const TASKS = [
    { title: 'Fine-tune Llama-3 on legal corpus', budget: 4200, stage: 'REVIEWING · 14 bids' },
    { title: 'Voice cloning API sprint', budget: 3100, stage: 'IN PROGRESS · 73%' },
  ];

  const CHECKLIST = [
    { t: 'Verify identity', done: true },
    { t: 'Connect payout wallet', done: true },
    { t: 'List first GPU / model', done: true },
    { t: 'Enable escrow 2FA', done: false },
    { t: 'Invite a collaborator', done: false },
  ];

  const NOTIFS = [
    { icon: '◆', text: 'Escrow released · +$420 from @sigma labs', t: '2m' },
    { icon: '●', text: 'New bid on "Legal corpus fine-tune" · $3,800', t: '18m' },
    { icon: '▲', text: 'H100 spot price up 4% in US-East', t: '42m' },
    { icon: '★', text: 'Orion-Legal-7B passed 2,400 sales', t: '2h' },
  ];

  // 30-day earnings series
  const earnings = Array.from({ length: 30 }, (_, i) => {
    const base = 180 + Math.sin(i / 3.2) * 60 + (i / 30) * 120;
    return Math.max(40, base + (Math.random() - 0.5) * 80);
  });

  const TRENDING = [
    { name: 'Orion-70B-Instruct', kind: 'LLM', price: 149, delta: +18 },
    { name: 'Midas-VL', kind: 'Vision', price: 89, delta: +42 },
    { name: 'Phoenix-Agent', kind: 'Agent', price: 349, delta: +9 },
    { name: 'KaliCode-34B', kind: 'Code', price: 199, delta: -4 },
    { name: 'VoxSuno-Fine', kind: 'Audio', price: 59, delta: +77 },
  ];

  return { USER, LISTINGS, RENTALS, TASKS, CHECKLIST, NOTIFS, earnings, TRENDING };
})();
