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
import { ChevronsRight, CirclePercent, GitCompareArrows, Hand, ScanEye, ScanSearch } from 'lucide-react';
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


    const TradeItem: React.FC<TradeItemProps> = ({ pair }) => {
      const [expanded, setExpanded] = useState<boolean>(false)
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

      return (<div className=" group  flex flex-col items-center justify-center">

        <div className={(expanded ? "border-b-0" : "") + " w-full cursor-pointer  bg-default/70 backdrop-blur-lg group-hover:bg-default/50 border border-1 border-default  rounded-full flex items-center justify-center p-2"}>
          <div className="w-full flex flex-row items-center justify-center gap-2">
            <div className="w-full flex flex-row gap-2 items-center justify-start">
              <Button onPress={() => {
                setExpanded(!expanded)
              }} color="default"
                className="border border-1 border-default/30 hover:border-default"
                variant="light" radius="full" size="lg" isIconOnly>
                {expanded ? <ScanSearch /> : <ScanEye />}
              </Button>
              <Image src={pair.exchangeInfo.logo} className="min-w-10 min-h-10 w-10 h-10 border border-1 border-default p-1 rounded-full" />
              <div className="flex flex-col items-center justify-start">
                <div className="w-full flex flex-col items-start justify-center">
                  <span className="text-sm">{pair.exchangeInfo.dex}</span>
                  <Tooltip  color='danger' content={`Price Impact : ${pair.trade.priceImpact.toFixed(2)}%`}>
                  <span className="px-2 text-xs rounded-lg bg-danger-500 text-white">{pair.trade.priceImpact.toFixed(2)}%</span>
                  </Tooltip>
                </div>


              </div>
            </div>
            <div className="w-full flex flex-row gap-2 items-center justify-end">
              <div className="w-full  flex flex-col sm:flex-row items-center justify-end gap-2   rounded-lg p-2">
                <span className="sm:text-sm text-xs ">{pair.outputAmount}</span>
                <span className="sm:text-xs text-[8px]">{quoteAsset?.symbol}</span>
              </div>
              <Button onPress={() => {
                handleSwap()
              }} color="danger" variant="light" radius="full" size="lg" isIconOnly>
                <ChevronsRight />
              </Button>
            </div>

          </div>
        </div>
        {
          expanded && <div className=" w-full bg-default/70 backdrop-blur-lg group-hover:bg-default/50  border-t-0 border border-1 border-default max-w-[90%] justify-center items-center rounded-b-lg text-sm  flex flex-col gap-2 p-2">

            <div className="w-full flex flex-col gap-2 p-2">
              <span className="text-sm">Price</span>
              <div className="w-full grid grid-cols-2 items-center p-1">

                <div className="w-full flex flex-row items-center justify-start gap-2 ">
                  <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                  <small className="text-sm">{pair.trade.executionPrice.invert().toSignificant()} {baseAsset?.symbol} per {quoteAsset?.symbol}</small>
                </div>
                <div className="flex flex-row items-center justify-start gap-2">
                  <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                  <small className=" text-sm">{pair.trade.executionPrice.toSignificant()}  {quoteAsset?.symbol} per {baseAsset?.symbol}</small>
                </div>

              </div>
            </div>


            <div className="w-full flex flex-col gap-2 p-2">
              <span className="text-sm">Liquidity</span>
              <div className="w-full grid grid-cols-2 items-center justify-center">
                <div className="flex flex-row gap-2">
                  <Image src={baseAsset?.logoURI} className="w-5 h-5 border border-1 border-default  rounded-full" />
                  <span className="text-sm">{pair.baseLiqudity} {baseAsset?.symbol}</span>
                </div>
                <div className="flex flex-row gap-2">
                  <Image src={quoteAsset?.logoURI} className="w-5 h-5 border border-1 border-default rounded-full" />
                  <span className="text-sm">{pair.quoteLiquidity} {quoteAsset?.symbol} </span>
                </div>
              </div>
            </div>

          </div>
        }

      </div>)
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

    return (<ScrollShadow hideScrollBar className="max-h-[550px]">
      <div

        className="w-full flex flex-col gap-2">

        {tradingPairs.length > 0 && (
          <>
            {tradingPairs.map((pair, index) => (
              <TradeItem
                key={`pair${index}`}
                pair={pair}
              />
            ))}
            <Button
              radius="full"
              onPress={handleSwapAll}
              fullWidth
              size="lg"
              color="danger"
            >
              Swap All
            </Button>
          </>
        )}






      </div>




    </ScrollShadow>)
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



      <div className="flex flex-col gap-2 rounded-xl w-full">
        <div className="w-full rounded-xl flex flex-col gap-2">
          <div className='w-full flex flex-col gap-2'>
            <div className="w-full">
              <Input
                onChange={(val) => {
                  setInputValue(val.target.value, TradeType.EXACT_INPUT)
                }}
                value={baseInputValue}
                label={`Input ${baseAsset ? baseAsset.symbol : ""}->${quoteAsset ? quoteAsset.symbol : ""}`}
                endContent={
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <Tooltip  color='danger' content='Select Base Asset'>

                    <Button onPress={() => {
                      setTokenSelector(prevState => ({
                        ...prevState,
                        showTokenSelector: true,
                        side: TradeType.EXACT_INPUT
                      }));
                      toggleSelectToken()
                    }} size="md" className="opacity-100" variant="faded" isIconOnly radius="full">
                      {
                        baseAsset ? <Avatar className="opacity-100" isBordered size="sm" src={baseAsset.logoURI} />: <Hand />
                      }
                      
                    </Button>
                    </Tooltip>
                    <Tooltip  color='danger' content='Switch Assets'>

                    <Button onPress={() => {
                      handleSwapAssets()
                    }} size="md" className="opacity-100" variant="faded" isIconOnly radius="full">
                      <GitCompareArrows />
                    </Button>
                    </Tooltip>
                    <Tooltip  color='danger' content='Select Quote Asset'>
                    <Button onPress={() => {
                      setTokenSelector(prevState => ({
                        ...prevState,
                        showTokenSelector: true,
                        side: TradeType.EXACT_OUTPUT
                      }));
                      toggleSelectToken()
                    }} size="md" variant="faded" isIconOnly radius="full">
                      {quoteAsset ? <Avatar className="opacity-100" isBordered size="sm" src={quoteAsset.logoURI} />: <Hand />}

                    </Button>
                    </Tooltip>

                  </div>
                }
                fullWidth variant="faded"
                radius="full"
                className="w-full flex flex-col gap-2 items-center justify-center"
                size={"lg"} type="text" />

            </div>
            <div className="w-full flex flex-col gap-2">
              <div className="grid grid-cols-2">
               <div className="w-full flex flex-row gap-2 items-center justify-start">
               {
                  baseAsset && <>
                  <Image className="w-8 h-8" src={baseAsset ? baseAsset?.logoURI : DEFAULT_TOKEN_LOGO} />
                  <span>{baseAsset && baseAsset.balance} {baseAsset?.symbol}</span></>
                }
                </div>

               
               
                <div className="w-full flex flex-row items-center pt-2 justify-end gap-2">



                  <Badge isOneChar color="default" className="bg-default/60 border-1 border-default/30" content={<CirclePercent  />} placement="top-right">

                    <Button
                      className="max-w-[40px] min-w-[40px] min-h-[40px] border border-1 border-default/30 hover:border-default"
                      fullWidth
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setTradeInputPercent(25)
                      }}
                      radius="full"
                    >
                      25

                    </Button>
                  </Badge>


                  <Badge isOneChar color="default" className="bg-default/60 border-1 border-default/30" content={<CirclePercent />} placement="top-right">

                    <Button
                      className="max-w-[40px] min-w-[40px] min-h-[40px] border border-1 border-default/30 hover:border-default"
                      fullWidth
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setTradeInputPercent(50)
                      }}
                      radius="full"
                    >
                      50

                    </Button>
                  </Badge>


                  <Badge isOneChar color="default" className="bg-default/60 border-1 border-default/30" content={<CirclePercent />} placement="top-right">

                    <Button
                      className="max-w-[40px] min-w-[40px] min-h-[40px] border border-1 border-default/30 hover:border-default"
                      fullWidth
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setTradeInputPercent(75)

                      }}
                      radius="full"
                    >
                      75

                    </Button>
                  </Badge>


                  <Badge isOneChar color="default" className="bg-default/60 border-1 border-default/30" content={<CirclePercent />} placement="top-right">

                    <Button
                      className="max-w-[40px] min-w-[40px] min-h-[40px] border border-1 border-default/30 hover:border-default"
                      fullWidth
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setTradeInputPercent(100)

                      }}
                      radius="full"
                    >
                      100

                    </Button>
                  </Badge>

                </div>
              </div>

            </div>

          </div>
          <div className='w-full'>
            <TradeContainer />
          </div>
        </div>







      </div>

    </>
  );
}
export const TRADE_TAB = memo(_TRADE_TAB)



