export interface Token {
    chainId: number,
    address: string,
    decimals: number,
    symbol?: string,
    logoURI?:string,
    name?: string,
    pair?:string,
  }
  
  export interface TokenSelectState {
    [tokenId: string]: boolean;
  }