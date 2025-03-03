export enum ChainId {
  MAINNET = 1,
  SEPOLIA = 11155111,
  // ROPSTEN = 3,
  // RINKEBY = 4,
  GOERLI = 5,
  // KOVAN = 42,
  //
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,

  //
  OPTIMISM = 10,
  OPTIMISM_GOERLI = 420,
  //
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  //
  CELO = 42220,
  CELO_ALFAJORES = 44787,
  //
  BNB = 56,
  BSC_TEST = 97,

  BITCI = 1907,
  BITCI_TEST = 1908,

  AVALANCHE = 43114,
  AVAX_FUJI = 43113,

  CHILIZ_MAINNET = 88888,
  CHILIZ_SPICY_TESTNET = 88882,
  ABSTRACT_TESTNET = 11124,

  SONIC_MAINNET = 146
}

export const DEFAULT_CHAIN_ASSETS_URL = "https://raw.githubusercontent.com/kewlexchange/nfts/main/chiliz/index.json"
export const DEFAULT_CHAIN_NFT_URL = "https://raw.githubusercontent.com/kewlexchange/nfts/main/chiliz/nfts.json"
export const DEFAULT_BITCI_CHAIN_NFT_URL = "https://raw.githubusercontent.com/kewlexchange/nfts/main/bitci/nfts.json"

export declare const SUPPORTED_CHAINS: readonly [ChainId.CHILIZ_MAINNET,ChainId.CHILIZ_SPICY_TESTNET, ChainId.BITCI,ChainId.BITCI_TEST];
export declare type SupportedChainsType = typeof SUPPORTED_CHAINS[number];
export const UniWalletSupportedChains = [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.OPTIMISM, ChainId.POLYGON]

