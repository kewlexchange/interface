import { ChainId } from '../constants/chains'
import { URI_AVAILABLE, WalletConnect, WalletConnectConstructorArgs } from '@web3-react/walletconnect-v2'
import { L1_CHAIN_IDS, L2_CHAIN_IDS } from '../constants/chains'
import { isIOS } from '../utils/userAgent'

import { RPC_URLS } from '../constants/networks'
import { isIMON, isKEWL } from '../hooks/useDomains'
import { MAINNET_CHAIN_ID } from '@/constants/chainInfo'

// Avoid testing for the best URL by only passing a single URL per chain.
// Otherwise, WC will not initialize until all URLs have been tested (see getBestUrl in web3-react).
const RPC_URLS_WITHOUT_FALLBACKS = Object.entries(RPC_URLS).reduce(
  (map, [chainId, urls]) => ({
    ...map,
    [chainId]: urls[0],
  }),
  {}
)

export class WalletConnectV2 extends WalletConnect {
  ANALYTICS_EVENT = 'Wallet Connect QR Scan'
  constructor({
    actions,
    defaultChainId,
    qrcode = true,
    onError,
  }: Omit<WalletConnectConstructorArgs, 'options'> & { defaultChainId: number; qrcode?: boolean }) {
    const darkmode = false
    super({
      actions,
      options: {
        projectId: isKEWL() || isIMON() ? "475ea40fced1a4793af5c5ff0bb4e6bf" : "d03a1cd0dd1dacf2b8c428f0ae4a725e",
        chains: [defaultChainId],
        metadata: {
          name: "KEWL EXCHANGE",
          description: "KEWL DeFi.",
          url: "https://kewl.exchange",
          icons: ["https://www.kewl.exchange/android-chrome-512x512.png"],
        },
        optionalChains: [...L1_CHAIN_IDS, ...L2_CHAIN_IDS],
        showQrModal: qrcode,
        rpcMap: RPC_URLS_WITHOUT_FALLBACKS,
        // as of 6/16/2023 there are no docs for `optionalMethods`
        // this set of optional methods fixes a bug we encountered where permit2 signatures were never received from the connected wallet
        // source: https://uniswapteam.slack.com/archives/C03R5G8T8BH/p1686858618164089?thread_ts=1686778867.145689&cid=C03R5G8T8BH
        optionalMethods: ['eth_signTypedData', 'eth_signTypedData_v4', 'eth_sign'],
        qrModalOptions: {
          desktopWallets: undefined,
          enableExplorer: true,
          explorerExcludedWalletIds: undefined,
          explorerRecommendedWalletIds: undefined,
          mobileWallets: undefined,
          privacyPolicyUrl: undefined,
          termsOfServiceUrl: undefined,
          themeMode: darkmode ? 'dark' : 'light',
          themeVariables: {
            '--wcm-font-family': '"Inter custom", sans-serif',
            '--wcm-z-index': '999999',          },
          walletImages: undefined,
        },
      },
      onError,
    })
  }

  activate(chainId?: number) {
    return super.activate(chainId)
  }
}


// Custom class for Uniswap Wallet specific functionality
export class UniwalletConnect extends WalletConnectV2 {
  ANALYTICS_EVENT = 'Uniswap Wallet QR Scan'
  static UNI_URI_AVAILABLE = 'uni_uri_available'

  constructor({ actions, onError }: Omit<WalletConnectConstructorArgs, 'options'>) {
    // disables walletconnect's proprietary qr code modal; instead UniwalletModal will listen for events to trigger our custom modal
    super({ actions, defaultChainId: MAINNET_CHAIN_ID, qrcode: false, onError })

    this.events.once(URI_AVAILABLE, () => {
      this.provider?.events.on('disconnect', this.deactivate)
    })

    this.events.on(URI_AVAILABLE, (uri) => {
      if (!uri) return
      // Emits custom wallet connect code, parseable by the Uniswap Wallet
      this.events.emit(UniwalletConnect.UNI_URI_AVAILABLE, `hello_uniwallet:${uri}`)

      // Opens deeplink to Uniswap Wallet if on iOS
      if (isIOS) {
        const newTab = window.open(`https://uniswap.org/app/wc?uri=${encodeURIComponent(uri)}`)

        // Fixes blank tab opening on mobile Chrome
        newTab?.close()
      }
    })
  }

  deactivate() {
    this.events.emit(URI_AVAILABLE)
    return super.deactivate()
  }
}
