import React from 'react';
import { createRoot } from 'react-dom/client';
import 'regenerator-runtime/runtime.js';
import '../src/style/index.scss';
import '../src/i18n/i18n';
import { HelmetProvider } from 'react-helmet-async';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { SocketProvider } from './hooks/useSocketProvider';
import { isCHZDomains, isIMON, isPonyGames } from './hooks/useDomains';
import store from './state';
import App from './App';
import Domain from './Domain';
import PonyGames from './PonyGames';

(window as any).global = window;

// Disable auto refresh on network change for MetaMask
if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false;
}

// Define a component to wrap the main application with all providers
const AppWrapper: React.FC = () => {
  return (
    <React.StrictMode>
      <HelmetProvider>
        <NextUIProvider>
          <NextThemesProvider attribute="class" defaultTheme="dark">
            <SocketProvider>
              <Provider store={store}>
                {isIMON() && <App />}
                {isCHZDomains() && <Domain />}
                {isPonyGames() && <PonyGames />}
              </Provider>
            </SocketProvider>
          </NextThemesProvider>
        </NextUIProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
};

// Render the application
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<AppWrapper />);
}