export const BLOCKCHAINS = {
  BITCI:
      {
        MAIN: {
          enabled:true,
          chainId: '0x773',
          chainName: 'BITCI Main Network',
          nativeCurrency: {
            name: 'BITCI',
            symbol: 'BITCI',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.bitci.com'],
          blockExplorerUrls: ['https://bitciexplorer.com']
        },
        TEST: {
          enabled:true,
          chainId: '0x774',
          chainName: 'BITCI Test Network',
          nativeCurrency: {
            name: 'BITCI',
            symbol: 'BITCI',
            decimals: 18,
          },
          rpcUrls: ['https://testnet.bitcichain.com'],
          blockExplorerUrls: ['https://testnet.bitciexplorer.com'],
          ensAddress: "0x1C55a6e9A736C6d86d9ff1ba4700e64583c18f50"
        }
      },
  CHZ:
      {
        MAIN: {
          enabled:true,
          chainId: '0x15B38',
          chainName: 'Chiliz',
          nativeCurrency: {
            name: 'CHILIZ',
            symbol: 'CHZ',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.chiliz.com'],
          blockExplorerUrls: ['https://chiliscan.com']
        },
        TEST: {
          enabled:true,
          chainId: '0x15B32',
          chainName: 'Chiliz Spicy Testnet',
          nativeCurrency: {
            name: 'CHILIZ',
            symbol: 'CHZ',
            decimals: 18,
          },
          rpcUrls: ['https://spicy-rpc.chiliz.com'],
          blockExplorerUrls: ['https://testnet.chiliscan.com']
        }
      },
  ETH:
      {//ETHEREUM MAIN NETWORK
        MAIN: {
          enabled:true,
          chainId: '0x1',
          chainName: 'Ethereum Mainnet',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
          blockExplorerUrls: ['https://etherscan.io']
        },
        GOERLI: {
          enabled:true,
          chainId: '0x5',
          chainName: 'Goerli Testnet',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://goerli.infura.io/v3/91b04e2772b54294b8975dca24d77c4b'],
          blockExplorerUrls: ['https://goerli.etherscan.io']
        },
        SEPOLIA:{
          enabled:true,
          chainId: '0xaa36a7',
          chainName: 'Sepolia Test Network',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.sepolia.org'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        },

        KOVAN: {
          enabled:false,
          chainId: '0x2A',
          chainName: 'ETHEREUM KOVAN TEST NETWORK',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
          blockExplorerUrls: ['https://kovan.etherscan.io']
        },
        ROPSTEN: {
          enabled:false,
          chainId: '0x3',
          chainName: 'ETHEREUM ROPSTEN TEST NETWORK',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
          blockExplorerUrls: ['https://ropsten.etherscan.io']
        },
        RINKEBY: {
          enabled:false,
          chainId: '0x4',
          chainName: 'ETHEREUM RINKEBY TEST NETWORK',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
          blockExplorerUrls: ['https://rinkeby.etherscan.io']
        }
      },
  BSC:
      {//BINANCE SMART CHAIN MAIN NETWORK
        MAIN: {
          enabled:true,
          chainId: '0x38',
          chainName: 'Binance Smart Chain',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com']
        },
        TEST: {
          enabled:false,
          chainId: '0x61',
          chainName: 'BINANCE SMART CHAIN TESTNET',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: ['https://data-seed-prebsc-1-s3.binance.org:8545'],
          blockExplorerUrls: ['https://testnet.bscscan.com']
        }
      },
  AVAX: {//AVAX NETWORK
    MAIN: {
      enabled:true,
      chainId: '0xA86A',
      chainName: 'Avalanche Mainnet',
      nativeCurrency: {
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18,
      },
      rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://snowtrace.io']
    },
    FUJI:{
      enabled:false,
      chainId: '0xa869',
      chainName: 'Avalanche FUJI Test Network',
      nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18,
      },
      rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://cchain.explorer.avax-test.network/']
    }
  },
  MATIC:{
    MAIN: {
      enabled:true,
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        decimals: 18,
        symbol: 'MATIC'
      },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    },
    MUMBAI: {
      enabled:false,
      chainId: '0x13881',
      chainName: 'Polygon/Matic Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        decimals: 18,
        symbol: 'MATIC'
      },
      rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
      blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    }
  },
  SONIC:{
    MAIN: {
      enabled:true,
      chainId: '0x92',
      chainName: 'SONIC',
      nativeCurrency: {
        name: 'S',
        decimals: 18,
        symbol: 'S'
      },
      rpcUrls: ['https://rpc.soniclabs.com'],
      blockExplorerUrls: ['https://sonicscan.org'],
    },
    TEST: {
      chainId: '0xfa2',
      chainName: 'Fantom Testnet',
      nativeCurrency: {
        name: 'FTM',
        decimals: 18,
        symbol: 'FTM'
      },
      rpcUrls: ['https://rpc.testnet.fantom.network'],
      blockExplorerUrls: ['https://testnet.ftmscan.com'],
    }
  },
  FTM:{
    MAIN: {
      enabled:true,
      chainId: '0xFA',
      chainName: 'Fantom',
      nativeCurrency: {
        name: 'FTM',
        decimals: 18,
        symbol: 'FTM'
      },
      rpcUrls: ['https://rpc.ftm.tools'],
      blockExplorerUrls: ['https://ftmscan.com'],
    },
    TEST: {
      chainId: '0xfa2',
      chainName: 'Fantom Testnet',
      nativeCurrency: {
        name: 'FTM',
        decimals: 18,
        symbol: 'FTM'
      },
      rpcUrls: ['https://rpc.testnet.fantom.network'],
      blockExplorerUrls: ['https://testnet.ftmscan.com'],
    }
  },
  KCC:{
    MAIN: {
      enabled:true,
      chainId: '0x141',
      chainName: 'KCC Mainnet',
      nativeCurrency: {
        name: 'KCS',
        decimals: 18,
        symbol: 'KCS'
      },
      rpcUrls: ['https://rpc-mainnet.kcc.network'],
      blockExplorerUrls: ['https://explorer.kcc.io/en'],
    }
  },
  ARB:{//ARBITRUM CHAIN
    MAIN: {
      enabled:true,
      chainId: '0xA4B1',
      chainName: 'Arbitrum Mainnet',
      nativeCurrency: {
        name: 'ETH',
        decimals: 18,
        symbol: 'ETH'
      },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io'],
    },
    TEST: {
      enabled:true,
      chainId: '0x66eeb',
      chainName: 'Arbitrum Goerli',
      nativeCurrency: {
        name: 'ETH',
        decimals: 18,
        symbol: 'ETH'
      },
      rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://testnet.arbiscan.io'],
    }
  },
  GNOSIS:
      {//XDAI CHAIN
        MAIN: {
          enabled:true,
          chainId: '0x64',
          chainName: 'GNOSIS Chain',
          nativeCurrency: {
            name: 'xDAI',
            decimals: 18,
            symbol: 'xDAI'
          },
          rpcUrls: ['https://rpc.gnosischain.com'],
          blockExplorerUrls: ['https://gnosisscan.io'],
        }
      },
  OE:
      {//OPTIMISM
        MAIN: {
          enabled:true,
          chainId: '0xA',
          chainName: 'Optimism',
          nativeCurrency: {
            name: 'ETH',
            decimals: 18,
            symbol: 'ETH'
          },
          rpcUrls: ['https://mainnet.optimism.io'],
          blockExplorerUrls: ['https://optimistic.etherscan.io'],
        },
        KOVAN: {
          enabled:false,
          chainId: '0x45',
          chainName: 'Optimism Kovan (testnet)',
          nativeCurrency: {
            name: 'ETH',
            decimals: 18,
            symbol: 'ETH'
          },
          rpcUrls: ['https://kovan.optimism.io'],
          blockExplorerUrls: ['https://kovan-optimistic.etherscan.io'],
        }
      },
  ETC:
      {//ETH CLASSIC
        MAIN: {
          enabled:false,
          chainId: '0x3D',
          chainName: 'ETHEREUM CLASSIC',
          nativeCurrency: {
            name: 'ETC',
            decimals: 18,
            symbol: 'ETC'
          },
          rpcUrls: ['https://www.ethercluster.com/etc'],
          blockExplorerUrls: ['https://blockscout.com/etc/mainnet/'],
        }
      },
  AURORA:
      {//ETH CLASSIC
        MAIN: {
          enabled:true,
          chainId: '0x4e454152',
          chainName: 'Aurora',
          nativeCurrency: {
            name: 'ETH',
            decimals: 18,
            symbol: 'ETH'
          },
          rpcUrls: ['https://mainnet.aurora.dev'],
          blockExplorerUrls: ['https://aurorascan.dev'],
        }
      },

  TOMO:
      {
        MAIN: {
          enabled:true,
          chainId: '0x58',
          chainName: 'Tomo Chain',
          nativeCurrency: {
            name: 'TOMO',
            decimals: 18,
            symbol: 'TOMO'
          },
          rpcUrls: ['https://rpc.tomochain.com'],
          blockExplorerUrls: ['https://tomoscan.io'],
        }
      },
  CELO:
      {
        MAIN: {
          enabled:true,
          chainId: '0xA4EC',
          chainName: 'Celo Mainnet',
          nativeCurrency: {
            name: 'CELO',
            decimals: 18,
            symbol: 'CELO'
          },
          rpcUrls: ['https://forno.celo.org'],
          blockExplorerUrls: ['https://celoscan.io'],
        }
      },
  HECO:
      {
        MAIN: {
          enabled:true,
          chainId: '0x80',
          chainName: 'Huobi ECO Chain Mainnet',
          nativeCurrency: {
            name: 'HT',
            decimals: 18,
            symbol: 'HT'
          },
          rpcUrls: ['https://http-mainnet.hecochain.com'],
          blockExplorerUrls: ['https://hecoinfo.com'],
        }
      },
  GLMR:
      {
        MAIN: {
          enabled:true,
          chainId: '0x504',
          chainName: 'Moonbeam',
          nativeCurrency: {
            name: 'GLMR',
            decimals: 18,
            symbol: 'GLMR'
          },
          rpcUrls: ['https://rpc.api.moonbeam.network'],
          blockExplorerUrls: ['https://moonbeam.moonscan.io'],
        }
      },
  KLAY:
      {
        MAIN: {
          enabled:true,
          chainId: '0x2019',
          chainName: 'Klaytn Chain',
          nativeCurrency: {
            name: 'KLAY',
            decimals: 18,
            symbol: 'KLAY'
          },
          rpcUrls: ['https://public-node-api.klaytnapi.com/v1/cypress'],
          blockExplorerUrls: ['https://scope.klaytn.com'],
        }
      },

      ABS:
      {MAIN: {
        enabled:true,
        chainId: '0xab5',
        chainName: 'Abstract Mainnet',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://api.testnet.abs.xyz'],
        blockExplorerUrls: ['https://explorer.testnet.abs.xyz']
      },
        TEST: {
          enabled:true,
          chainId: '0x2b74',
          chainName: 'Abstract Testnet',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://api.testnet.abs.xyz'],
          blockExplorerUrls: ['https://explorer.testnet.abs.xyz']
        }
      },

}
export const DEFAULT_CHAIN_INFO = BLOCKCHAINS.CHZ.MAIN;

