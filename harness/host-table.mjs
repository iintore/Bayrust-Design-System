// Host responses (see host-mocks.mjs). Shapes follow what the shipped code reads.
export const table = (macosHost, installedApps) => ({
  'raycast.terminateOtherInstances': null,
  'applications.getAllInstalled': () => ({ applications: installedApps() }),
  'applications.getAllRunning': () => ({ applications: macosHost('running') }),
  // Not an organization-managed Mac: no required sign-in domain.
  'system.getManagedSignInPolicy': { requiredDomain: null },
  // INFERRED (unverified): paths are the application roots listed together in the host binary's
  // FileSystemWatchdog strings; which ones are user-disableable is not visible statically.
  'applications.getDefaultSearchScopes': () => ['/Applications', `${process.env.HOME}/Applications`, '/System/Applications', '/System/Library/CoreServices/Applications']
    .map((path) => ({ path, canDisable: false })),
});
