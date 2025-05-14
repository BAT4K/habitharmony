import { useEffect } from 'react';

useEffect(() => {
  // Set status bar and nav bar to #FBE8C3
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setBackgroundColor({ color: '#FBE8C3' });
      StatusBar.setStyle({ style: Style.Dark });
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#FBE8C3');
  }
}, []); 