// Dashboard data — fresh user (empty state)
window.ITARA_DASH = (() => {
  const USER = {
    name: 'Welcome',
    handle: '@user',
    tier: 'FREE',
    joined: 'Just now',
    balance: 0.00,
    escrow: 0.00,
    pendingPayout: 0.00,
  };

  const LISTINGS = [];
  const RENTALS = [];
  const TASKS = [];

  const CHECKLIST = [
    { t: 'Verify identity', done: false },
    { t: 'Connect payout wallet', done: false },
    { t: 'List first GPU / model', done: false },
    { t: 'Enable escrow 2FA', done: false },
    { t: 'Invite a collaborator', done: false },
  ];

  const NOTIFS = [];

  // Empty earnings chart (30 days of zeros)
  const earnings = Array(30).fill(0);

  const TRENDING = [];

  return { USER, LISTINGS, RENTALS, TASKS, CHECKLIST, NOTIFS, earnings, TRENDING };
})();
