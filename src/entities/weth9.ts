import { Token } from './token'

/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */
export const WETH9: { [chainId: number]: Token } = {
  [1]: new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'),
  [3]: new Token(3, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'),
  [4]: new Token(4, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'),
  [5]: new Token(5, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'),
  [42]: new Token(42, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'),

  [10]: new Token(10, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
  [69]: new Token(69, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),

  [42161]: new Token(42161, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped Ether'),
  [421611]: new Token(421611, '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681', 18, 'WETH', 'Wrapped Ether'),
  [1907]: new Token(1907, '0xe0D0f25b5FCFa4d3EDD9C2186451d9E04C4B9f11', 18, 'WBITCI', 'Wrapped BITCI'),
  [1908]: new Token(1908, '0xe0D0f25b5FCFa4d3EDD9C2186451d9E04C4B9f11', 18, 'WBITCI', 'Wrapped BITCI'),
  [88888]: new Token(88888,"0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",18,"WCHZ","Wrapped Chiliz"),
  [88882]: new Token(88882,"0x721EF6871f1c4Efe730Dce047D40D1743B886946",18,"WCHZ","Wrapped Chiliz"),

  [43114]: new Token(43114,"0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",18,"WAVAX","Wrapped AVAX"),
  [146]: new Token(146,"0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",18,"WS","Wrapped SONIC"),
  
}

export const CHILIZWRAPPER: { [chainId: number]: Token } = {
  [88888]: new Token(88888,"0xAEdcF2bf41891777c5F638A098bbdE1eDBa7B264",18,"WCHZ","Chiliz Wrapper"),
  [42161]: new Token(42161,"0x9D4E136CAb069E0787260c3D6CE2829689495C69",18,"WCHZ","Arbitrum Wrapper"),
  [43114]: new Token(43114,"0x81e28dCAAC553Fce9225c266731FC450E0954e47",18,"WCHZ","AVAX Wrapper"),
  [146]: new Token(146,"0x81e28dCAAC553Fce9225c266731FC450E0954e47",18,"WCHZ","SONIC Wrapper"),

}
