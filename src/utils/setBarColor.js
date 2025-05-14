import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function setBarColorFromElement(selector, fallback = '#FFFFFF', style = 'dark') {
  let color = fallback;
  const el = document.querySelector(selector);
  if (el) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      color = rgbToHex(bg) || fallback;
    }
  }
  // Set meta theme-color for nav bar (Android)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);

  // Set status bar color (native only)
  if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
    StatusBar.setBackgroundColor({ color });
    StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light });
  }
}

// Helper to convert rgb/rgba to hex
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return null;
  return (
    '#' +
    result
      .slice(0, 3)
      .map(x => ('0' + parseInt(x).toString(16)).slice(-2))
      .join('')
  );
} 