import { useEffect } from 'react';

useEffect(() => {
  // Set status bar and nav bar to #F8F3F3
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setBackgroundColor({ color: '#F8F3F3' });
      StatusBar.setStyle({ style: Style.Dark });
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F8F3F3');
  }
}, []);

<div className="main-app-container min-h-screen font-display bg-[#F8F3F3] pb-24 relative overflow-y-auto">
  {/* ... */}
</div> 