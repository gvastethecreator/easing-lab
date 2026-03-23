import React from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { CustomEase } from 'gsap/CustomEase';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Global GSAP Configuration
gsap.registerPlugin(MotionPathPlugin, CustomEase);

// Optimize GSAP Ticker
gsap.ticker.fps(60);
gsap.defaults({
  overwrite: 'auto',
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