export const CHAIN_IDS_TO_NAMES = {
  [ChainId.MAINNET]: 'mainnet',
  [ChainId.GOERLI]: 'goerli',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.POLYGON_MUMBAI]: 'polygon_mumbai',
  [ChainId.CELO]: 'celo',
  [ChainId.CELO_ALFAJORES]: 'celo_alfajores',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.ARBITRUM_GOERLI]: 'arbitrum_goerli',
  [ChainId.OPTIMISM]: 'optimism',
  [ChainId.OPTIMISM_GOERLI]: 'optimism_goerli',
  [ChainId.BNB]: 'bnb',
  [ChainId.AVALANCHE]: 'avalanche',
  [ChainId.BITCI]: 'bitci',
  [ChainId.BITCI_TEST]: 'bitcitest',
  [ChainId.CHILIZ_MAINNET]: 'chiliz',
  [ChainId.CHILIZ_SPICY_TESTNET]: 'chiliztest',
  [ChainId.ABSTRACT_TESTNET]: 'abstestnet',
  [ChainId.SONIC_MAINNET]: 'sonic'

} as const

export function isSupportedChain(chainId: number | null | undefined | ChainId): chainId is SupportedChainsType {
  return !!chainId && ChainId.BITCI === chainId || ChainId.BITCI_TEST === chainId || ChainId.ARBITRUM_ONE === chainId  || ChainId.CHILIZ_MAINNET === chainId || ChainId.CHILIZ_SPICY_TESTNET === chainId  || ChainId.ABSTRACT_TESTNET === chainId || ChainId.AVALANCHE === chainId || ChainId.SONIC_MAINNET === chainId
}

