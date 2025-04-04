import {ChainId, DEFAULT_CHAIN_INFO} from '../constants/chains'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Actions, Connector } from '@web3-react/types'
import GNOSIS_ICON from '../assets/images/gnosis.png'
import UNISWAP_LOGO from '../assets/svg/logo.svg'
import COINBASE_ICON from '../assets/wallets/coinbase-icon.svg'
import UNIWALLET_ICON from '../assets/wallets/uniswap-wallet-icon.png'
import WALLET_CONNECT_ICON from '../assets/wallets/walletconnect-icon.svg'
import COIN98_WALLET_ICON from "../assets/wallets/coin98.svg"
import OKX_WALLET_ICON from "../assets/wallets/okx.svg"
import RABY_WALLET_ICON from "../assets/wallets/rabby-icon.svg"

import { RPC_URLS } from '../constants/networks'
import { RPC_PROVIDERS } from '../constants/providers'
import { Connection, ConnectionType } from './types'
import { getInjection, getIsCoin98Wallet, getIsCoinbaseWallet, getIsInjected, getIsMetaMaskWallet, getIsOKXWallet, getIsRabbyWallet } from './utils'
import { UniwalletConnect as UniwalletWCV2Connect, WalletConnectV2 } from './WalletConnectV2'
import {MAINNET_CHAIN_ID, MAINNET_INFO} from "../constants/chainInfo";
import { isMobile, isTouchable, isWebAndroid, isWebIOS } from '../utils/platform'

function onError(error: Error) {
  console.log(`web3-react error: ${error}`)
}

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: parseInt(DEFAULT_CHAIN_INFO.chainId) })
)
export const networkConnection: Connection = {
  getName: () => 'Network',
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
  shouldDisplay: () => false,
}

const getIsCoinbaseWalletBrowser = () => isMobile && getIsCoinbaseWallet()
const getIsMetaMaskBrowser = () => isMobile && getIsMetaMaskWallet()
const getIsCoin98WalletBrowser = () => isMobile && getIsCoin98Wallet()

const getIsInjectedMobileBrowser = () => getIsCoinbaseWalletBrowser() || getIsMetaMaskBrowser() || getIsCoin98WalletBrowser()

const getShouldAdvertiseMetaMask = () =>
  !getIsMetaMaskWallet() && !isMobile && (!getIsInjected() || getIsCoinbaseWallet())
const getIsGenericInjector = () => getIsInjected() && !getIsMetaMaskWallet() && !getIsCoinbaseWallet() && !getIsCoin98Wallet()

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))

const injectedConnection: Connection = {
  getName: () => getInjection().name,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getIcon: (isDarkMode: boolean) => getInjection(isDarkMode).icon,
  shouldDisplay: () => getIsMetaMaskWallet() || getShouldAdvertiseMetaMask() || getIsGenericInjector(),
  // If on non-injected, non-mobile browser, prompt user to install Metamask
  overrideActivate: () => {
    if (getShouldAdvertiseMetaMask()) {
      window.open('https://metamask.io/', 'inst_metamask')
      return true
    }
    return false
  },
}

const injectedCoin98Connection: Connection = {
  getName: () =>"Coin98",
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getIcon: (isDarkMode: boolean) => COIN98_WALLET_ICON,
  shouldDisplay: () => getIsCoin98Wallet() || getIsMetaMaskWallet() || getShouldAdvertiseMetaMask() || getIsGenericInjector(),
  // If on non-injected, non-mobile browser, prompt user to install Metamask
  overrideActivate: () => {
    if (getShouldAdvertiseMetaMask()) {
      window.open('https://coin98.com/wallet', '')
      return true
    }
    return false
  },
}


const injectedRabyConnection: Connection = {
  getName: () =>"Rabby",
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getIcon: (isDarkMode: boolean) => RABY_WALLET_ICON,
  shouldDisplay: () => getIsRabbyWallet() || getIsMetaMaskWallet() || getShouldAdvertiseMetaMask() || getIsGenericInjector(),
  // If on non-injected, non-mobile browser, prompt user to install Metamask
  overrideActivate: () => {
    if (getShouldAdvertiseMetaMask()) {
      window.open('https://rabby.io/', '')
      return true
    }
    return false
  },
}

