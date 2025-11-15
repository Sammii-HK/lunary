// Quick script to unregister service workers in the browser console
// Run this in your browser console: navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      if (registrations.length === 0) {
        console.log('✅ No service workers registered');
        return;
      }
      console.log(
        `Found ${registrations.length} service worker(s), unregistering...`,
      );
      return Promise.all(
        registrations.map((registration) => {
          console.log(`Unregistering: ${registration.scope}`);
          return registration.unregister();
        }),
      );
    })
    .then(() => {
      console.log('✅ All service workers unregistered');
      console.log(
        '💡 Now clear your browser cache and hard refresh (Cmd+Shift+R)',
      );
    })
    .catch((error) => {
      console.error('❌ Error unregistering service workers:', error);
    });
}
