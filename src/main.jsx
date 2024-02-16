// libraries
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './main.css';

import { ThemeProvider } from '@mui/material/styles';
import theme from './Theme'; // Import the theme you created


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);