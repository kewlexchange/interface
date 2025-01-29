import React, { memo, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, isLPAddressBurned, TradeType, WCHZ_COMMUNITY_ADDRESS } from '../../../constants/misc';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useFanTokenWrapperContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { Avatar, Button, ButtonGroup, Card, Image } from '@nextui-org/react';
import { parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';
import { ChevronDown, Wallet2, GitCompareArrows, ArrowUpDown } from 'lucide-react';



const _SWAP_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const FANTOKENWRAPPER = useFanTokenWrapperContract(chainId, true)

    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const { state: isConnect, toggle: toggleConnectModal } = useModal()
    const { state: isShowWallet, toggle: toggleWalletModal } = useModal()

    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [baseAsset, setBaseAsset] = useState(null)
    const [quoteAsset, setQuoteAsset] = useState(null)
    const [isBase, setIsBase] = useState(true)

    const [baseLiquidity, setBaseLiquidity] = useState("0")
    const [quoteLiquidity, setQuoteLiquidity] = useState("0")

    const [baseInputValue, setBaseInputValue] = useState("")
    const [quoteInputValue, setQuoteInputValue] = useState("")

    const [baseTokenAllowance, setBaseTokenAllowance] = useState(0)
    const [quoteTokenAllowance, setQuoteTokenAllowance] = useState(0)
    const ERC20Contract = useERC20Contract()
    const [pairInfo, setPairInfo] = useState(null)
    const PAIRContract = usePAIRContract()
    const [hasLiquidity, setHasLiquidity] = useState(false)
    const [tradeInfo, setTradeInfo] = useState(null)
    const userDeadline = useAppSelector((state) => state.user.userDeadline);
    const userTax = useAppSelector((state) => state.user.userTax);
    const userSlippageTolerance = useAppSelector((state) => state.user.userSlippageTolerance);
    const [allExchangePairs, setAllExchangePairs]: any = useState(null)

    const { fetchTokens } = useFetchAllTokenList(chainId, account);




    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

         
          if (defaultAssets.length > 0) {
            setQuoteAsset(defaultAssets[2]);
            setBaseAsset(defaultAssets.find(token => token?.symbol === getNativeCurrencyByChainId(chainId)))
        } else {
            console.error("KWL token not found in defaultAssets.");
            setBaseAsset(null)
            setQuoteAsset(null)
        }


       // setQuoteAsset(defaultAssets.find(token => token?.symbol === "KWL"))
    }, [defaultAssets])

    const setInputValue = (e, isBase) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        e = e.replace(",", ".")
        if (regex.test(e)) {
            if (isBase) {
                setBaseInputValue(e)
            } else {
                setQuoteInputValue(e)
            }
        }

        setIsBase(isBase)
    }



    const resetSwap = async (isBase) => {
        setTradeInfo(null)
        setHasLiquidity(true)
        if (!isBase) {
            setBaseInputValue("")
        } else {
            setQuoteInputValue("")
        }
        setBaseLiquidity("")
        setQuoteLiquidity("")
    }
    const fetchPrice = async () => {
        if (!chainId) { return }
        if (!baseAsset) { return }
        if (!quoteAsset) { return }

        if (!isSupportedChain(chainId)) {
            return;
        }


        var WRAPPED_ASSET = WETH9[chainId].address;


        if(isLPAddressBurned(baseAsset.address )){
            WRAPPED_ASSET = WCHZ_COMMUNITY_ADDRESS
        }

        if(isLPAddressBurned(quoteAsset.address )){
            WRAPPED_ASSET = WCHZ_COMMUNITY_ADDRESS
        }



        let _baseAddress = baseAsset.address === ETHER_ADDRESS ? WRAPPED_ASSET : baseAsset.address
        let _quoteAddress = quoteAsset.address === ETHER_ADDRESS ? WRAPPED_ASSET : quoteAsset.address

        var _baseTokenBalance : any = 0;
        var _quoteTokenBalance : any = 0;

        if(account){
            if((baseAsset.address != ETHER_ADDRESS) && (quoteAsset.address != ETHER_ADDRESS)){
                const BaseERC20Token = ERC20Contract(baseAsset.address)
                _baseTokenBalance = await BaseERC20Token.balanceOf(account);
            const QuoteERC20Token = ERC20Contract(quoteAsset.address)
                _quoteTokenBalance = await QuoteERC20Token.balanceOf(account);
            }else{
                if(baseAsset.address == ETHER_ADDRESS){
                    _baseTokenBalance = await provider.getBalance(account);
                    const QuoteERC20Token = ERC20Contract(quoteAsset.address)
                    _quoteTokenBalance = await QuoteERC20Token.balanceOf(account);
                }else  if(quoteAsset.address == ETHER_ADDRESS){
                    _quoteTokenBalance = await provider.getBalance(account);
                    const BaseERC20Token = ERC20Contract(baseAsset.address)
                    _baseTokenBalance = await BaseERC20Token.balanceOf(account);
                }
            }
        }



      

        const _allExchangePairs = await EXCHANGE.getAllPairs();
        setAllExchangePairs(_allExchangePairs)

        const _pairInfo = await EXCHANGE.getPairInfo(_baseAddress, _quoteAddress);
        setPairInfo(_pairInfo)
        if (!_pairInfo.valid) {
            await resetSwap(isBase)
            return;
        }
        await checkAllowance(_baseAddress, _quoteAddress)


        if (isBase) {
            if (parseFloatWithDefault(baseInputValue, 0) === 0) {
                await resetSwap(true)
                return
            }
        } else {
            if (parseFloatWithDefault(quoteInputValue, 0) === 0) {
                await resetSwap(false)
                return
            }
        }
        const pairAddress = _pairInfo.pair
        let pairContract = PAIRContract(pairAddress);
        const [_reserve0, _reserve1, _blockTimestampLast] = await pairContract.getReserves();
        let noLiquidity = _reserve0 === 0 && _reserve1 === 0
        setHasLiquidity(!noLiquidity)
        if (noLiquidity) {
            return
        }


        const baseToken = new Token(baseAsset.chainId, _baseAddress, baseAsset.decimals, baseAsset.symbol)
        const quoteToken = new Token(quoteAsset.chainId, _quoteAddress, quoteAsset.decimals, quoteAsset.symbol)
        const [baseReserve, quoteReserve] = baseToken.sortsBefore(quoteToken) ? [_reserve0, _reserve1] : [_reserve1, _reserve0]


  
      

        const baseAssetBalance = CurrencyAmount.fromRawAmount(baseToken, _baseTokenBalance).toSignificant(6)
        const quoteAssetBalance = CurrencyAmount.fromRawAmount(quoteToken, _quoteTokenBalance).toSignificant(6)

    
        /*
        let _updatedBaseAsset ={
                chainId:baseAsset.chainId,
                address:baseAsset.address,
                balance:baseAssetBalance,
                logoURI:baseAsset.logoURI,
                decimals:baseAsset.decimals,
                name:baseAsset.name,
                symbol:baseAsset.symbol,
            }
        let _updatedQuoteAsset ={
                chainId:quoteAsset.chainId,
                address:quoteAsset.address,
                balance:quoteAssetBalance,
                logoURI:quoteAsset.logoURI,
                decimals:quoteAsset.decimals,
                name:quoteAsset.name,
                symbol:quoteAsset.symbol,
            }
        setBaseAsset(_updatedBaseAsset)
        setQuoteAsset(_updatedQuoteAsset)
        */

        setBaseLiquidity(CurrencyAmount.fromRawAmount(baseToken, baseReserve).toSignificant(6))
        setQuoteLiquidity(CurrencyAmount.fromRawAmount(quoteToken, quoteReserve).toSignificant(6))

        const exchangePair = new Pair(
            CurrencyAmount.fromRawAmount(baseToken, baseReserve),
            CurrencyAmount.fromRawAmount(quoteToken, quoteReserve)
        )

        const price = new Price(baseToken, quoteToken, baseReserve, quoteReserve)
        const canInvertPrice = Boolean(
            price && price.baseCurrency && price.quoteCurrency && !price.baseCurrency.equals(price.quoteCurrency))
        const _basePrice = price?.toSignificant(6)
        const _quotePrice = canInvertPrice ? price?.invert()?.toSignificant(6) : undefined

        console.log("ERSAN BASE", _basePrice, "QUOTe", _quotePrice)

        try {
            var _tradeInfo
            if (isBase) {
                const baseAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(baseToken, JSBI.BigInt(ethers.utils.parseUnits(baseInputValue, baseToken.decimals).toString()));
                _tradeInfo = new Trade(
                    new Route([exchangePair], baseToken, quoteToken),
                    CurrencyAmount.fromRawAmount(baseToken, baseAmount.quotient),
                    TradeType.EXACT_INPUT
                )
                setQuoteInputValue(_tradeInfo.outputAmount.toSignificant())
            } else {
                const quoteAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(quoteToken, JSBI.BigInt(ethers.utils.parseUnits(quoteInputValue, quoteToken.decimals).toString()));
                _tradeInfo = new Trade(
                    new Route([exchangePair], baseToken, quoteToken),
                    CurrencyAmount.fromRawAmount(quoteToken, quoteAmount.quotient),
                    TradeType.EXACT_OUTPUT
                )
                setBaseInputValue(_tradeInfo.inputAmount.toSignificant())

            }
            setTradeInfo(_tradeInfo)

            console.log("exactIn", isBase ? "EXACT_INPUT" : "EXACT_OUTPUT");

            console.log("priceImpactFirst", _tradeInfo.priceImpact.toFixed(2));

            console.log("inputAmount", _tradeInfo.inputAmount.toSignificant());
            console.log("outputAmount", _tradeInfo.outputAmount.toSignificant());
            console.log("outputAmount22", _tradeInfo.outputAmount.toExact());

            console.log("executionPrice", _tradeInfo.executionPrice.toSignificant());
            console.log("executionPriceEx", _tradeInfo.executionPrice.invert().toSignificant());
        } catch (e) {
            console.log(e);
            setTradeInfo(null)
        }

    }

    const checkAllowance = async (baseAsset, quoteAsset) => {
        if (!pairInfo) { return }
        if (!chainId) { return }
        if (!defaultAssets) { return }
        if ((!account)) {
            setBaseTokenAllowance(0)
            setQuoteTokenAllowance(0)
            return;
        }

        let baseTokenERC = ERC20Contract(baseAsset);
        let quoteTokenERC = ERC20Contract(quoteAsset);
        const _baseAllowanceAmount = await baseTokenERC.allowance(account, EXCHANGE.address);
        const _quoteAllowanceAmount = await quoteTokenERC.allowance(account, EXCHANGE.address);
        setQuoteTokenAllowance(_quoteAllowanceAmount)
        setBaseTokenAllowance(_baseAllowanceAmount)
    }

    const displayError = (message) => {
        let error = { message: message }
        setTransaction({ hash: '', summary: '', error: error });
        toggleError();
    }

    function toHex(currencyAmount: CurrencyAmount<Currency>) {
        return `0x${currencyAmount.quotient.toString(16)}`
    }


    const handleWrap = async () => {
        if (!baseAsset) { displayError("Please select base asset!"); return; }

        const baseVal = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);

        let fanToken = ERC20Contract(baseAsset.address);

        
        //const allowanceAmount = fanToken.allowance()
        
        toggleLoading();
        await fanToken.approve(FANTOKENWRAPPER.address, baseVal, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${FANTOKENWRAPPER.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });
        
            
        
        toggleLoading();
        await FANTOKENWRAPPER.wrap(account,baseAsset.address,baseVal).then(async (tx) => {
            await tx.wait();
            const summary = `Wrapping : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });

    }

    const handleUnWrap = async () => {
        if (!baseAsset) { displayError("Please select base asset!"); return; }



        let FAN_TOKEN_ADDRESS = "0x7B9d4199368CA5F567999Fc35Aa3F6f86b18D2F2"
        let fanToken = ERC20Contract(FAN_TOKEN_ADDRESS);
        const fanTokenDecimals = await fanToken.decimals();

        const baseVal = ethers.utils.parseUnits(baseInputValue, fanTokenDecimals);

        
        //const allowanceAmount = fanToken.allowance()
        
        toggleLoading();
        await fanToken.approve(FANTOKENWRAPPER.address, baseVal, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${FANTOKENWRAPPER.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });
        
            
        
        toggleLoading();
        await FANTOKENWRAPPER.unwrap(account,FAN_TOKEN_ADDRESS,baseVal).then(async (tx) => {
            await tx.wait();
            const summary = `Wrapping : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });

    }

    const handleSwap = async () => {
        if (!baseAsset) { displayError("Please select base asset!"); return; }
        if (!quoteAsset) { displayError("Please select quote asset!"); return; }
        if (!pairInfo) { displayError("Pair not found!"); return; }
        if (!pairInfo.valid) { displayError("Pair isnt exits!"); return; }
        if (!hasLiquidity) { displayError("No liquidity avalialable!"); return; }
        if (baseInputValue === "") { displayError("Input amount not valid!"); return; }
        if (quoteInputValue === "") { displayError("Input amount not valid!"); return; }
        if (tradeInfo === null) { displayError("Input or output is amount not valid!"); return; }


        if (BLACK_LIST.includes(baseAsset.address)) {
            displayError("Under Maintenance!"); return;
        }


        if (BLACK_LIST.includes(quoteAsset.address)) {
            displayError("Under Maintenance!"); return;
        }

        if (BLACK_LIST.includes(account)) {
            displayError("Account is blacklisted!"); return;
        }


 


        
        if (parseFloat(tradeInfo.priceImpact.toFixed(2)) > 5) {
            displayError("A swap of this size may have a high price impact, given the current liquidity in the pool. There may be a large difference between the amount of your input token and what you will receive in the output token");
            return
        }
        

        const DEFAULT_ADD_SLIPPAGE_TOLERANCE = new Percent(userSlippageTolerance, 10_000)


        const etherIn = baseAsset.address === ETHER_ADDRESS
        const etherOut = quoteAsset.address === ETHER_ADDRESS

        if ([baseAsset.address, quoteAsset.address].includes("0x9631be8566fC71d91970b10AcfdEe29F21Da6C27")) {
            setTransaction({ hash: '', summary: '', error: {message:"Unsupported Asset! Please Migrate IMON to KWL!"} });
            toggleError();
            return;
        }
        

        const amountIn: string = toHex(tradeInfo.maximumAmountIn(DEFAULT_ADD_SLIPPAGE_TOLERANCE))
        const amountOut: string = toHex(tradeInfo.minimumAmountOut(DEFAULT_ADD_SLIPPAGE_TOLERANCE))

        console.log("TradeInfo", tradeInfo)
        console.log("amountIn", amountIn)
        console.log("amountOut", amountOut)
        console.log("etherIn", etherIn)
        console.log("etherOut", etherOut)

        const addressTo = account
        const deadline = moment().utc().unix() + (userDeadline)


        const path: string[] = tradeInfo.route.path.map((token: Token) => token.address)
        toggleLoading();
        switch (tradeInfo.tradeType) {
            case TradeType.EXACT_INPUT:
                if (etherIn) {
                    let overrides = { value: amountIn }

                    if(userTax){
                        console.log("input,etherIn,tax,swapExactETHForTokensSupportingFeeOnTransferTokens")
                        await EXCHANGE.swapExactETHForTokensSupportingFeeOnTransferTokens(amountOut, path, addressTo, deadline, overrides).then(async (tx) => {
                            await tx.wait();
                            const summary = `Trading : ${tx.hash}`
                            setTransaction({ hash: tx.hash, summary: summary, error: null });
                            toggleTransactionSuccess();
                        }).catch((error: Error) => {
                            setTransaction({ hash: '', summary: '', error: error });
                            toggleError();
                        }).finally(async () => {
                            toggleLoading();
                            fetchPrice();
                        });
                    }else{
                        console.log("input,etherIn,tax,swapExactETHForTokens")
                        await EXCHANGE.swapExactETHForTokens(amountOut, path, addressTo, deadline, overrides).then(async (tx) => {
                            await tx.wait();
                            const summary = `Trading : ${tx.hash}`
                            setTransaction({ hash: tx.hash, summary: summary, error: null });
                            toggleTransactionSuccess();
                        }).catch((error: Error) => {
                            setTransaction({ hash: '', summary: '', error: error });
                            toggleError();
                        }).finally(async () => {
                            toggleLoading();
                            fetchPrice();
                        }); 
                    }

               
                } else if (etherOut) {
                    if(userTax){
                        console.log("input,etherOut,taxOn,swapExactTokensForETHSupportingFeeOnTransferTokens")
                        await EXCHANGE.swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOut, path, addressTo, deadline).then(async (tx) => {
                            await tx.wait();
                            const summary = `Trading : ${tx.hash}`
                            setTransaction({ hash: tx.hash, summary: summary, error: null });
                            toggleTransactionSuccess();
                        }).catch((error: Error) => {
                            setTransaction({ hash: '', summary: '', error: error });
                            toggleError();
                        }).finally(async () => {
                            toggleLoading();
                            fetchPrice();
                        }); 
                    }
                    else
                    {
                        console.log("input,etherOut,taxOf,swapExactTokensForETH")
                            await EXCHANGE.swapExactTokensForETH(amountIn, amountOut, path, addressTo, deadline).then(async (tx) => {
                                await tx.wait();
                                const summary = `Trading : ${tx.hash}`
                                setTransaction({ hash: tx.hash, summary: summary, error: null });
                                toggleTransactionSuccess();
                            }).catch((error: Error) => {
                                setTransaction({ hash: '', summary: '', error: error });
                                toggleError();
                            }).finally(async () => {
                                toggleLoading();
                                fetchPrice();
                            });
                    }

            
                } else {
                    if(userTax){
                        console.log("input,tokenToken,taxOn,swapExactTokensForTokensSupportingFeeOnTransferTokens")
                        await EXCHANGE.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, amountOut, path, addressTo, deadline).then(async (tx) => {
                            await tx.wait();
                            const summary = `Trading : ${tx.hash}`
                            setTransaction({ hash: tx.hash, summary: summary, error: null });
                            toggleTransactionSuccess();
                        }).catch((error: Error) => {
                            setTransaction({ hash: '', summary: '', error: error });
                            toggleError();
                        }).finally(async () => {
                            toggleLoading();
                            fetchPrice();
                        });
                    }else{
                        console.log("input,tokenToken,taxOff,swapExactTokensForTokensSupportingFeeOnTransferTokens")
                        await EXCHANGE.swapExactTokensForTokens(amountIn, amountOut, path, addressTo, deadline).then(async (tx) => {
                            await tx.wait();
                            const summary = `Trading : ${tx.hash}`
                            setTransaction({ hash: tx.hash, summary: summary, error: null });
                            toggleTransactionSuccess();
                        }).catch((error: Error) => {
                            setTransaction({ hash: '', summary: '', error: error });
                            toggleError();
                        }).finally(async () => {
                            toggleLoading();
                            fetchPrice();
                        });
                    }
                 
                }
                break
            case TradeType.EXACT_OUTPUT:
                if (etherIn) {
                    let overrides = { value: amountIn }
                    await EXCHANGE.swapETHForExactTokens(amountOut, path, addressTo, deadline, overrides).then(async (tx) => {
                        await tx.wait();
                        const summary = `Trading : ${tx.hash}`
                        setTransaction({ hash: tx.hash, summary: summary, error: null });
                        toggleTransactionSuccess();
                    }).catch((error: Error) => {
                        setTransaction({ hash: '', summary: '', error: error });
                        toggleError();
                    }).finally(async () => {
                        toggleLoading();
                        fetchPrice();
                    });
                } else if (etherOut) {

                    await EXCHANGE.swapTokensForExactETH(amountOut, amountIn, path, addressTo, deadline).then(async (tx) => {
                        await tx.wait();
                        const summary = `Trading : ${tx.hash}`
                        setTransaction({ hash: tx.hash, summary: summary, error: null });
                        toggleTransactionSuccess();
                    }).catch((error: Error) => {
                        setTransaction({ hash: '', summary: '', error: error });
                        toggleError();
                    }).finally(async () => {
                        toggleLoading();
                        fetchPrice();
                    });
                } else {

                    await EXCHANGE.swapTokensForExactTokens(amountOut, amountIn, path, addressTo, deadline).then(async (tx) => {
                        await tx.wait();
                        const summary = `Trading : ${tx.hash}`
                        setTransaction({ hash: tx.hash, summary: summary, error: null });
                        toggleTransactionSuccess();
                    }).catch((error: Error) => {
                        setTransaction({ hash: '', summary: '', error: error });
                        toggleError();
                    }).finally(async () => {
                        toggleLoading();
                        fetchPrice();
                    });
                }
                break
        }

        fetchTokens();

    }

    useEffect(() => {
        if (!isSupportedChain(chainId)) {
            setBaseAsset(null)
            setQuoteAsset(null)
            setPairInfo(null)
        }
        fetchPrice()
    }, [chainId, account, defaultAssets, provider,baseAsset,quoteAsset,  baseInputValue, quoteInputValue])

    const handleApprove = async (token) => {
        let poolToken = ERC20Contract(token);
        const tokenDecimals = await poolToken.decimals();
        const transferAmount = ethers.constants.MaxUint256
        toggleLoading();
        await poolToken.approve(EXCHANGE.address, transferAmount, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${EXCHANGE.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });

    }


    const handleSwapAssets = () => {
        const temp = baseAsset;
        setBaseAsset(quoteAsset);
        setQuoteAsset(temp)

    }

    const onSelectToken = (tokenInfo) => {
        isBase ? setBaseAsset(tokenInfo) : setQuoteAsset(tokenInfo)
        toggleSelectToken()
    }

    const handleSelectPair = (pair:any, base: any, quote: any) => {
        setBaseAsset(base);
        setQuoteAsset(quote);
        toggleSelectToken();
    }
    const isAllowanceRequired = () => {
        if (!baseAsset) {
            return false
        }
        if (baseAsset.address === ETHER_ADDRESS) {
            return false
        }
        if (!baseInputValue) {
            return false
        }
        let baseVal = parseEther("0");
        try {
            baseVal = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        } catch (e) {
            baseVal = parseEther("0")
        }
        return baseVal.gt(baseTokenAllowance)
    }

    return (
        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalSelectToken disableToken={!isBase ? baseAsset : quoteAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={handleSelectPair} allExchangePairs={allExchangePairs} />
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



            <div className="flex flex-col gap-3 sm:gap-4 w-full p-2 sm:p-0">
                {/* Input container */}
                <div className="relative p-2 sm:p-3 md:p-5 overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.02] to-transparent dark:from-violet-500/[0.05] dark:to-transparent backdrop-blur-2xl" />
                    <div className="absolute inset-0 border border-violet-500/[0.08] dark:border-violet-400/10 rounded-3xl" />
                    
                    <div className="relative p-3 sm:p-5 overflow-hidden">
                        {/* Base Asset Input - You Pay */}
                        <div className="space-y-2 sm:space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
                                        You Pay
                                    </span>
                                    <div className="hidden sm:flex px-2 py-0.5 text-[10px] rounded-full bg-violet-500/5 border border-violet-500/10">
                                        <span className="text-violet-600/70 dark:text-violet-300/70">Input</span>
                                    </div>
                                </div>
                                {baseAsset && (
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/[0.03] to-fuchsia-500/[0.03] border border-violet-500/10 backdrop-blur-sm group/token hover:from-violet-500/[0.05] hover:to-fuchsia-500/[0.05] transition-all duration-300">
                                        <div className="relative w-8 h-8 min-w-[32px] min-h-[32px] shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-sm animate-pulse-slow" />
                                            <Image 
                                                src={baseAsset.logoURI} 
                                                className="relative w-8 h-8 min-w-[32px] min-h-[32px] rounded-full object-cover"
                                                alt={baseAsset.symbol} 
                                            />
                                        </div>
                                        <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
                                            {baseAsset.symbol}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Input field container */}
                            <div className="group/input relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-2xl opacity-50 group-hover/input:opacity-100 blur-md transition-all duration-300" />
                                
                                {/* Background */}
                                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 rounded-2xl backdrop-blur-xl transition-colors duration-300" />
                                
                                {/* Border */}
                                <div className="absolute inset-0 rounded-2xl border border-violet-500/10 dark:border-violet-400/10 
                                    group-hover/input:border-violet-500/20 dark:group-hover/input:border-violet-400/20 
                                    group-focus-within/input:border-violet-500/30 dark:group-focus-within/input:border-violet-400/30 
                                    transition-colors duration-300" />

                                <div className="relative flex items-center p-3">
                                    <input
                                        type="text"
                                        value={baseInputValue}
                                        onChange={(e) => setInputValue(e.target.value, true)}
                                        placeholder="0.00"
                                        className="w-full bg-transparent text-xl sm:text-2xl font-semibold text-violet-950 dark:text-violet-100 outline-none 
                                            placeholder:text-violet-400/20 dark:placeholder:text-violet-300/20"
                                    />
                                    
                                    {/* Token selector button */}
                                    <Button
                                        className="h-9 sm:h-10 min-w-fit px-3 sm:px-4 bg-violet-500/[0.05] hover:bg-violet-500/10 
                                            active:scale-95 transition-all duration-200 group/btn text-sm sm:text-base rounded-full"
                                        variant="flat"
                                        onPress={() => {
                                            setIsBase(true)
                                            toggleSelectToken()
                                        }}
                                    >
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            {baseAsset && (
                                                <>
                                                    <Image 
                                                        src={baseAsset.logoURI} 
                                                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full" 
                                                    />
                                                    <span className="font-medium text-violet-600 dark:text-violet-300">
                                                        {baseAsset.symbol}
                                                    </span>
                                                </>
                                            )}
                                            <ChevronDown className="w-4 h-4 text-violet-500/70 ml-1" />
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Balance display */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-1">
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Wallet2 className="w-3 h-3 sm:w-4 sm:h-4 text-violet-500/50 dark:text-violet-400/50" />
                                    <span className="text-violet-600/70 dark:text-violet-300/70">
                                        Balance: {baseAsset?.balance}
                                    </span>
                                </div>
                                
                                {/* Quick amount buttons */}
                                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                                    {[25, 50, 75, 100].map((percent) => (
                                        <Button
                                            key={percent}
                                            className="h-7 min-w-[48px] bg-gradient-to-r from-violet-500/[0.03] to-fuchsia-500/[0.03]
                                                hover:from-violet-500/[0.08] hover:to-fuchsia-500/[0.08]
                                                active:scale-95 transition-all duration-200 group/btn
                                                relative overflow-hidden border border-violet-500/10 dark:border-violet-400/10
                                                hover:border-violet-500/20 dark:hover:border-violet-400/20
                                                backdrop-blur-sm"
                                            variant="flat"
                                            onPress={() => {
                                                if (baseAsset?.balance) {
                                                    const balance = parseFloat(baseAsset.balance);
                                                    const amount = (balance * percent / 100).toString();
                                                    setInputValue(amount, true);
                                                }
                                            }}
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

                        {/* Swap button - Improved positioning and styling */}
                        <div className="relative my-6 sm:my-8">
                            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                <div className="relative group/swap-btn">
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 rounded-full opacity-0 group-hover/swap-btn:opacity-70 blur-md transition-opacity duration-300" />
                                    
                                    <Button
                                        className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-black backdrop-blur-xl border border-violet-500/20 
                                            hover:border-violet-500/40 rounded-full relative
                                            active:scale-95 transition-all duration-200"
                                        variant="flat"
                                        isIconOnly
                                        onPress={handleSwapAssets}
                                    >
                                        <ArrowUpDown className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 dark:text-violet-300 
                                            group-hover/swap-btn:rotate-180 transition-transform duration-300" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Quote Asset Input - You Receive */}
                        <div className="space-y-2 sm:space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
                                        You Receive
                                    </span>
                                    <div className="hidden sm:flex px-2 py-0.5 text-[10px] rounded-full bg-violet-500/5 border border-violet-500/10">
                                        <span className="text-violet-600/70 dark:text-violet-300/70">Output</span>
                                    </div>
                                </div>
                                {quoteAsset && (
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/[0.03] to-fuchsia-500/[0.03] border border-violet-500/10 backdrop-blur-sm group/token hover:from-violet-500/[0.05] hover:to-fuchsia-500/[0.05] transition-all duration-300">
                                        <div className="relative w-8 h-8 min-w-[32px] min-h-[32px] shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-sm animate-pulse-slow" />
                                            <Image 
                                                src={quoteAsset.logoURI} 
                                                className="relative w-8 h-8 min-w-[32px] min-h-[32px] rounded-full object-cover"
                                                alt={quoteAsset.symbol} 
                                            />
                                        </div>
                                        <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
                                            {quoteAsset.symbol}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Quote Input field container */}
                            <div className="group/input relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-2xl opacity-50 group-hover/input:opacity-100 blur-md transition-all duration-300" />
                                
                                {/* Background */}
                                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 rounded-2xl backdrop-blur-xl transition-colors duration-300" />
                                
                                {/* Border */}
                                <div className="absolute inset-0 rounded-2xl border border-violet-500/10 dark:border-violet-400/10 
                                    group-hover/input:border-violet-500/20 dark:group-hover/input:border-violet-400/20 
                                    group-focus-within/input:border-violet-500/30 dark:group-focus-within/input:border-violet-400/30 
                                    transition-colors duration-300" />

                                <div className="relative flex items-center p-3">
                                    <input
                                        type="text"
                                        value={quoteInputValue}
                                        onChange={(e) => setInputValue(e.target.value, false)}
                                        placeholder="0.00"
                                        className="w-full bg-transparent text-xl sm:text-2xl font-semibold text-violet-950 dark:text-violet-100 outline-none 
                                            placeholder:text-violet-400/20 dark:placeholder:text-violet-300/20"
                                    />
                                    
                                    {/* Token selector button */}
                                    <Button
                                        className="h-9 sm:h-10 min-w-fit px-3 sm:px-4 bg-violet-500/[0.05] hover:bg-violet-500/10 
                                            active:scale-95 transition-all duration-200 group/btn text-sm sm:text-base rounded-full"
                                        variant="flat"
                                        onPress={() => {
                                            setIsBase(false)
                                            toggleSelectToken()
                                        }}
                                    >
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            {quoteAsset && (
                                                <>
                                                    <Image 
                                                        src={quoteAsset.logoURI} 
                                                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full" 
                                                    />
                                                    <span className="font-medium text-violet-600 dark:text-violet-300">
                                                        {quoteAsset.symbol}
                                                    </span>
                                                </>
                                            )}
                                            <ChevronDown className="w-4 h-4 text-violet-500/70 ml-1" />
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Balance display */}
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <Wallet2 className="w-4 h-4 text-violet-500/50 dark:text-violet-400/50" />
                                    <span className="text-sm text-violet-600/70 dark:text-violet-300/70">
                                        Balance: {quoteAsset?.balance}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trade Info Section */}
                {tradeInfo && (
                    <div className="space-y-2 sm:space-y-3">
                        {/* Quick Info Card - New section for price and liquidity */}
                        <div className="w-full rounded-xl sm:rounded-2xl bg-white/50 dark:bg-black/40 backdrop-blur-xl 
                            border border-violet-500/10 dark:border-violet-400/10 p-2 sm:p-3">
                            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                                {/* Price Info */}
                                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full 
                                    text-[10px] sm:text-xs">
                                    <div className="flex items-center gap-1">
                                        <Image src={baseAsset?.logoURI} className="w-5 h-5 rounded-full" alt={baseAsset?.symbol} />
                                        <span className="text-xs font-medium text-violet-600/70 dark:text-violet-300/70">
                                            1 {baseAsset?.symbol}
                                        </span>
                                    </div>
                                    <span className="text-xs text-violet-500/50">=</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-violet-600/70 dark:text-violet-300/70">
                                            {tradeInfo.executionPrice.toSignificant()}
                                        </span>
                                        <Image src={quoteAsset?.logoURI} className="w-5 h-5 rounded-full" alt={quoteAsset?.symbol} />
                                        <span className="text-xs font-medium text-violet-600/70 dark:text-violet-300/70">
                                            {quoteAsset?.symbol}
                                        </span>
                                    </div>
                                </div>

                                {/* Liquidity Info */}
                                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full 
                                    text-[10px] sm:text-xs">
                                    <span className="text-xs text-violet-600/70 dark:text-violet-300/70">Liquidity:</span>
                                    <div className="flex items-center gap-1">
                                        <Image src={baseAsset?.logoURI} className="w-5 h-5 rounded-full" alt={baseAsset?.symbol} />
                                        <span className="text-xs font-medium text-violet-600/70 dark:text-violet-300/70">
                                            {baseLiquidity}
                                        </span>
                                    </div>
                                    <span className="text-xs text-violet-500/50">|</span>
                                    <div className="flex items-center gap-1">
                                        <Image src={quoteAsset?.logoURI} className="w-5 h-5 rounded-full" alt={quoteAsset?.symbol} />
                                        <span className="text-xs font-medium text-violet-600/70 dark:text-violet-300/70">
                                            {quoteLiquidity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trade Info Card */}
                        <div className="w-full rounded-2xl bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-violet-500/10 dark:border-violet-400/10 p-4">
                            <div className="space-y-4">
                                {/* Price Impact */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-violet-600/70 dark:text-violet-300/70">
                                        Price Impact
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 rounded-full bg-violet-500/10 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    parseFloat(tradeInfo.priceImpact.toFixed(2)) > 5 
                                                    ? 'bg-red-500' 
                                                    : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                                                }`}
                                                style={{ width: `${Math.min(parseFloat(tradeInfo.priceImpact.toFixed(2)) * 10, 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-semibold ${
                                            parseFloat(tradeInfo.priceImpact.toFixed(2)) > 5 
                                            ? 'text-red-500' 
                                            : 'text-violet-600 dark:text-violet-300'
                                        }`}>
                                            {tradeInfo.priceImpact.toFixed(2)}%
                                        </span>
                                    </div>
                                    {parseFloat(tradeInfo.priceImpact.toFixed(2)) > 5 && (
                                        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <span className="text-xs text-red-500">
                                                High price impact! You may receive significantly less than expected.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-violet-500/10" />

                                {/* Price Rate */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-violet-600/70 dark:text-violet-300/70">
                                        Price Rate
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-500/[0.02] border border-violet-500/10">
                                            <div className="flex items-center gap-1.5">
                                                <Image src={baseAsset?.logoURI} className="w-6 h-6 rounded-full" alt={baseAsset?.symbol} />
                                                <span className="text-sm font-medium text-violet-900 dark:text-violet-100">
                                                    1 {baseAsset?.symbol} =
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-medium text-violet-900 dark:text-violet-100">
                                                    {tradeInfo.executionPrice.toSignificant()}
                                                </span>
                                                <Image src={quoteAsset?.logoURI} className="w-6 h-6 rounded-full" alt={quoteAsset?.symbol} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-500/[0.02] border border-violet-500/10">
                                            <div className="flex items-center gap-1.5">
                                                <Image src={quoteAsset?.logoURI} className="w-6 h-6 rounded-full" alt={quoteAsset?.symbol} />
                                                <span className="text-sm font-medium text-violet-900 dark:text-violet-100">
                                                    1 {quoteAsset?.symbol} =
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-medium text-violet-900 dark:text-violet-100">
                                                    {tradeInfo.executionPrice.invert().toSignificant()}
                                                </span>
                                                <Image src={baseAsset?.logoURI} className="w-6 h-6 rounded-full" alt={baseAsset?.symbol} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-violet-500/10" />

                                {/* Liquidity Info */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-violet-600/70 dark:text-violet-300/70">
                                        Available Liquidity
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-500/[0.02] border border-violet-500/10">
                                            <Image src={baseAsset?.logoURI} className="w-6 h-6 rounded-full" alt={baseAsset?.symbol} />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-violet-900 dark:text-violet-100">
                                                    {baseLiquidity}
                                                </span>
                                                <span className="text-xs text-violet-600/70 dark:text-violet-300/70">
                                                    {baseAsset?.symbol}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-500/[0.02] border border-violet-500/10">
                                            <Image src={quoteAsset?.logoURI} className="w-6 h-6 rounded-full" alt={quoteAsset?.symbol} />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-violet-900 dark:text-violet-100">
                                                    {quoteLiquidity}
                                                </span>
                                                <span className="text-xs text-violet-600/70 dark:text-violet-300/70">
                                                    {quoteAsset?.symbol}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            {isAllowanceRequired() && (
                                <Button
                                    className="w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-violet-500 to-fuchsia-500 
                                        text-white font-semibold rounded-xl sm:rounded-2xl"
                                    onPress={() => handleApprove(baseAsset.address)}
                                >
                                    Approve {baseAsset?.symbol}
                                </Button>
                            )}

                            {account ? (
                                <Button
                                    className="w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-violet-500 to-fuchsia-500 
                                        text-white font-semibold rounded-xl sm:rounded-2xl"
                                    onPress={handleSwap}
                                    disabled={!pairInfo?.valid || !hasLiquidity || isAllowanceRequired()}
                                >
                                    {!pairInfo?.valid ? "Insufficient Liquidity" : "Swap"}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-violet-500 to-fuchsia-500 
                                        text-white font-semibold rounded-xl sm:rounded-2xl"
                                    onPress={toggleConnectModal}
                                >
                                    Connect Wallet
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
          
        </>
    );
}
export const SWAP_TAB = memo(_SWAP_TAB)

