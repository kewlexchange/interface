
import { DECENTRALIZED_EXCHANGES, MINIMUM_LIQUIDITY, TradeType } from "@/constants/misc";
import { CurrencyAmount, Pair, Route, Token, Trade } from "@/entities";
import { Router } from "@/interfaces/tokenId";
import { parseEther } from "@ethersproject/units";
import { ethers } from "ethers";
import JSBI from "jsbi";
import { ALL_TRADING_PAIRS } from "./TradingPairs";

class Core {
  private exchange: any;
  private chainId: number;
  private pair_addresses: string[] = [];
  private pairs: any[] = [];
  private startToken: string;
  private endToken: string;
  private routes: any[] = [];
  private opportunities: any[] = [];
  private signer: any;
  private depositAmount: any
  private maxPairs: any

  constructor(chainId: number, signer: any, startToken: string, endToken: string, deposit: string, maxPairs : number) {
    this.chainId = chainId;
    this.startToken = startToken.toLowerCase();
    this.endToken = endToken.toLowerCase();
    this.signer = signer;
    this.depositAmount = deposit
    this.maxPairs = maxPairs
  }

  // Initialize the exchange contract
  public async initializeExchange(exchange:any) {
    try {
      this.exchange = exchange
      console.log("Exchange contract initialized:", this.exchange.address);
    } catch (error) {
      console.error("Error initializing Exchange contract:", error);
    }
  }

  // Fetch routers by chain ID
  public getRoutersByChainId(): Router[] {
    return DECENTRALIZED_EXCHANGES.filter((exchange: any) => exchange.chainId === this.chainId).map((exchange) => ({
      router: exchange.router,
      weth: exchange.weth,
    }));
  }

  // Fetch trading pairs
  public async fetchPairs(): Promise<void> {
    let tokenFilter = ["WCHZ", "KWL", "PEPPER", "DSWAP","TBT", "CHZINU", "USDT", "USDC","FAFO","ANGRY","CHSQUAD"];
    const filteredPairs = ALL_TRADING_PAIRS.filter(pair =>
      tokenFilter.includes(pair.baseSymbol.toUpperCase()) &&
      tokenFilter.includes(pair.quoteSymbol.toUpperCase()) &&
      pair.chainId === this.chainId
    );

    this.pair_addresses = filteredPairs.map(pair => pair.pairAddress);
    try {
      let _pairs = await this.exchange.getReservesByPairAddresses(this.pair_addresses);


      const transformedPairs = _pairs
        .filter((pair: any) => {
          // `reserve0` ve `reserve1`'in ikisinin de MINIMUM_LIQUIDITY'ye büyük olup olmadığını kontrol et
          return pair.reserve0.gt(MINIMUM_LIQUIDITY) && pair.reserve1.gt(MINIMUM_LIQUIDITY);
        })

        .map((pair: any) => {
          return {
            reserve0: pair.reserve0,               // BigNumber'dan string'e dönüştürme
            reserve1: pair.reserve1,               // BigNumber'dan string'e dönüştürme
            token0Decimals: pair.token0Decimals.toNumber(),   // BigNumber'dan string'e dönüştürme
            token1Decimals: pair.token1Decimals.toNumber(),   // BigNumber'dan string'e dönüştürme
            token0: pair.token0,                              // Token adresi zaten string, dönüştürmeye gerek yok
            token1: pair.token1,                              // Token adresi zaten string, dönüştürmeye gerek yok
            pair: pair.pair,                              // Token adresi zaten string, dönüştürmeye gerek yok
          };
        });
      this.pairs = transformedPairs;
    } catch (error) {
      console.error("Error fetching pairs:", error);
      this.pairs = [];
    }
  }


