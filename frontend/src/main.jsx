import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './design-system/design-system.css'; // Design System foundation (Phase 1A)
import './index.css';
import { theme } from './design-system';

theme.init(); // Apply persisted theme (light | dark | system)

createRoot(document.getElementById('root')).render(<App />);