export function asSupportedChain(chainId: number | null | undefined | ChainId): SupportedChainsType | undefined {
  return isSupportedChain(chainId) ? chainId : undefined
}

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.POLYGON,
  ChainId.CELO,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM_ONE,
  ChainId.BNB,
  ChainId.AVALANCHE,
  ChainId.CHILIZ_MAINNET,
  ChainId.ABSTRACT_TESTNET,
  ChainId.SONIC_MAINNET
] as const

/**
 * Unsupported networks for V2 pool behavior.
 */
export const UNSUPPORTED_V2POOL_CHAIN_IDS = [
  ChainId.POLYGON,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM_ONE,
  ChainId.BNB,
  ChainId.ARBITRUM_GOERLI,
  ChainId.AVALANCHE,

] as const

export const TESTNET_CHAIN_IDS = [
  ChainId.GOERLI,
  ChainId.SEPOLIA,
  ChainId.POLYGON_MUMBAI,
  ChainId.ARBITRUM_GOERLI,
  ChainId.OPTIMISM_GOERLI,
  ChainId.CELO_ALFAJORES,
  ChainId.BITCI_TEST,
  ChainId.CHILIZ_SPICY_TESTNET
] as const

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.GOERLI,
  ChainId.SEPOLIA,
  ChainId.POLYGON,
  ChainId.POLYGON_MUMBAI,
  ChainId.CELO,
  ChainId.CELO_ALFAJORES,
  ChainId.BNB,
  ChainId.AVALANCHE,
  ChainId.BITCI,
  ChainId.BITCI_TEST,
  ChainId.CHILIZ_MAINNET,
  ChainId.ABSTRACT_TESTNET,
  ChainId.SONIC_MAINNET
] as const

export type SupportedL1ChainId = (typeof L1_CHAIN_IDS)[number]

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
  ChainId.ARBITRUM_GOERLI,
  ChainId.OPTIMISM,
  ChainId.OPTIMISM_GOERLI,
  ChainId.ABSTRACT_TESTNET
] as const

export type SupportedL2ChainId = (typeof L2_CHAIN_IDS)[number]

export function isPolygonChain(chainId: number): chainId is ChainId.POLYGON | ChainId.POLYGON_MUMBAI {
  return chainId === ChainId.POLYGON || chainId === ChainId.POLYGON_MUMBAI
}
