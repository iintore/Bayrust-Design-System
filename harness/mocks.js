// Host responses for the stubbed bridge. Shapes follow what the shipped frontend code reads.
// URL params let the harness open a specific state, e.g. welcome-window.html?step=ai&userType=new
(() => {
  const q = new URLSearchParams(location.search);
  // Host-injected globals (names from the frontend's own reads; values from this Mac: sw_vers / Raycast 2.8.2).
  Object.assign(window, {
    identifier: location.pathname.startsWith('/ds') ? 'settings' : location.pathname.replace(/^\/|-window\.html$/g, ''),
    osName: 'macOS', osVersion: '27.0.1', osArch: 'arm64', version: '2.8.2',
    initialAppearance: q.get('appearance') || 'dark',
    systemLocale: 'en-RW', // this Mac: defaults read -g AppleLocale → en_RW
    systemMeasurementSystem: 'metric', homedir: '/Users/tonma',
    uiTestingEnabled: true,
    // The host injects the macOS accent colour; the UI maps it to --color-system-accent, which overrides
    // the theme accent (--accent: var(--color-system-accent, var(--theme-accent))). This Mac: Blue
    // (AppleAccentColor 4) = NSColor.controlAccentColor #007AFF in sRGB.
    systemAccentColor: q.get('systemAccent') ?? '#007AFF',
    raycastApi: { environment: 'production' },
    commitHash: 'd6aec411b00b484749742a8a14214f0041f356da', // Info.plist GitCommitHash
  });
  if (q.get('variant')) localStorage.setItem('_raycast_:internal-welcome-window-variant', JSON.stringify(q.get('variant')));
  Object.assign(window.__ipcMocks, {
    'raycast.consumeWelcomeResumeStep': q.get('step') ? { step: q.get('step'), userType: q.get('userType') || 'new' } : {},
    'system.getClassicMigrationStatus': { hasClassicDatabase: q.get('userType') === 'classic', migrated: false },
    'system.getImportSettingsDataStatus': { inProgress: false },
    'userDefaults.get': null,
    // Account state. The sandboxed backend is signed out, and signing in would return to the real app, so the
    // harness answers auth.getUser the way Raycast's own Internal Settings › Auth State override builds a user:
    // ?account=trial (default; this Mac's plan: Pro trial ending 27 Oct), pro, or signed-out (default in onboarding).
    ...(() => {
      const mode = q.get('account') ?? (location.pathname.startsWith('/welcome') ? 'signed-out' : 'trial');
      if (mode === 'signed-out') return {};
      const ends = Math.floor(Date.UTC(2026, 9, 27, 12) / 1000);
      const user = {
        id: 'sandbox-user', email: 'user@bayrust.app', name: 'Bayrust User', username: 'bayrust', handle: 'bayrust', avatar: null,
        has_pro_features: true, has_better_ai: false, can_apply_for_free_trial: false, organizations: [],
        cloud_sync_v2_access: { allowed: true },
        subscription: mode === 'trial'
          ? { id: 'internal-trial', status: 'trialing', interval: 'month', running: true, has_better_ai: false, tier: 'pro', trial_period_days: 14, trial_days_left: 6, current_period_end: ends }
          : { id: 'internal-subscribed', status: 'active', interval: 'month', running: true, has_better_ai: false, tier: 'pro' },
      };
      // The account page reads the plan's state from the credits balance (a server call): the subscription funding
      // it. Only that is answered; credit amounts stay unknown.
      return { 'auth.getUser': user, 'ai.getCreditsBalance': { source: 'personal', funding_subscription: user.subscription } };
    })(),
    // ?windowMode=compact|expanded — the launcher's Window Mode setting (Settings › General), applied over the
    // sandboxed backend's real general settings.
    ...(q.get('windowMode') ? { 'settings.getGeneralSettings': async () => ({
      ...(await (await fetch('/__backend', { method: 'POST', body: JSON.stringify({ method: 'settings.getGeneralSettings' }) })).json()),
      windowMode: q.get('windowMode') }) } : {}),
    // backend onboarding.getSuggestedExtensions: GET backend.raycast.com/api/v1/extensions/suggested (saved in data/),
    // macOS-filtered; with no installed-app signal every score is 0, so the backend keeps the first 3 plus one of the rest.
    'onboarding.getSuggestedExtensions': async () => {
      const { data } = await (await fetch('/__mocks/data/extensions-suggested.json')).json();
      return data.filter(e => e.platforms.includes('macOS')).slice(0, 4).map(e => ({ ...e, reason: null }));
    },
  });
})();
// Like the native host after it shows a window: report it visible and focused (IPC notifications).
(() => {
  const send = () => {
    if (!window.ipcNotification) return setTimeout(send, 50);
    window.ipcNotification('window.visibilityChanged', JSON.stringify({ visible: true }));
    window.ipcNotification('window.focusChanged', JSON.stringify({ focused: true }));
  };
  window.addEventListener('load', () => setTimeout(send, 300));
})();
