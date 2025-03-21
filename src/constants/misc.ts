
import JSBI from 'jsbi'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ETHER_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const WCHZ_COMMUNITY_ADDRESS = '0x721EF6871f1c4Efe730Dce047D40D1743B886946'
export const DEFAULT_TOKEN_LOGO = "https://www.kewl.exchange/images/coins/skull.svg"
// TODO(WEB-1984): Convert the deadline to minutes and remove unecessary conversions from
// seconds to minutes in the codebase.
// 30 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 30
export const L2_DEADLINE_FROM_NOW = 60 * 5
export const INITIAL_ALLOWED_SLIPPAGE = 50

// transaction popup dismisal amounts
export const DEFAULT_TXN_DISMISS_MS = 10000
export const L2_TXN_DISMISS_MS = 5000

// exports for external consumption
export type BigintIsh = JSBI | string | number

export enum TradeType {
    EXACT_INPUT,
    EXACT_OUTPUT
}

export enum Rounding {
    ROUND_DOWN,
    ROUND_HALF_UP,
    ROUND_UP
}

export enum RoundingMode {
    /**
     * Rounds towards zero.
     * I.e. truncate, no rounding.
     */
    RoundDown = 0,
    /**
     * Rounds towards nearest neighbour.
     * If equidistant, rounds away from zero.
     */
    RoundHalfUp = 1,
    /**
     * Rounds towards nearest neighbour.
     * If equidistant, rounds towards even neighbour.
     */
    RoundHalfEven = 2,
    /**
     * Rounds away from zero.
     */
    RoundUp = 3,
}

export const MaxUint256 = JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const FIVE = JSBI.BigInt(5)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)

export const BIPS_BASE = JSBI.BigInt(10000)

export const FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

export const INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'

export const SWAP_FEE_ON = true



export const DECENTRALIZED_EXCHANGES = [
    {
        logo:"/images/dex/kewl.svg",
        chainId:88888,
        dex:"KEWL",
        router:"0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
        weth:"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
        flag:false
    },
    {
        logo:"/images/dex/kayen.png",
        chainId:88888,
        dex:"KAYEN",
        router:"0xE2918AA38088878546c1A18F2F9b1BC83297fdD3",
        weth:"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
        flag:false
    },
    {
        logo:"/images/dex/chilizswap.svg",
        chainId:88888,
        dex:"CHILIZSWAP",
        router:"0xcF4A2be8Fe92fEe8e350AD8D876274749Ae0CBb1",
        weth:"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
        flag:false
    },
    {
        logo:"/images/dex/dswap.png",
        chainId:88888,
        dex:"DIVISWAP",
        router:"0xbdd9c322ecf401e09c9d2dca3be46a7e45d48bb1",
        weth:"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
        flag:false
    },
    {
        logo:"/images/dex/kewl.svg",
        chainId:88888,
        dex:"KEWLv1",
        router:"0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
        weth:"0x721EF6871f1c4Efe730Dce047D40D1743B886946",
        flag:false
    },

    

    {
        logo:"/images/dex/kewl.svg",
        chainId:43114,
        dex:"KEWL",
        router:"0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
        weth:"0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        flag:false
    },
    {
        logo:"/images/dex/traderjoe.svg",
        chainId:43114,
        dex:"TRADERJOE",
        router:"0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
        weth:"0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        flag:false
    },
    {
        logo:"/images/dex/pangolin.svg",
        chainId:43114,
        dex:"PANGOLIN",
        router:"0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
        weth:"0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        flag:false
    },
    {
        logo:"/images/dex/uniswap.svg",
        chainId:43114,
        dex:"UNISWAP",
        router:"0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C",
        weth:"0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        flag:false
    }
    ,
    {
        logo:"/images/dex/sushi.svg",
        chainId:43114,
        dex:"SUSHI",
        router:"0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
        weth:"0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        flag:false
    },

    {
        logo:"/images/dex/kewl.svg",
        chainId:146,
        dex:"KEWL",
        router:"0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:false
    },
     
    {
        logo:"/images/dex/shadow.svg",
        chainId:146,
        dex:"SHADOW",
        router:"0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:true
    },
    {
        logo:"/images/dex/sonic-market.svg",
        chainId:146,
        dex:"SonicMarket",
        router:"0x01D6747dD2d65dDD90FAEC2C84727c2706ee28E2",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:false
    }
    ,
 

    {
        logo:"/images/dex/equalizer.svg",
        chainId:146,
        dex:"Equalizer",
        router:"0xDDD9845Ba0D8f38d3045f804f67A1a8B9A528FcC",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:true
    },
    {
        logo:"/images/dex/metropolis.svg",
        chainId:146,
        dex:"Metropolis",
        router:"0x1570300e9cFEC66c9Fb0C8bc14366C86EB170Ad0",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:false
    },

    {
        logo:"/images/dex/swapx.svg",
        chainId:146,
        dex:"SwapX",
        router:"0x05c1be79d3aC21Cc4B727eeD58C9B2fF757F5663",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:true
    },
    {
        logo:"/images/dex/sushi.svg",
        chainId:146,
        dex:"SUSHI",
        router:"0xB45e53277a7e0F1D35f2a77160e91e25507f1763",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:false
    },

    /*
    {
        logo:"/images/dex/memebox.png",
        chainId:146,
        dex:"MEMEBOX",
        router:"0x079463f811e6EB2E226908E79144CDDB59a7fB71",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:false
    },*/



    {
        logo:"/images/dex/spooky.png",
        chainId:146,
        dex:"SpookySwap",
        router:"0xEE4bC42157cf65291Ba2FE839AE127e3Cc76f741",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:false
    },

    {
        logo:"/images/dex/ninemm.png",
        chainId:146,
        dex:"9MM",
        router:"0x0f7B3FcBa276A65dd6E41E400055dcb75BA66750",
        weth:"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
        flag:false
    },
    
    
    

    

    
    
    
]


export const LP_BURNED_ASSETS = [
    "0x75D28E4c65aCD2EB6efCB0D200869E89C2c1ef1f"
]

export const isLPAddressBurned = (address : any) => {
    return LP_BURNED_ASSETS.includes(address);
}