const injectedOKXConnection: Connection = {
  getName: () =>"OKX Wallet",
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getIcon: (isDarkMode: boolean) => OKX_WALLET_ICON,
  shouldDisplay: () => getIsOKXWallet() || getIsCoin98Wallet() || getIsMetaMaskWallet() || getShouldAdvertiseMetaMask() || getIsGenericInjector(),
  // If on non-injected, non-mobile browser, prompt user to install Metamask
  overrideActivate: () => {
    if (getShouldAdvertiseMetaMask()) {
      window.open('https://www.okx.com/web3', '')
      return true
    }
    return false
  },
}

const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<GnosisSafe>((actions) => new GnosisSafe({ actions }))
export const gnosisSafeConnection: Connection = {
  getName: () => 'Gnosis Safe',
  connector: web3GnosisSafe,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE,
  getIcon: () => GNOSIS_ICON,
  shouldDisplay: () => false,
}

export const walletConnectV2Connection: Connection = new (class implements Connection {
  private initializer = (actions: Actions, defaultChainId = MAINNET_CHAIN_ID) =>
    new WalletConnectV2({ actions, defaultChainId, onError })

  type = ConnectionType.WALLET_CONNECT_V2
  getName = () => 'WalletConnect'
  getIcon = () => WALLET_CONNECT_ICON
  shouldDisplay = () => true

  private _connector = initializeConnector<WalletConnectV2>(this.initializer)
  overrideActivate = (chainId?: ChainId) => {
    // Always re-create the connector, so that the chainId is updated.
    this._connector = initializeConnector((actions) => this.initializer(actions, chainId))
    return false
  }
  get connector() {
    return this._connector[0]
  }
  get hooks() {
    return this._connector[1]
  }
})()

const [web3WCV2UniwalletConnect, web3WCV2UniwalletConnectHooks] = initializeConnector<UniwalletWCV2Connect>(
  (actions) => new UniwalletWCV2Connect({ actions, onError })
)

const isNonSupportedDevice = !isWebIOS && !isWebAndroid && isTouchable

export const uniwalletWCV2ConnectConnection: Connection = {
  getName: () => 'Uniswap Wallet',
  connector: web3WCV2UniwalletConnect,
  hooks: web3WCV2UniwalletConnectHooks,
  type: ConnectionType.UNISWAP_WALLET_V2,
  getIcon: () => UNIWALLET_ICON,
  shouldDisplay: () => Boolean(!getIsInjectedMobileBrowser() && !isNonSupportedDevice),
  isNew: true,
}

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: RPC_URLS[MAINNET_CHAIN_ID][0],
        appName: 'Uniswap',
        appLogoUrl: UNISWAP_LOGO,
        reloadOnDisconnect: false,
      },
      onError,
    })
)
const coinbaseWalletConnection: Connection = {
  getName: () => 'Coinbase Wallet',
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
  getIcon: () => COINBASE_ICON,
  shouldDisplay: () =>
    Boolean((isMobile && !getIsInjectedMobileBrowser()) || !isMobile || getIsCoinbaseWalletBrowser()),
  // If on a mobile browser that isn't the coinbase wallet browser, deeplink to the coinbase wallet app
  overrideActivate: () => {
    if (isMobile && !getIsInjectedMobileBrowser()) {
      window.open('https://go.cb-w.com/mtUDhEZPy1', 'cbwallet')
      return true
    }
    return false
  },
}

export function getConnections() {
  return [
    injectedOKXConnection,
    injectedConnection,
    injectedRabyConnection,
    injectedCoin98Connection,
    uniwalletWCV2ConnectConnection,
    walletConnectV2Connection,
    coinbaseWalletConnection,
    gnosisSafeConnection,
    networkConnection,
  ]
}

export function getConnection(c: Connector | ConnectionType) {
  if (c instanceof Connector) {
    const connection = getConnections().find((connection) => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  } else {
    switch (c) {
      case ConnectionType.INJECTED:
        return injectedConnection
      case ConnectionType.COINBASE_WALLET:
        return coinbaseWalletConnection
      case ConnectionType.WALLET_CONNECT_V2:
        return walletConnectV2Connection
      case ConnectionType.UNISWAP_WALLET_V2:
        return uniwalletWCV2ConnectConnection
      case ConnectionType.NETWORK:
        return networkConnection
      case ConnectionType.GNOSIS_SAFE:
        return gnosisSafeConnection
    }
  }
}
