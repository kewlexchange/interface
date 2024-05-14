import React from 'react';
import ReactDOM from 'react-dom';
import 'regenerator-runtime/runtime.js';
import Web3Provider from '../src/Components/Web3Provider'

import App from './App';
import Domain from './Domain';
import { Provider } from 'react-redux'
import "../src/i18n/i18n"
import "./style/index.scss"
import './polyfills';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider as NextThemesProvider } from "next-themes";

import store from "./state";
import { SocketProvider } from './hooks/useSocketProvider';
import { isCHZDomains, isIMON, isPonyGames } from './hooks/useDomains';
import {NextUIProvider} from '@nextui-org/react'
import { createRoot } from 'react-dom/client';
import PonyGames from './PonyGames';

(window as any).global = window;

if (!!window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false
}

const root = document.getElementById('root');
const rootInstance = createRoot(root);
rootInstance.render(

  <HelmetProvider>
  <SocketProvider>
  <NextUIProvider>
  <NextThemesProvider  attribute="class" defaultTheme="dark">

    <Provider store={store}>
      {
        isIMON() &&  <App/>
      }
      {
        isCHZDomains() && <Domain/>
      }
        {
        isPonyGames() && <PonyGames/>
      }
           
    </Provider>
    </NextThemesProvider>

    </NextUIProvider>
    </SocketProvider>
    </HelmetProvider>



);

 