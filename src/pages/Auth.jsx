import { setBarColorFromElement } from '../utils/setBarColor';
import { useEffect } from 'react';

useEffect(() => {
  // Set status bar and nav bar to #FFFFFF
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      StatusBar.setStyle({ style: Style.Dark });
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#FFFFFF');
  }
}, []);

useEffect(() => {
  setBarColorFromElement('body', '#FFFFFF', 'dark');
}, []); 