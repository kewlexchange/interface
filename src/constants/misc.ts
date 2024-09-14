
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
        dex:"KEWL",
        router:"0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
        weth:"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
    },
    {
        dex:"KAYEN",
        router:"0xE2918AA38088878546c1A18F2F9b1BC83297fdD3",
        weth:"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
    },
    {
        dex:"CHILIZSWAP",
        router:"0xcF4A2be8Fe92fEe8e350AD8D876274749Ae0CBb1",
        weth:"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
    },
    {
        dex:"DIVISWAP",
        router:"0xbdd9c322ecf401e09c9d2dca3be46a7e45d48bb1",
        weth:"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
    },
    {
        dex:"KEWLv1",
        router:"0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
        weth:"0x721EF6871f1c4Efe730Dce047D40D1743B886946"
    }
]


export const LP_BURNED_ASSETS = [
    "0x75D28E4c65aCD2EB6efCB0D200869E89C2c1ef1f"
]

export const isLPAddressBurned = (address) => {
    return LP_BURNED_ASSETS.includes(address);
}