  private findRoutes(currentToken: string, visitedPairs: Set<string>, currentRoute: any[], side: boolean): void {
    // Limiting depth of recursion to 3 pairs
    if (currentRoute.length >= this.maxPairs) return;
  
    for (const pair of this.pairs) {
      const { token0, token1, pair: pairAddress } = pair;
  
      // Skip already visited pairs
      if (visitedPairs.has(pairAddress)) continue;
  
      let nextToken = null;
      let nextSide = side;
 
      
  
      // Determine the next token and side for the next route
      if (currentToken === token0.toLowerCase()) {
        nextToken = token1.toLowerCase();
        nextSide = true; // If token0 is the input, side is true (token0 -> token1)
      } else if (currentToken === token1.toLowerCase()) {
        nextToken = token0.toLowerCase();
        nextSide = false; // If token1 is the input, side is false (token1 -> token0)
      } else {
        continue; // If currentToken doesn't match, skip this pair
      }
  
      if (nextToken) {
        // Add the side info to the pair
        const pairWithSide = { ...pair, side: nextSide, input: currentToken };
        const newRoute = [...currentRoute, pairWithSide];
  
        // Check if the nextToken matches the start token to complete the route
        if (nextToken === this.startToken) {
          this.routes.push({ route: newRoute });
        } else {
          // Continue exploring the route
          visitedPairs.add(pairAddress);
          this.findRoutes(nextToken, visitedPairs, newRoute, nextSide);
          visitedPairs.delete(pairAddress);
        }
      }
    }
  }
  public generateArbitrageRoutes(): void {
    this.routes = [];
    const visitedPairs = new Set<string>();
    this.findRoutes(this.startToken, visitedPairs, [], true);
    console.log("Generated routes");
    this.generateTradingInfo();
  }

  public generateTradingInfo(): void {
    for (const route of this.routes) {

      const pairs: Pair[] = [];
      for (const pair of route.route) {

        const token0 = new Token(
          this.chainId, // Chain ID
          pair.token0,
          pair.token0Decimals,
          'TOKEN0',
          'Token0'
        );

        const token1 = new Token(
          this.chainId, // Chain ID
          pair.token1,
          pair.token1Decimals,
          'TOKEN1',
          'Token1'
        );

        const [tokenA, tokenB]: [Token, Token] = pair.side
          ? [token0, token1]
          : [token1, token0];
        const [reserveA, reserveB] = pair.side
          ? [pair.reserve0, pair.reserve1]
          : [pair.reserve1, pair.reserve0];


        const exchangePair = new Pair(
          CurrencyAmount.fromRawAmount(tokenA, reserveA),
          CurrencyAmount.fromRawAmount(tokenB, reserveB),
          pair.pair
        )

        pairs.push(exchangePair)

      }


      const inputOutputToken = new Token(
        this.chainId,
        this.startToken,
        18,
        'TOKEN1',
        'Token1'
      );


      const baseAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(inputOutputToken, JSBI.BigInt(ethers.utils.parseUnits(this.depositAmount, Number(18)).toString()));
  
      let _tradeInfo = new Trade(
        new Route(pairs, inputOutputToken, inputOutputToken),
        CurrencyAmount.fromRawAmount(inputOutputToken, baseAmount.quotient),
        TradeType.EXACT_INPUT
      )



      let price = parseFloat(_tradeInfo.executionPrice.toSignificant());


   
        console.log("price",_tradeInfo.outputAmount.toSignificant())

        let lpPools = [];
        for (const pair of route.route) {
          lpPools.push(
            {
              side: pair.side,
              //amountOut: 0,
              pair: pair.pair,
              input: pair.side == true ? pair.token0 : pair.token1,
              //token0: pair.token0,
              //token1: pair.token1
            }

          )
        }




        this.opportunities.push({ price: price, input: baseAmount.toSignificant(), output: _tradeInfo.outputAmount.toSignificant(), route: lpPools })
      




    }

    const sortedData = this.opportunities.sort((a, b) => parseFloat(b.output) - parseFloat(a.output));
    this.opportunities = sortedData


  }


  public Routes() : any[]  {
    return this.routes;
  }

  public Opportunities() : any[]  {
    return this.opportunities;
  }


  async analyzeOpportunities() {


    if(this.opportunities.length == 0){
      return
    }

    
    let liquidityPool = this.opportunities[0];

    console.log("FOUND POOLS",this.opportunities.length)

    let swapConfig = {
      amountIn: parseEther(this.depositAmount),
      amountOut:parseEther(this.depositAmount),
      weth9: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
      input: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
      receiver: this.signer.address
    }

    let overrides = {
      value: parseEther(this.depositAmount)
    }


    var hasException = false
    try{
      const estGas = await this.exchange.connect(this.signer).estimateGas.reflect(swapConfig, liquidityPool.route, overrides);

    }catch(e){
      console.log(e)
      hasException = true;
    }


    
    if(!hasException){
      const depositTx = await this.exchange.connect(this.signer).reflect(swapConfig, liquidityPool.route, overrides);
      await depositTx.wait();
    }

    console.log("swap", hasException ? "YES" : "NO")



  }

}

export default Core;