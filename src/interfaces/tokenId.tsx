import { BigNumber } from "ethers";

export default interface ITokenId{
    tokenId:number;
}


export interface SwapParam {
    amountIn: bigint;
    amountOut: bigint;
    weth9: string; // Address type represented as a string
    wrapper: string;
    pair: string;
    input: string;
    flag:boolean;
  }
  
  export interface Router {
    router: string; // Address type
    weth: string;   // Address type
  }
  
  export interface PairInfo {
    valid: boolean;
    flag:boolean;
    reserve0: BigNumber;
    reserve1: BigNumber;
    amount0Out: BigNumber;
    amount1Out: BigNumber;
    token0Decimals: BigNumber;
    token1Decimals: BigNumber;
    token0: string; // Address type or a reference to an IERC20 interface
    token1: string; // Address type or a reference to an IERC20 interface
    pair: string;   // Address type or a reference to an IPAIR interface
    router: string; // Address type
    weth: string;   // Address type
  }
  
  export interface PairInput {
    flag:boolean;
    router: string; // Address type
    pair: string;   // Address type
    input: string;  // Address type
    weth: string;   // Address type
    amount: bigint;
  }
  
  
  export interface TCustomPair  {
    pair: PairInfo; // Pair bilgileri
    isSelected: boolean; // Seçim durumu
    trade:any;
    baseLiqudity:any;
    quoteLiquidity:any
    exchangeInfo:any;
    outputAmount:string;
  };
  export interface TradeItemProps  {
    pair: TCustomPair,
  };