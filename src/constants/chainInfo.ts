import { ChainId } from './chains'
import bnbCircleLogoUrl from '../assets/images/bnbCircle.svg'
import ethereumLogoUrl from '../assets/images/ethereum-logo.png'
import polygonCircleLogoUrl from '../assets/images/polygonCircle.png'
import { default as arbitrumCircleLogoUrl, default as arbitrumLogoUrl } from '../assets/svg/arbitrum_logo.svg'
import avaxLogo from '../assets/svg/avax_logo.svg'
import avaxSquareLogo from '../assets/svg/avax_square_logo.svg'
import bnbSquareLogoUrl from '../assets/svg/bnb_square_logo.svg'
import bnbLogo from '../assets/svg/bnb-logo.svg'
import celoLogo from '../assets/svg/celo_logo.svg'
import celoSquareLogoUrl from '../assets/svg/celo_square_logo.svg'
import optimismSquareLogoUrl from '../assets/svg/optimism_square_logo.svg'
import optimismLogoUrl from '../assets/svg/optimistic_ethereum.svg'
import polygonSquareLogoUrl from '../assets/svg/polygon_square_logo.svg'
import polygonMaticLogo from '../assets/svg/polygon-matic-logo.svg'
import bitciLogoURL from '../assets/svg/bitci.svg'
import chilizLogoURL from '../assets/svg/chz.svg'


import { SupportedL1ChainId, SupportedL2ChainId } from './chains'

export const AVERAGE_L1_BLOCK_TIME = `12s`

export enum NetworkType {
  L1,
  L2,
}
interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly circleLogoUrl?: string
  readonly squareLogoUrl?: string
  readonly label: string
  readonly helpCenterUrl?: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
  readonly color?: string
  readonly backgroundColor?: string
}

interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
  readonly defaultListUrl?: string
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
  readonly defaultListUrl: string
}

type ChainInfoMap = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo
} & { readonly [chainId in SupportedL1ChainId]: L1ChainInfo }

