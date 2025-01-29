import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { DECENTRALIZED_EXCHANGES, DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, INITIAL_ALLOWED_SLIPPAGE, MINIMUM_LIQUIDITY, TradeType } from '../../../constants/misc';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import { isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route, CHILIZWRAPPER } from '../../../entities';
import { useExchangeContract, useERC20Contract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { debounce, getNativeCurrencyByChainId, parseFloatWithDefault } from '../../../utils';
import UniwalletModal from '../../Modal/UniwalletModal';
import { Badge, Accordion, AccordionItem, Avatar, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Image, Input, ScrollShadow, Switch, Tooltip } from '@nextui-org/react';
import { formatEther, formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { ChevronsRight, ChevronUp, ChevronDown, CirclePercent, GitCompareArrows, Hand, ScanEye, ScanSearch, Wallet2 } from 'lucide-react';
import { PairInfo, Router, TCustomPair, TradeItemProps } from '../../../interfaces/tokenId';
import { useToken, useTokenContext } from '@/contexts/tokenListContext';



const _TRADE_TAB = () => {

  const { account, provider, chainId } = useWeb3React()
  const EXCHANGE = useExchangeContract(chainId, true)

  const { getTokenListByChainId } = useTokenContext();

  const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
  const { state: isShowLoading, toggle: toggleLoading } = useModal();
  const { state: isErrorShowing, toggle: toggleError } = useModal()
  const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
  const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
  const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
  const { state: isConnect, toggle: toggleConnectModal } = useModal()

  const [tokenSelector, setTokenSelector] = useState<{ showTokenSelector: boolean, side: TradeType }>({
    showTokenSelector: false,
    side: TradeType.EXACT_INPUT,
  });
  const [isBase, setIsBase] = useState(tokenSelector.side == TradeType.EXACT_INPUT)


  const [baseAsset, setBaseAsset] = useState<any>(null)
  const [quoteAsset, setQuoteAsset] = useState<any>(null)

  const { fetchTokens } = useFetchAllTokenList(chainId, account);

  const [baseInputValue, setBaseInputValue] = useState("")
  const [debouncedInputValue, setDebouncedSetInputValue] = useState("")
  const [quoteInputValue, setQuoteInputValue] = useState("")

  const ERC20Contract = useERC20Contract()

  const [allExchangePairs, setAllExchangePairs]: any = useState(null)

  const { tokens, setTokenList, setChainId ,loadTokens} = useTokenContext();

  
  const initTradeScreen = async () => {

    if (!chainId) {
      return;
    }
 
    if (!EXCHANGE) {
      return;
    }

    if (!provider) {
      return
    }

    await fetchTokens()

    setBaseAsset(null)
    setQuoteAsset(null)


    /*

    if (!baseAsset || !quoteAsset || baseAsset.chainId !== quoteAsset.chainId) {
      const kwlToken = defaultAssets.find(
        (token: any) => token && (token.symbol === "KWL" || token.symbol === "SFID")
      );
      
      if (kwlToken) {
        setQuoteAsset(kwlToken);
        setBaseAsset(defaultAssets.find((token: any) => token?.symbol === getNativeCurrencyByChainId(chainId)))
      } else {
        console.error("KWL token not found in defaultAssets.");
        setBaseAsset(null)
        setQuoteAsset(null)
      }
    }
      */

  

    const _allExchangePairs = await EXCHANGE.getAllPairs();
    setAllExchangePairs(_allExchangePairs)
  }
  useEffect(() => {
    initTradeScreen();

  }, [account, provider, chainId,EXCHANGE,loadTokens])

  

  const setInputValue = (e: any, side: TradeType) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    e = e.replace(",", ".")
    if (regex.test(e)) {
      if (side == TradeType.EXACT_INPUT) {
        setBaseInputValue(e)
        debouncedSetInputValue(e)

        //addSwapInputValue(e)
      } else {
        //setQuoteInputValue(e)
        setQuoteInputValue(e)
      }
    }

  }

  const handleSwapAssets = async () => {
    const temp = baseAsset;
    setBaseAsset(quoteAsset);
    setQuoteAsset(temp)
  }

  const onSelectToken = (tokenInfo: any) => {

    if (tokenSelector.side == TradeType.EXACT_INPUT) {
      setBaseAsset(tokenInfo)
    } else {
      setQuoteAsset(tokenInfo)
    }
    toggleSelectToken()
  }


  const handleSelectPair = (pair: any, base: any, quote: any) => {
    setBaseAsset(base);
    setQuoteAsset(quote);
    toggleSelectToken();
  }

  const setTradeInputPercent = (percent: number) => {
    // `baseBalance` nesnesinin yapısı ve türlerini kontrol ediyoruz
    let etherBalance: string = baseAsset.balance
      ? baseAsset.balance
      : "0.00";

    // `parseFloat` sonucu kesin olarak `number` türünde
    let balance: number = parseFloat(etherBalance);

    if (typeof balance !== "number" || isNaN(balance)) {
      console.error("Balance is not a valid number");
      return 0; // Hata durumunda güvenli bir değer döndürüyoruz
    }

    // Yüzde hesaplaması
    let calculatedAmount = ((balance * percent) / 100).toFixed(4);
    setInputValue(calculatedAmount, TradeType.EXACT_INPUT)
  };



  const TradeContainer = () => {
    const [tradingPairs, setTradingPairs] = useState<TCustomPair[]>([])
    const [expandedPair, setExpandedPair] = useState<number | null>(null)

    const TradeItem: React.FC<TradeItemProps> = ({ pair }) => {
      const handleSwap = async () => {

        if (!baseAsset) {
          return
        }

        if (!quoteAsset) {
          return
        }

        if (!EXCHANGE) {
          return
        }


        let WRAPPER = CHILIZWRAPPER[chainId].address
        toggleLoading();

        let DEPOSIT_AMOUNT = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals)
        let IS_NATIVE = (baseAsset.address === ETHER_ADDRESS || baseAsset.address === ethers.constants.AddressZero)
        let outputAmount = parseUnits(pair.outputAmount, quoteAsset?.decimals)

        let INPUT_TOKEN = IS_NATIVE ? pair.pair.weth : baseAsset.address;
        let swapParam = {
          amountIn: DEPOSIT_AMOUNT,
          amountOut:outputAmount,
          weth9: pair.pair.weth,
          wrapper: WRAPPER,
          pair: pair.pair.pair,
          input: INPUT_TOKEN
        }
        let overrides = {
          value: IS_NATIVE ? DEPOSIT_AMOUNT : 0
        }

        if ((!IS_NATIVE) && (swapParam.input != ethers.constants.AddressZero)) {
          const tokenContract = ERC20Contract(swapParam.input);

          const allowance = await tokenContract.allowance(account, EXCHANGE.address);
          if (allowance.lt(DEPOSIT_AMOUNT)) {
            const approveTx = await tokenContract.approve(EXCHANGE.address, ethers.constants.MaxUint256)
            await approveTx.wait();
          }

        }

        

        console.log("EXCHANGE",swapParam)

        await EXCHANGE.swap(swapParam, overrides).then(async (tx) => {
          await tx.wait();
          const summary = `Swapping : ${tx.hash}`
          setTransaction({ hash: tx.hash, summary: summary, error: null });
          toggleTransactionSuccess();
        }).catch((error: Error) => {
          setTransaction({ hash: '', summary: '', error: error });
          toggleError();
        }).finally(async () => {
          toggleLoading();
        });

        fetchTokens();


      }

      return (
        <div className="group/option relative">
          {/* Ana glow efekti */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-violet-500/5 rounded-2xl blur-sm group-hover/option:blur-md transition-all duration-300" />
          
          {/* Ana container */}
          <div className="relative rounded-2xl bg-white/50 dark:bg-black/40 backdrop-blur-2xl border border-violet-500/10 dark:border-violet-400/10 
            hover:border-violet-500/20 dark:hover:border-violet-400/20 
            transition-all duration-300 overflow-hidden">
            
            {/* Hover gradient animasyonu */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-fuchsia-500/[0.03] to-violet-500/0 
              opacity-0 group-hover/option:opacity-100
              translate-x-[-100%] group-hover/option:translate-x-[100%]
              transition-all duration-1000 ease-in-out" />

            {/* Ana içerik */}
            <div className="relative p-4">
              {/* Main content */}
              <div className="flex items-center justify-between gap-3">
                {/* Left side - Exchange info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-sm animate-pulse-slow" />
                    <Image 
                      src={pair.exchangeInfo.logo} 
                      className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-violet-500/20 p-1.5" 
                    />
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm sm:text-base font-medium text-violet-900 dark:text-violet-100 truncate">
                        {pair.exchangeInfo.dex}
                      </span>
                      <div className="px-2 py-0.5 text-xs rounded-full bg-violet-500/10 border border-violet-500/20 shrink-0">
                        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
                          {pair.trade.priceImpact.toFixed(2)}% Impact
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70 truncate">
                      1 {baseAsset?.symbol} = {pair.trade.executionPrice.toSignificant()} {quoteAsset?.symbol}
                    </div>
                  </div>
                </div>

                {/* Right side - Amount and buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-semibold text-violet-900 dark:text-violet-100">
                      {pair.outputAmount}
                    </div>
                    <div className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                      {quoteAsset?.symbol}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Buttons */}
                    <Button
                      className={[
                        "h-8 w-8 sm:h-9 sm:w-9",
                        "bg-violet-500/10",
                        "hover:bg-violet-500/20",
                        "active:scale-95",
                        "transition-all duration-200",
                        "group/btn",
                        "rounded-xl",
                        "relative overflow-hidden"
                      ].join(" ")}
                      variant="flat"
                      isIconOnly
                      onPress={() => setExpandedPair(expandedPair === pair.index ? null : pair.index)}
                    >
                      {expandedPair === pair.index ? 
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-300" /> :
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-300" />
                      }
                    </Button>

                    <Button
                      className={[
                        "h-8 w-8 sm:h-9 sm:w-9",
                        "bg-violet-500/10",
                        "hover:bg-violet-500/20",
                        "active:scale-95",
                        "transition-all duration-200",
                        "group/btn",
                        "rounded-xl",
                        "relative overflow-hidden"
                      ].join(" ")}
                      variant="flat"
                      isIconOnly
                      onPress={() => handleSwap(pair)}
                    >
                      <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-300" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded content - Mobil için optimize edilmiş */}
              {expandedPair === pair.index && (
                <div className="overflow-hidden">
                  <div className="animate-slideDown">
                    <div className="mt-3 pt-3 border-t border-violet-500/10 dark:border-violet-400/10">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Price details */}
                        <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                          <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400">
                            Price Details
                          </span>
                          <div className="space-y-2 bg-violet-500/[0.02] dark:bg-violet-400/[0.02] rounded-xl p-2.5 
                            animate-slideInFromRight" style={{ animationDelay: '0.2s' }}>
                            {/* Price Impact */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                Price Impact
                              </span>
                              <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                {pair.trade.priceImpact.toFixed(2)}%
                              </span>
                            </div>

                            {/* Base Price */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                {baseAsset?.symbol} Price
                              </span>
                              <div className="flex items-center gap-2">
                                <Image src={quoteAsset?.logoURI} className="w-4 h-4 rounded-full" alt={quoteAsset?.symbol} />
                                <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                  {pair.trade.executionPrice.toSignificant()} {quoteAsset?.symbol}
                                </span>
                              </div>
                            </div>

                            {/* Quote Price */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                {quoteAsset?.symbol} Price
                              </span>
                              <div className="flex items-center gap-2">
                                <Image src={baseAsset?.logoURI} className="w-4 h-4 rounded-full" alt={baseAsset?.symbol} />
                                <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                  {pair.trade.executionPrice.invert().toSignificant()} {baseAsset?.symbol}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Liquidity Info */}
                        <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                          <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400">
                            Pool Liquidity
                          </span>
                          <div className="space-y-2 bg-violet-500/[0.02] dark:bg-violet-400/[0.02] rounded-xl p-2.5 
                            animate-slideInFromRight" style={{ animationDelay: '0.4s' }}>
                            {/* Base Asset Liquidity */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                {baseAsset?.symbol} Liquidity
                              </span>
                              <div className="flex items-center gap-2">
                                <Image src={baseAsset?.logoURI} className="w-4 h-4 rounded-full" alt={baseAsset?.symbol} />
                                <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                  {pair.baseLiqudity} {baseAsset?.symbol}
                                </span>
                              </div>
                            </div>

                            {/* Quote Asset Liquidity */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                {quoteAsset?.symbol} Liquidity
                              </span>
                              <div className="flex items-center gap-2">
                                <Image src={quoteAsset?.logoURI} className="w-4 h-4 rounded-full" alt={quoteAsset?.symbol} />
                                <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                  {pair.quoteLiquidity} {quoteAsset?.symbol}
                                </span>
                              </div>
                            </div>

                            {/* Route Info */}
                            <div className="flex items-center gap-2 mt-3 p-2 rounded-xl bg-violet-500/5 dark:bg-violet-400/5">
                              <Image src={baseAsset?.logoURI} className="w-5 h-5 rounded-full" alt={baseAsset?.symbol} />
                              <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                {baseAsset?.symbol}
                              </span>
                              <ChevronsRight className="w-4 h-4 text-violet-400" />
                              <Image src={quoteAsset?.logoURI} className="w-5 h-5 rounded-full" alt={quoteAsset?.symbol} />
                              <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                {quoteAsset?.symbol}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    useEffect(() => {
      if (!provider) {
        return;
      }
      if (!baseAsset) {
        return
      }
      if (!quoteAsset) {
        return
      }
      if (!debouncedInputValue) {
        return
      }
      if (!isSupportedChain(chainId)) {
        setBaseAsset(null)
        setQuoteAsset(null)
      }
      console.log("tetiklendi..")

    }, [baseAsset, quoteAsset, debouncedInputValue])






    const getRoutersByChainId = (chainId: number): Router[] => {
      return DECENTRALIZED_EXCHANGES.filter((exchange: any) => exchange.chainId === chainId).map((exchange) => ({
        router: exchange.router,
        weth: exchange.weth,
      }));
    };

    const getExchangeByRouterAndWETH = (routerAddress: string, wethAddress: string): any | undefined => {
      return DECENTRALIZED_EXCHANGES.find(
        (exchange: any) =>
          exchange.chainId === chainId &&
          exchange.router.toLowerCase() === routerAddress.toLowerCase() &&
          exchange.weth.toLowerCase() === wethAddress.toLowerCase()
      );
    };



    const handleFetchPairs = async () => {
      if (!baseAsset) { return }
      if (!quoteAsset) { return }
      if (!debouncedInputValue) { return }
      if (!baseInputValue) { return }

      if (!EXCHANGE) { return }
      if (!chainId) {
        return
      }


      const depositAmount = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals)

      const tokenBase: Token = {
        ...baseAsset,
        address: (baseAsset.address === ethers.constants.AddressZero || baseAsset.address == ETHER_ADDRESS) ? WETH9[chainId].address : baseAsset.address,
      };

      const tokenQuote: Token = {
        ...quoteAsset,
        address: (quoteAsset.address === ethers.constants.AddressZero || quoteAsset.address == ETHER_ADDRESS) ? WETH9[chainId].address : quoteAsset.address,
      };

      console.log("selectedBase", "ChainId", chainId, depositAmount, baseAsset, tokenBase, quoteAsset, tokenQuote)
      const wrapper = CHILIZWRAPPER[chainId].address

      const routers = getRoutersByChainId(chainId);


      const _tradingPairs = await EXCHANGE.fetchPairs(routers, wrapper, tokenBase.address, tokenQuote.address, depositAmount)



      const customPairs: TCustomPair[] = []; // Custom pair dizisi oluşturuluyor

      const _validPairs: PairInfo[] = []
      for (let i = 0; i < _tradingPairs.length; i++) { // Döngü başlatılıyor
        let pair: PairInfo = _tradingPairs[i]
        if (pair.valid) {
          if (_validPairs.some((p) => p.pair === pair.pair)) {
            continue;
          }
          _validPairs.push(pair);
        }
      }


      for (let i = 0; i < _validPairs.length; i++) { // Döngü başlatılıyor
        let pair: PairInfo = _validPairs[i]
        if (!pair.valid) {
          continue;
        }


        let _selectedBaseAddress = (baseAsset.address === ethers.constants.AddressZero || baseAsset.address === ETHER_ADDRESS) ? pair.weth : baseAsset.address
        let _selectedQuoteAddress = (quoteAsset.address === ethers.constants.AddressZero || quoteAsset.address === ETHER_ADDRESS) ? pair.weth : quoteAsset.address
        let selectedBase: any
        let selectedQuote: any

        if (_selectedBaseAddress == pair.weth) {
          [selectedBase, selectedQuote] = _selectedBaseAddress == pair.token0 ? [pair.token0, pair.token1] : [pair.token1, pair.token0]
        } else if (_selectedQuoteAddress == pair.weth) {
          [selectedBase, selectedQuote] = _selectedQuoteAddress == pair.token0 ? [pair.token1, pair.token0] : [pair.token0, pair.token1]
        } else {
          [selectedBase, selectedQuote] = [_selectedBaseAddress, _selectedQuoteAddress]
        }

        let _baseAddress = ethers.utils.getAddress(selectedBase);
        let _quoteAddress = ethers.utils.getAddress(selectedQuote);




        let _baseDecimals = Number(pair.token0 == _baseAddress ? pair.token0Decimals : pair.token1Decimals)
        let _quoteDecimals = Number(pair.token1 == _quoteAddress ? pair.token1Decimals : pair.token0Decimals)
        const baseTokenEntity = new Token(baseAsset.chainId, _baseAddress, _baseDecimals, baseAsset.symbol)
        const quoteTokenEntity = new Token(quoteAsset.chainId, _quoteAddress, _quoteDecimals, quoteAsset.symbol)
        const [baseReserve, quoteReserve] = _baseAddress == pair.token0 ? [pair.reserve0, pair.reserve1] : [pair.reserve1, pair.reserve0]



        let _checkBaseLiquidty = CurrencyAmount.fromRawAmount(baseTokenEntity, baseReserve.toString())
        let _checkQuuteLiquidity = CurrencyAmount.fromRawAmount(quoteTokenEntity, quoteReserve.toString())


        if (JSBI.lessThanOrEqual(_checkBaseLiquidty.quotient, MINIMUM_LIQUIDITY)) {
          continue;
        }

        if (JSBI.lessThanOrEqual(_checkQuuteLiquidity.quotient, MINIMUM_LIQUIDITY)) {
          continue;
        }

        const exchangePair = new Pair(
          CurrencyAmount.fromRawAmount(baseTokenEntity, baseReserve.toString()),
          CurrencyAmount.fromRawAmount(quoteTokenEntity, quoteReserve.toString()))



        const baseAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(baseTokenEntity, JSBI.BigInt(ethers.utils.parseUnits(baseInputValue, Number(_baseDecimals)).toString()));

        let _tradeInfo = new Trade(
          new Route([exchangePair], baseTokenEntity, quoteTokenEntity),
          CurrencyAmount.fromRawAmount(baseTokenEntity, baseAmount.quotient),
          TradeType.EXACT_INPUT
        )

        let _baseLiquidity = CurrencyAmount.fromRawAmount(baseTokenEntity, baseReserve.toString()).toSignificant(6)
        let _quoteLiquidity = CurrencyAmount.fromRawAmount(quoteTokenEntity, quoteReserve.toString()).toSignificant(6)

        const DEFAULT_ADD_SLIPPAGE_TOLERANCE = new Percent(INITIAL_ALLOWED_SLIPPAGE, 10_000)
        const amountOutSlippage = _tradeInfo.minimumAmountOut(DEFAULT_ADD_SLIPPAGE_TOLERANCE)


        var output = 0
        let price = parseFloat(_tradeInfo.executionPrice.toSignificant());
        let baseInput = parseFloat(baseInputValue);
        output = price * baseInput
        let outputAmount = amountOutSlippage.toSignificant(6)

        let exchangeInfo = getExchangeByRouterAndWETH(pair.router, pair.weth)

        if (parseFloat(_tradeInfo.priceImpact.toFixed(2)) < 10) {
          customPairs.push({ pair: pair, isSelected: false, trade: _tradeInfo, baseLiqudity: _baseLiquidity, quoteLiquidity: _quoteLiquidity, exchangeInfo: exchangeInfo, outputAmount: outputAmount })

        }


      }

      setTradingPairs(customPairs);
    }
    useEffect(() => {
      const fetchPairsAsync = async () => {
        await handleFetchPairs();
      };
      fetchPairsAsync();
    }, [debouncedInputValue]);


    const handleSwapAll = async () => {

      if (!baseAsset) {
        return
      }

      if (!chainId) {
        return
      }

      if (!quoteAsset) {
        return
      }

      if(!EXCHANGE){
        return
      }

      if (tradingPairs.length < 1) {
        return
      }


      let WRAPPER = CHILIZWRAPPER[chainId].address

      toggleLoading();

      let DEPOSIT_AMOUNT = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals)
      let allSwapParams : any = [];
      let IS_NATIVE = (baseAsset.address === ETHER_ADDRESS || baseAsset.address === ethers.constants.AddressZero)




      function normalizeAmount(amount: JSBI, decimals: number): JSBI {
        const DECIMALS_STANDARD = 18; // Tüm karşılaştırmaları 18 decimals üzerinden yapacağız.
        return JSBI.multiply(
          amount,
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(DECIMALS_STANDARD - decimals))
        );
      }
      
     
       
      tradingPairs.forEach((pair) => {


        if (
          pair.pair.valid &&
          JSBI.greaterThan(
            normalizeAmount( JSBI.BigInt(pair.pair.reserve0.toString()), pair.pair.token0Decimals.toNumber()),
            normalizeAmount(MINIMUM_LIQUIDITY, pair.pair.token0Decimals.toNumber())
          ) &&
          JSBI.greaterThan(
            normalizeAmount( JSBI.BigInt(pair.pair.reserve1.toString()), pair.pair.token1Decimals.toNumber()),
            normalizeAmount(MINIMUM_LIQUIDITY, pair.pair.token1Decimals.toNumber())
          )
        ) {
          let outputAmount = parseUnits(pair.outputAmount, quoteAsset?.decimals)

          let INPUT_TOKEN = IS_NATIVE ? pair.pair.weth : baseAsset.address;
          let swapParam = {
            amountIn: DEPOSIT_AMOUNT,
            amountOut:outputAmount,
            weth9: pair.pair.weth,
            wrapper: WRAPPER,
            pair: pair.pair.pair,
            input: INPUT_TOKEN
          }


          if (!allSwapParams.some((param:any) => param.pair === pair.pair)) {

            allSwapParams.push(swapParam);
          }
        }
/*
        if (pair.pair.valid && ((pair.pair.reserve0.gt(MINIMUM_LIQUIDITY) && pair.pair.reserve1.gt(MINIMUM_LIQUIDITY)))) {

          let outputAmount = parseUnits(pair.outputAmount, quoteAsset?.decimals)

          let INPUT_TOKEN = IS_NATIVE ? pair.pair.weth : baseAsset.address;
          let swapParam = {
            amountIn: DEPOSIT_AMOUNT,
            amountOut:outputAmount,
            weth9: pair.pair.weth,
            wrapper: WRAPPER,
            pair: pair.pair.pair,
            input: INPUT_TOKEN
          }


          if (!allSwapParams.some((param:any) => param.pair === pair.pair)) {

            allSwapParams.push(swapParam);
          }
        }*/
      });

      console.log("params", allSwapParams,tradingPairs)


      if(allSwapParams.length == 0){
        toggleLoading();
        return;
      }

      let overrides = {
        value: IS_NATIVE ? DEPOSIT_AMOUNT.mul(allSwapParams.length) : ethers.constants.Zero,
      }

      if (!IS_NATIVE) {
        const tokenContract = ERC20Contract(baseAsset.address);
        const allowance = await tokenContract.allowance(account, EXCHANGE.address);
        if (allowance.lt(DEPOSIT_AMOUNT)) {
          const approveTx = await tokenContract.approve(EXCHANGE.address, ethers.constants.MaxUint256)
          await approveTx.wait();
        }
      }
    
      console.log("EXCHANGE",EXCHANGE)

      await EXCHANGE.swapAll(allSwapParams, overrides).then(async (tx) => {
        await tx.wait();
        const summary = `Swapping : ${tx.hash}`
        setTransaction({ hash: tx.hash, summary: summary, error: null });
        toggleTransactionSuccess();
      }).catch((error: Error) => {
        setTransaction({ hash: '', summary: '', error: error });
        toggleError();
      }).finally(async () => {
        toggleLoading();
      });






    }


    const handleSwap = async (pair:any) => {

      if (!baseAsset) {
        return
      }

      if (!quoteAsset) {
        return
      }

      if(!chainId){
        return
      }

      if (!EXCHANGE) {
        return
      }


      let WRAPPER = CHILIZWRAPPER[chainId].address
      toggleLoading();

      let DEPOSIT_AMOUNT = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals)
      let IS_NATIVE = (baseAsset.address === ETHER_ADDRESS || baseAsset.address === ethers.constants.AddressZero)
      let outputAmount = parseUnits(pair.outputAmount, quoteAsset?.decimals)

      let INPUT_TOKEN = IS_NATIVE ? pair.pair.weth : baseAsset.address;
      let swapParam = {
        amountIn: DEPOSIT_AMOUNT,
        amountOut:outputAmount,
        weth9: pair.pair.weth,
        wrapper: WRAPPER,
        pair: pair.pair.pair,
        input: INPUT_TOKEN
      }
      let overrides = {
        value: IS_NATIVE ? DEPOSIT_AMOUNT : 0
      }

      if ((!IS_NATIVE) && (swapParam.input != ethers.constants.AddressZero)) {
        const tokenContract = ERC20Contract(swapParam.input);

        const allowance = await tokenContract.allowance(account, EXCHANGE.address);
        if (allowance.lt(DEPOSIT_AMOUNT)) {
          const approveTx = await tokenContract.approve(EXCHANGE.address, ethers.constants.MaxUint256)
          await approveTx.wait();
        }

      }

      

      console.log("EXCHANGE",swapParam)

      await EXCHANGE.swap(swapParam, overrides).then(async (tx) => {
        await tx.wait();
        const summary = `Swapping : ${tx.hash}`
        setTransaction({ hash: tx.hash, summary: summary, error: null });
        toggleTransactionSuccess();
      }).catch((error: Error) => {
        setTransaction({ hash: '', summary: '', error: error });
        toggleError();
      }).finally(async () => {
        toggleLoading();
      });

      fetchTokens();


    }

    return (
      <div className="w-full flex flex-col gap-3">
        {tradingPairs.length > 0 && (
          <>
            {/* Trade Options */}
            <div className="space-y-3">
              {tradingPairs.map((pair, index) => (
                <div key={`pair${index}`} className="group/option relative">
                  {/* Hover glow effect */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover/option:opacity-100 blur-md transition-opacity duration-300" />
                  
                  {/* Main container */}
                  <div className="relative rounded-2xl bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-violet-500/10 dark:border-violet-400/10 
                    hover:border-violet-500/20 dark:hover:border-violet-400/20 overflow-hidden transition-all duration-300">
                    
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent 
                      translate-x-[-200%] group-hover/option:translate-x-[200%] transition-all duration-1000" />
                    
                    {/* Content */}
                    <div className="relative p-3 sm:p-4">
                      {/* Main content */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Left side - Exchange info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-sm animate-pulse-slow" />
                            <Image 
                              src={pair.exchangeInfo.logo} 
                              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-violet-500/20 p-1.5" 
                            />
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm sm:text-base font-medium text-violet-900 dark:text-violet-100 truncate">
                                {pair.exchangeInfo.dex}
                              </span>
                              <div className="px-2 py-0.5 text-xs rounded-full bg-violet-500/10 border border-violet-500/20 shrink-0">
                                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
                                  {pair.trade.priceImpact.toFixed(2)}% Impact
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70 truncate">
                              1 {baseAsset?.symbol} = {pair.trade.executionPrice.toSignificant()} {quoteAsset?.symbol}
                            </div>
                          </div>
                        </div>

                        {/* Right side - Amount and buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-base sm:text-lg font-semibold text-violet-900 dark:text-violet-100">
                              {pair.outputAmount}
                            </div>
                            <div className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                              {quoteAsset?.symbol}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Buttons */}
                            <Button
                              className={[
                                "h-8 w-8 sm:h-9 sm:w-9",
                                "bg-violet-500/10",
                                "hover:bg-violet-500/20",
                                "active:scale-95",
                                "transition-all duration-200",
                                "group/btn",
                                "rounded-xl",
                                "relative overflow-hidden"
                              ].join(" ")}
                              variant="flat"
                              isIconOnly
                              onPress={() => setExpandedPair(expandedPair === index ? null : index)}
                            >
                              {expandedPair === index ? 
                                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-300" /> :
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-300" />
                              }
                            </Button>

                            <Button
                              className={[
                                "h-8 w-8 sm:h-9 sm:w-9",
                                "bg-violet-500/10",
                                "hover:bg-violet-500/20",
                                "active:scale-95",
                                "transition-all duration-200",
                                "group/btn",
                                "rounded-xl",
                                "relative overflow-hidden"
                              ].join(" ")}
                              variant="flat"
                              isIconOnly
                              onPress={() => handleSwap(pair)}
                            >
                              <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-300" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded content - Mobil için optimize edilmiş */}
                      {expandedPair === index && (
                        <div className="overflow-hidden">
                          <div className="animate-slideDown">
                            <div className="mt-3 pt-3 border-t border-violet-500/10 dark:border-violet-400/10">
                              <div className="grid grid-cols-1 gap-4">
                                {/* Price details */}
                                <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                                  <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400">
                                    Price Details
                                  </span>
                                  <div className="space-y-2 bg-violet-500/[0.02] dark:bg-violet-400/[0.02] rounded-xl p-2.5 
                                    animate-slideInFromRight" style={{ animationDelay: '0.2s' }}>
                                    {/* Price Impact */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                        Price Impact
                                      </span>
                                      <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                        {pair.trade.priceImpact.toFixed(2)}%
                                      </span>
                                    </div>

                                    {/* Base Price */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                        {baseAsset?.symbol} Price
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Image src={quoteAsset?.logoURI} className="w-4 h-4 rounded-full" alt={quoteAsset?.symbol} />
                                        <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                          {pair.trade.executionPrice.toSignificant()} {quoteAsset?.symbol}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Quote Price */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                        {quoteAsset?.symbol} Price
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Image src={baseAsset?.logoURI} className="w-4 h-4 rounded-full" alt={baseAsset?.symbol} />
                                        <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                          {pair.trade.executionPrice.invert().toSignificant()} {baseAsset?.symbol}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Liquidity Info */}
                                <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                                  <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400">
                                    Pool Liquidity
                                  </span>
                                  <div className="space-y-2 bg-violet-500/[0.02] dark:bg-violet-400/[0.02] rounded-xl p-2.5 
                                    animate-slideInFromRight" style={{ animationDelay: '0.4s' }}>
                                    {/* Base Asset Liquidity */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                        {baseAsset?.symbol} Liquidity
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Image src={baseAsset?.logoURI} className="w-4 h-4 rounded-full" alt={baseAsset?.symbol} />
                                        <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                          {pair.baseLiqudity} {baseAsset?.symbol}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Quote Asset Liquidity */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70">
                                        {quoteAsset?.symbol} Liquidity
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Image src={quoteAsset?.logoURI} className="w-4 h-4 rounded-full" alt={quoteAsset?.symbol} />
                                        <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                          {pair.quoteLiquidity} {quoteAsset?.symbol}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Route Info */}
                                    <div className="flex items-center gap-2 mt-3 p-2 rounded-xl bg-violet-500/5 dark:bg-violet-400/5">
                                      <Image src={baseAsset?.logoURI} className="w-5 h-5 rounded-full" alt={baseAsset?.symbol} />
                                      <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                        {baseAsset?.symbol}
                                      </span>
                                      <ChevronsRight className="w-4 h-4 text-violet-400" />
                                      <Image src={quoteAsset?.logoURI} className="w-5 h-5 rounded-full" alt={quoteAsset?.symbol} />
                                      <span className="text-xs sm:text-sm font-medium text-violet-900 dark:text-violet-100">
                                        {quoteAsset?.symbol}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Swap All Button */}
            <div className="relative mt-4 group/swap">
              {/* Button glow effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 rounded-2xl opacity-70 blur-md 
                group-hover/swap:opacity-100 transition-opacity duration-300" />
              
              <Button
                className={[
                  "relative w-full h-12",
                  "bg-gradient-to-r from-violet-500 to-fuchsia-500",
                  "hover:opacity-95",
                  "active:scale-[0.99]",
                  "transition-all duration-200",
                  "rounded-full",
                  "font-semibold",
                  "text-white",
                  "overflow-hidden"
                ].join(" ")}
                onPress={handleSwapAll}
              >
                {/* Button shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                  translate-x-[-100%] group-hover/swap:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="relative flex items-center justify-center gap-2">
                  <span className="text-lg">Swap All</span>
                </div>
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  const debouncedSetInputValue = useCallback(
    debounce((val) => {
      setDebouncedSetInputValue(val)
    }, 500), // Debounce süresi
    []
  );

 
  return (
    <>
      <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
      <ModalSelectToken disableToken={tokenSelector.side == TradeType.EXACT_INPUT ? quoteAsset : baseAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={getTokenListByChainId(chainId)} onSelectPair={handleSelectPair} allExchangePairs={allExchangePairs} />
      <UniwalletModal />
      <ModalConnect isShowing={isConnect} hide={toggleConnectModal} />
      <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
      <ModalError
        isShowing={isErrorShowing}
        hide={toggleError}
        error={transaction.error}
      />
      <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
        isShowing={isShowLoading} />
      <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
        isShowing={isTransactionSuccess} />



      <div className="flex flex-col gap-4 w-full">
        {/* Main input container - Sticky header */}
        <div className="sticky top-[0px] z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl py-2">
          <div className="w-full rounded-lg relative overflow-hidden group/container">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.02] to-transparent dark:from-violet-500/[0.05] dark:to-transparent backdrop-blur-2xl" />
            <div className="absolute inset-0 border border-violet-500/[0.08] dark:border-violet-400/10 rounded-3xl" />
            
            <div className="relative p-3 sm:p-5 overflow-hidden">
              {/* Input section */}
              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text text-sm font-medium tracking-wide">
                    Input Amount
                  </span>
                  {baseAsset && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 dark:bg-violet-400/10 border border-violet-500/20 dark:border-violet-400/20">
                      <Image src={baseAsset.logoURI} className="w-4 h-4" alt={baseAsset.symbol} />
                      <span className="text-violet-600 dark:text-violet-300 text-sm font-medium">
                        {baseAsset.symbol}
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom input container with glow effect */}
                <div className="group/input relative">
                  {/* Animasyonlu glow border efekti */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-sm group-hover/input:blur-md group-focus-within/input:blur-md transition-all duration-300" />
                  
                  {/* Ana background */}
                  <div className="absolute inset-0 bg-violet-500/[0.02] dark:bg-violet-400/[0.02] rounded-full transition-all duration-300 
                    group-focus-within/input:bg-violet-500/[0.05] dark:group-focus-within/input:bg-violet-400/[0.05]
                    group-hover/input:bg-violet-500/[0.03] dark:group-hover/input:bg-violet-400/[0.03]" />
                  
                  {/* Animasyonlu border */}
                  <div className="absolute inset-0 rounded-full border border-violet-500/10 dark:border-violet-400/10
                    group-hover/input:border-violet-500/20 dark:group-hover/input:border-violet-400/20
                    group-focus-within/input:border-violet-500/30 dark:group-focus-within/input:border-violet-400/30
                    transition-colors duration-300" />
                  
                  {/* Animasyonlu gradient overlay */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/0 via-fuchsia-500/[0.05] to-violet-500/0 
                    opacity-0 group-hover/input:opacity-100 group-focus-within/input:opacity-100
                    translate-x-[-100%] group-hover/input:translate-x-[100%] group-focus-within/input:translate-x-[100%]
                    transition-all duration-1000 ease-in-out" />
                  
                  <div className="relative flex items-center p-1">
                    <input
                      type="text"
                      value={baseInputValue}
                      onChange={(e) => setInputValue(e.target.value, TradeType.EXACT_INPUT)}
                      placeholder="0.00"
                      className="w-full rounded-full bg-transparent text-2xl font-semibold px-3 py-2.5 text-violet-950 dark:text-violet-100 outline-none 
                        placeholder:text-violet-400/20 dark:placeholder:text-violet-300/20
                        relative z-10"
                    />
                    
                    {/* Token selector buttons */}
                    <div className="flex items-center gap-1.5 bg-violet-500/[0.03] dark:bg-violet-400/[0.03] rounded-full p-1 mr-1 relative z-10">
                      <Tooltip content='Select Base Asset' placement="top" delay={0}>
                        <Button 
                          onPress={() => {
                            setTokenSelector({
                              showTokenSelector: true,
                              side: TradeType.EXACT_INPUT
                            });
                            toggleSelectToken()
                          }} 
                          className={[
                            "h-9 w-9",
                            "bg-violet-500/[0.05] dark:bg-violet-400/[0.05]",
                            "hover:bg-violet-500/10 dark:hover:bg-violet-400/10",
                            "active:scale-95",
                            "transition-all duration-200",
                            "group/btn",
                            "flex items-center justify-center",
                            "overflow-hidden"
                          ].join(" ")}
                          variant="flat"
                          isIconOnly 
                          radius="full"
                        >
                          {baseAsset ? 
                            <Avatar 
                              className="w-7 h-7 group-hover/btn:scale-105 transition-transform"
                              src={baseAsset.logoURI} 
                              size="sm"
                              radius="full"
                            /> : 
                            <Hand className="w-4 h-4 text-violet-500/70 dark:text-violet-400/70 group-hover/btn:text-violet-600 dark:group-hover/btn:text-violet-300" />
                          }
                        </Button>
                      </Tooltip>

                      <Button 
                        onPress={handleSwapAssets} 
                        className={[
                          "h-9 w-9",
                          "bg-violet-500/[0.05] dark:bg-violet-400/[0.05]",
                          "hover:bg-violet-500/10 dark:hover:bg-violet-400/10",
                          "active:scale-95",
                          "transition-all duration-200",
                          "group/btn",
                          "flex items-center justify-center"
                        ].join(" ")}
                        variant="flat"
                        isIconOnly 
                        radius="full"
                      >
                        <GitCompareArrows className="w-4 h-4 text-violet-500/70 dark:text-violet-400/70 
                          group-hover/btn:text-violet-600 dark:group-hover/btn:text-violet-300 
                          group-hover/btn:rotate-180 transition-all duration-300" />
                      </Button>

                      <Tooltip content='Select Quote Asset' placement="top" delay={0}>
                        <Button 
                          onPress={() => {
                            setTokenSelector({
                              showTokenSelector: true,
                              side: TradeType.EXACT_OUTPUT
                            });
                            toggleSelectToken()
                          }}
                          className={[
                            "h-9 w-9",
                            "bg-violet-500/[0.05] dark:bg-violet-400/[0.05]",
                            "hover:bg-violet-500/10 dark:hover:bg-violet-400/10",
                            "active:scale-95",
                            "transition-all duration-200",
                            "group/btn",
                            "flex items-center justify-center",
                            "overflow-hidden"
                          ].join(" ")}
                          variant="flat"
                          isIconOnly 
                          radius="full"
                        >
                          {quoteAsset ? 
                            <Avatar 
                              className="w-7 h-7 group-hover/btn:scale-105 transition-transform"
                              src={quoteAsset.logoURI} 
                              size="sm"
                              radius="full"
                            /> : 
                            <Hand className="w-4 h-4 text-violet-500/70 dark:text-violet-400/70 group-hover/btn:text-violet-600 dark:group-hover/btn:text-violet-300" />
                          }
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance and percentage buttons */}
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                {baseAsset && (
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/5 dark:bg-violet-400/5 border border-violet-500/10 dark:border-violet-400/10">
                      <Wallet2 className="w-4 h-4 text-violet-500/50 dark:text-violet-400/50" />
                      <span className="text-sm text-violet-600/70 dark:text-violet-300/70">
                        Balance: {baseAsset.balance} {baseAsset.symbol}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  {[25, 50, 75, 100].map((percent) => (
                    <Button
                      key={percent}
                      className={[
                        "h-8 min-w-[52px]",
                        "bg-gradient-to-r from-violet-500/[0.03] to-fuchsia-500/[0.03]",
                        "hover:from-violet-500/[0.08] hover:to-fuchsia-500/[0.08]",
                        "active:scale-95",
                        "transition-all duration-200",
                        "group/btn",
                        "relative overflow-hidden",
                        "border border-violet-500/10 dark:border-violet-400/10",
                        "hover:border-violet-500/20 dark:hover:border-violet-400/20",
                        "backdrop-blur-sm"
                      ].join(" ")}
                      variant="flat"
                      onPress={() => setTradeInputPercent(percent)}
                      radius="full"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                        opacity-0 group-hover/btn:opacity-100 translate-x-[-100%] group-hover/btn:translate-x-[100%] 
                        transition-all duration-700" />
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover/btn:opacity-100 
                        bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-md transition-opacity" />
                      
                      {/* Content */}
                      <div className="relative flex items-center justify-center gap-1">
                        <span className="text-xs font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 
                          text-transparent bg-clip-text group-hover/btn:text-violet-100 dark:group-hover/btn:text-violet-100 
                          transition-colors">
                          {percent}%
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full h-full mb-[200px]  pb-[200px]'>
      <TradeContainer />
      </div>

         
      </div>

    </>
  );
}
export const TRADE_TAB = memo(_TRADE_TAB)