const CHAIN_INFO: ChainInfoMap = {
  [ChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [ChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Görli',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
  },
  [ChainId.SEPOLIA]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://sepolia.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Sepolia',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SepoliaETH', decimals: 18 },
  },
  [ChainId.OPTIMISM]: {
    networkType: NetworkType.L2,
    bridge: 'https://app.optimism.io/bridge',
    defaultListUrl: [],
    docs: 'https://optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism/',
    label: 'Optimism',
    logoUrl: optimismLogoUrl,
    // Optimism perfers same icon for both
    circleLogoUrl: optimismLogoUrl,
    squareLogoUrl: optimismSquareLogoUrl,
    statusPage: 'https://optimism.io/status',
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [ChainId.OPTIMISM_GOERLI]: {
    networkType: NetworkType.L2,
    bridge: 'https://app.optimism.io/bridge',
    defaultListUrl: [],
    docs: 'https://optimism.io/',
    explorer: 'https://goerli-optimism.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism/',
    label: 'Optimism Görli',
    logoUrl: optimismLogoUrl,
    statusPage: 'https://optimism.io/status',
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ',
    nativeCurrency: { name: 'Optimism Goerli Ether', symbol: 'görOpETH', decimals: 18 },
  },
  [ChainId.ARBITRUM_ONE]: {
    networkType: NetworkType.L2,
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://arbiscan.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum',
    label: 'Arbitrum',
    logoUrl: arbitrumLogoUrl,
    circleLogoUrl: arbitrumCircleLogoUrl,
    defaultListUrl: ["https://raw.githubusercontent.com/imonai/nfts/main/arbitrum/index.json"],
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [ChainId.ARBITRUM_GOERLI]: {
    networkType: NetworkType.L2,
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://goerli.arbiscan.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum/',
    label: 'Arbitrum Goerli',
    logoUrl: arbitrumLogoUrl,
    defaultListUrl: [], // TODO: use arbitrum goerli token list
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum',
    nativeCurrency: { name: 'Goerli Arbitrum Ether', symbol: 'goerliArbETH', decimals: 18 },
  },
  [ChainId.POLYGON]: {
    networkType: NetworkType.L1,
    bridge: 'https://wallet.polygon.technology/polygon/bridge',
    docs: 'https://polygon.io/',
    explorer: 'https://polygonscan.com/',
    infoLink: 'https://info.uniswap.org/#/polygon/',
    label: 'Polygon Mainnet',
    logoUrl: polygonMaticLogo,
    circleLogoUrl: polygonCircleLogoUrl,
    squareLogoUrl: polygonSquareLogoUrl,
    nativeCurrency: { name: 'Polygon Matic', symbol: 'MATIC', decimals: 18 },
  },
  [ChainId.POLYGON_MUMBAI]: {
    networkType: NetworkType.L1,
    bridge: 'https://wallet.polygon.technology/bridge',
    docs: 'https://polygon.io/',
    explorer: 'https://mumbai.polygonscan.com/',
    infoLink: 'https://info.uniswap.org/#/polygon/',
    label: 'Polygon Mumbai',
    logoUrl: polygonMaticLogo,
    nativeCurrency: { name: 'Polygon Mumbai Matic', symbol: 'mMATIC', decimals: 18 },
  },
  [ChainId.CELO]: {
    networkType: NetworkType.L1,
    bridge: 'https://www.portalbridge.com/#/transfer',
    docs: 'https://docs.celo.org/',
    explorer: 'https://celoscan.io/',
    infoLink: 'https://info.uniswap.org/#/celo/',
    label: 'Celo',
    logoUrl: celoLogo,
    circleLogoUrl: celoLogo,
    squareLogoUrl: celoSquareLogoUrl,
    nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
    defaultListUrl: [],
  },
  [ChainId.CELO_ALFAJORES]: {
    networkType: NetworkType.L1,
    bridge: 'https://www.portalbridge.com/#/transfer',
    docs: 'https://docs.celo.org/',
    explorer: 'https://alfajores-blockscout.celo-testnet.org/',
    infoLink: 'https://info.uniswap.org/#/celo/',
    label: 'Celo Alfajores',
    logoUrl: celoLogo,
    nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
    defaultListUrl: [],
  },
  [ChainId.BNB]: {
    networkType: NetworkType.L1,
    bridge: 'https://cbridge.celer.network/1/56',
    docs: 'https://docs.bnbchain.org/',
    explorer: 'https://bscscan.com/',
    infoLink: 'https://info.uniswap.org/#/bnb/',
    label: 'BNB Chain',
    logoUrl: bnbLogo,
    circleLogoUrl: bnbCircleLogoUrl,
    squareLogoUrl: bnbSquareLogoUrl,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    defaultListUrl: [],
  },
  [ChainId.AVALANCHE]: {
    networkType: NetworkType.L1,
    bridge: 'https://core.app/bridge/',
    docs: 'https://docs.avax.network/',
    explorer: 'https://snowtrace.io/',
    infoLink: 'https://info.uniswap.org/#/avax/', // TODO(WEB-2336): Add avax support to info site
    label: 'Avalanche',
    logoUrl: avaxLogo,
    circleLogoUrl: avaxLogo,
    squareLogoUrl: avaxSquareLogo,
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    defaultListUrl: [],
  },
  [ChainId.BITCI]: {
    networkType: NetworkType.L1,
    bridge: '',
    docs: 'https://bitcichain.com',
    explorer: 'https://bitciexplorer.com',
    infoLink: 'https://info.uniswap.org/#/avax/',
    label: 'BITCI Chain',
    logoUrl: bitciLogoURL,
    circleLogoUrl: bitciLogoURL,
    squareLogoUrl: bitciLogoURL,
    nativeCurrency: { name: 'BITCI', symbol: 'BITCI', decimals: 18 },
    defaultListUrl: ["https://raw.githubusercontent.com/imonai/nfts/main/bitci/index.json"],
  },
  [ChainId.BITCI_TEST]: {
    networkType: NetworkType.L1,
    bridge: '',
    docs: 'https://bitcichain.com',
    explorer: 'https://testnet.bitciexplorer.com',
    infoLink: 'https://info.uniswap.org/#/avax/',
    label: 'BITCI Chain',
    logoUrl: bitciLogoURL,
    circleLogoUrl: bitciLogoURL,
    squareLogoUrl: bitciLogoURL,
    nativeCurrency: { name: 'BITCI', symbol: 'BITCI', decimals: 18 },
    defaultListUrl: ["https://raw.githubusercontent.com/imonai/nfts/main/bitci/index.json"],
  },
  [ChainId.CHILIZ_MAINNET]: {
    networkType: NetworkType.L1,
    bridge: '',
    docs: 'https://chiliscan.com',
    explorer: 'https://chiliscan.com',
    infoLink: 'https://info.imon.ai/#/chiliz/',
    label: 'Chiliz',
    logoUrl: chilizLogoURL,
    circleLogoUrl: chilizLogoURL,
    squareLogoUrl: chilizLogoURL,
    nativeCurrency: { name: 'CHILIZ', symbol: 'CHZ', decimals: 18 },
    defaultListUrl: ["https://raw.githubusercontent.com/imonai/nfts/main/chiliz/index.json"],
  },
  [ChainId.CHILIZ_SPICY_TESTNET]: {
    networkType: NetworkType.L1,
    bridge: '',
    docs: 'https://docs.chiliz.com',
    explorer: 'https://testnet.chiliscan.com',
    infoLink: 'https://info.imon.ai/#/spicy/',
    label: 'Chiliz Spicy Test Chain',
    logoUrl: chilizLogoURL,
    circleLogoUrl: chilizLogoURL,
    squareLogoUrl: chilizLogoURL,
    nativeCurrency: { name: 'CHILIZ', symbol: 'CHZ', decimals: 18 },
    defaultListUrl: ["https://raw.githubusercontent.com/imonai/nfts/main/spicy/index.json"],
  },
} as const

export function getChainInfo(chainId: SupportedL1ChainId): L1ChainInfo
export function getChainInfo(chainId: SupportedL2ChainId): L2ChainInfo
export function getChainInfo(chainId: ChainId): L1ChainInfo | L2ChainInfo
export function getChainInfo(
  chainId: ChainId | SupportedL1ChainId | SupportedL2ChainId | number | undefined
): L1ChainInfo | L2ChainInfo | undefined

/**
 * Overloaded method for returning ChainInfo given a chainID
 * Return type varies depending on input type:
 * number | undefined -> returns chaininfo | undefined
 * ChainId -> returns L1ChainInfo | L2ChainInfo
 * SupportedL1ChainId -> returns L1ChainInfo
 * SupportedL2ChainId -> returns L2ChainInfo
 */
export function getChainInfo(chainId: any): any {
  if (chainId) {
    return CHAIN_INFO[chainId] ?? undefined
  }
  return undefined
}

export const MAINNET_INFO = CHAIN_INFO[ChainId.CHILIZ_MAINNET]
export function getChainInfoOrDefault(chainId: number | undefined) {
  return getChainInfo(chainId) ?? MAINNET_INFO
}
