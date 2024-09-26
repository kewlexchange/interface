import React, { memo, useEffect, useMemo, useState } from 'react';
import { DECENTRALIZED_EXCHANGES, DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, TradeType } from '../../../constants/misc';
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
import { Accordion, AccordionItem, Avatar, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Image, ScrollShadow, Select, SelectItem } from '@nextui-org/react';
import { formatEther, parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';
import { RadioGroup, Radio, useRadio, VisuallyHidden, cn } from "@nextui-org/react";
import { isAddress } from '@ethersproject/address';



const _ARBITRAGE_TAB = () => {

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

    const [tradingPairs, setTradingPairs] = useState([])

    const [pairInfo, setPairInfo] = useState(null)
    const PAIRContract = usePAIRContract()
    const [hasLiquidity, setHasLiquidity] = useState(false)
    const [tradeInfo, setTradeInfo] = useState(null)
    const userDeadline = useAppSelector((state) => state.user.userDeadline);
    const userTax = useAppSelector((state) => state.user.userTax);
    const userSlippageTolerance = useAppSelector((state) => state.user.userSlippageTolerance);
    const [allExchangePairs, setAllExchangePairs]: any = useState(null)
    const [isLoaded, setLoaded] = useState(false)
    const { fetchTokens } = useFetchAllTokenList(chainId, account);

    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        const kwlToken = defaultAssets.find(token => token && token.symbol === "KWL");
        if (kwlToken) {
            setQuoteAsset(kwlToken);
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


    useEffect(() => {
        fetchTokens()
    }, [account])


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
        setTradingPairs([])
    }
    const fetchPrice = async () => {
        setLoaded(false)
        setTradingPairs([])
        if (!chainId) { return }
        if (!baseAsset) { return }
        if (!quoteAsset) { return }


        if (!isSupportedChain(chainId)) {
            return;
        }

        let _baseAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address
        let _quoteAddress = quoteAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : quoteAsset.address

        var _baseTokenBalance: any = 0;
        var _quoteTokenBalance: any = 0;

        if (account) {
            if ((baseAsset.address != ETHER_ADDRESS) && (quoteAsset.address != ETHER_ADDRESS)) {
                const BaseERC20Token = ERC20Contract(baseAsset.address)
                _baseTokenBalance = await BaseERC20Token.balanceOf(account);
                const QuoteERC20Token = ERC20Contract(quoteAsset.address)
                _quoteTokenBalance = await QuoteERC20Token.balanceOf(account);
            } else {
                if (baseAsset.address == ETHER_ADDRESS) {
                    _baseTokenBalance = await provider.getBalance(account);
                    const QuoteERC20Token = ERC20Contract(quoteAsset.address)
                    _quoteTokenBalance = await QuoteERC20Token.balanceOf(account);
                } else if (quoteAsset.address == ETHER_ADDRESS) {
                    _quoteTokenBalance = await provider.getBalance(account);
                    const BaseERC20Token = ERC20Contract(baseAsset.address)
                    _baseTokenBalance = await BaseERC20Token.balanceOf(account);
                }
            }
        }


        const _allExchangePairs = await EXCHANGE.getAllPairs();
        setAllExchangePairs(_allExchangePairs)






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

        let depositAmount = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        const availableTradingPairs = await EXCHANGE.fetchPairs(DECENTRALIZED_EXCHANGES, FANTOKENWRAPPER.address, _baseAddress, _quoteAddress, depositAmount)
        setTradingPairs(availableTradingPairs)

        console.log('pairs', availableTradingPairs)
        setLoaded(true)


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






        if (parseFloat(tradeInfo.priceImpact.toFixed(2)) > 15) {
            // displayError("A swap of this size may have a high price impact, given the current liquidity in the pool. There may be a large difference between the amount of your input token and what you will receive in the output token");
            //  return
        }


        const DEFAULT_ADD_SLIPPAGE_TOLERANCE = new Percent(userSlippageTolerance, 10_000)


        const etherIn = baseAsset.address === ETHER_ADDRESS
        const etherOut = quoteAsset.address === ETHER_ADDRESS

        if ([baseAsset.address, quoteAsset.address].includes("0x9631be8566fC71d91970b10AcfdEe29F21Da6C27")) {
            setTransaction({ hash: '', summary: '', error: { message: "Unsupported Asset! Please Migrate IMON to KWL!" } });
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

                    if (userTax) {
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
                    } else {
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
                    if (userTax) {
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
                    else {
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
                    if (userTax) {
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
                    } else {
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

    }

    useEffect(() => {
        if (!isSupportedChain(chainId)) {
            setBaseAsset(null)
            setQuoteAsset(null)
            setPairInfo(null)
        }
        fetchPrice()
    }, [chainId, account, defaultAssets, provider, baseAsset, quoteAsset, baseInputValue, quoteInputValue])

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


    const handleSwapAssets = async () => {
        setPairInfo(null)
        const temp = baseAsset;
        setBaseAsset(quoteAsset);
        setQuoteAsset(temp)


    }

    const onSelectToken = (tokenInfo) => {
        isBase ? setBaseAsset(tokenInfo) : setQuoteAsset(tokenInfo)
        toggleSelectToken()
    }

    const handleSelectPair = (pair: any, base: any, quote: any) => {
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

    const getDexNameByRouterAddress = (router: any) => {
        console.log("DEX", router)
        const exchange = DECENTRALIZED_EXCHANGES.find(exchange => exchange?.router?.toLowerCase() === router?.toLowerCase());
        return exchange ? exchange.dex : null;
    }

    const PairInfo = (props: { pair: any }) => {

        const [tradeInfo, setTradeInfo] = useState(null)
        const [baseLiquidity, setBaseLiquidity] = useState("0")
        const [quoteLiquidity, setQuoteLiquidity] = useState("0")
        const [outputAmount, setOutputAmount] = useState("0")
        const [isTradable, setIsTradable] = useState(true)


        const handleSwap = async () => {
            toggleLoading();

            let DEPOSIT_AMOUNT = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals)
            let INPUT_TOKEN = baseAsset.address === ETHER_ADDRESS ? props.pair.weth : baseAsset.address;
            let IS_NATIVE = baseAsset.address == ETHER_ADDRESS
            let SwapParam = {
                amount: DEPOSIT_AMOUNT,
                weth9: props.pair.weth,
                wrapper: FANTOKENWRAPPER.address,
                pair: props.pair.pair,
                input: INPUT_TOKEN
            }
            let overrides = {
                value: IS_NATIVE ? DEPOSIT_AMOUNT : 0
            }

            if ((!IS_NATIVE) && (SwapParam.input != ethers.constants.AddressZero)) {
                const tokenContract = ERC20Contract(SwapParam.input);

                const allowance = await tokenContract.allowance(account, EXCHANGE.address);
                if (allowance.lt(DEPOSIT_AMOUNT)) {
                    const approveTx = await tokenContract.approve(EXCHANGE.address, ethers.constants.MaxUint256)
                    await approveTx.wait();
                }

            }

            await EXCHANGE.swap(SwapParam, overrides).then(async (tx) => {
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
        useEffect(() => {




            if (parseFloatWithDefault(baseInputValue, 0) === 0) {
                return
            }

            let _selectedBaseAddress = baseAsset.address === ETHER_ADDRESS ? props.pair.weth : baseAsset.address
            let _selectedQuoteAddress = quoteAsset.address === ETHER_ADDRESS ? props.pair.weth : quoteAsset.address

            let selectedBase
            let selectedQuote

            if (_selectedBaseAddress == props.pair.weth) {
                [selectedBase, selectedQuote] = _selectedBaseAddress == props.pair.token0 ? [props.pair.token0, props.pair.token1] : [props.pair.token1, props.pair.token0]
            } else if (_selectedQuoteAddress == props.pair.weth) {

                [selectedBase, selectedQuote] = _selectedQuoteAddress == props.pair.token0 ? [props.pair.token1, props.pair.token0] : [props.pair.token0, props.pair.token1]
            } else {
                [selectedBase, selectedQuote] = [_selectedBaseAddress, _selectedQuoteAddress]
            }

            let _baseAddress = selectedBase;
            let _quoteAddress = selectedQuote;

            console.log("base", _baseAddress, "quote", _quoteAddress)


            let _baseDecimals = props.pair.token0 == _baseAddress ? props.pair.token0Decimals : props.pair.token1Decimals
            let _quoteDecimals = props.pair.token1 == _quoteAddress ? props.pair.token1Decimals : props.pair.token0Decimals


            const baseToken = new Token(baseAsset.chainId, _baseAddress, _baseDecimals.toNumber(), baseAsset.symbol)
            const quoteToken = new Token(quoteAsset.chainId, _quoteAddress, _quoteDecimals.toNumber(), quoteAsset.symbol)

            const [baseReserve, quoteReserve] = _baseAddress == props.pair.token0 ? [props.pair.reserve0, props.pair.reserve1] : [props.pair.reserve1, props.pair.reserve0]

            const exchangePair = new Pair(
                CurrencyAmount.fromRawAmount(baseToken, baseReserve),
                CurrencyAmount.fromRawAmount(quoteToken, quoteReserve)
            )

            try {

                const baseAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(baseToken, JSBI.BigInt(ethers.utils.parseUnits(baseInputValue, _baseDecimals).toString()));

                let _tradeInfo = new Trade(
                    new Route([exchangePair], baseToken, quoteToken),
                    CurrencyAmount.fromRawAmount(baseToken, baseAmount.quotient),
                    TradeType.EXACT_INPUT
                )

                setTradeInfo(_tradeInfo)
                setBaseLiquidity(CurrencyAmount.fromRawAmount(baseToken, baseReserve).toSignificant(6))
                setQuoteLiquidity(CurrencyAmount.fromRawAmount(quoteToken, quoteReserve).toSignificant(6))
            } catch (ex) {
                console.log("EXCEPTION", ex)
                setIsTradable(false)
            }

        }, [props.pair])

        const getOutputAmount = () => {
            var output = 0
            if (tradeInfo) {
                let price = parseFloat(tradeInfo.executionPrice.toSignificant());
                let baseInput = parseFloat(baseInputValue);
                output = price * baseInput

            }
            return (output).toFixed(6)
        }

        return (

            isTradable && tradeInfo && <div className={"w-full flex flex-col  text-center gap-2"}>

                <div className='w-full flex flex-row gap-2 items-start justify-between'>
                    <div className='flex flex-row justify-center gap-2 rounded-lg bg-danger-500/30 text-danger text-center text-xs p-2'>

                        <div className={"rounded-lg p-1 text-center"}>
                            <span>{getDexNameByRouterAddress(props.pair.router)}
                            </span>                        
                        </div>
                        <div className={"bg-danger-500 text-white rounded-lg p-1 text-center"}>
                            <small className={"text-center"}>{tradeInfo.priceImpact.toFixed(2)}%</small>
                        </div>
                    </div>
                    <div className='rounded-lg bg-green-600 animate-pulse bg-success-500/30 text-success  text-xs p-2 text-end'>{getOutputAmount()} {quoteAsset.symbol}</div>


                </div>
                <div className='w-full flex flex-row items-between justify-between '>
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='w-full items-start justify-center flex flex-col'>
                            <span className={"text-left text-xs w-full"}>Liquidity</span>

                            <div className='rounded-lg  flex flex-col w-full'>
                                <div className="flex items-center justify-start gap-2 px-2">
                                    <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                    <small className={"w-full text-start py-2 text-xs"} >{baseLiquidity} {baseAsset?.symbol}</small>
                                </div>
                                <div className="flex items-center justify-start gap-2 px-2">
                                    <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                    <small className={"w-full text-start py-2 text-xs"} >{quoteLiquidity} {quoteAsset?.symbol}</small>
                                </div>
                            </div>
                        </div>

                        <div className='w-full items-start justify-center flex flex-col'>
                            <span className={"text-left text-xs w-full"}>Price</span>

                            <div className='rounded-lg flex flex-col w-full'>

                                <div className="flex items-center justify-start gap-2 px-2">
                                    <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                    <small className="py-2 text-xs">{tradeInfo.executionPrice.invert().toSignificant()} {baseAsset?.symbol} per {quoteAsset?.symbol}</small>
                                </div>
                                <div className="flex items-center justify-start gap-2 px-2">
                                    <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                    <small className="py-2 text-xs">{tradeInfo.executionPrice.toSignificant()}  {quoteAsset?.symbol} per {baseAsset?.symbol}</small>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>



            </div>


        )
    }

    const ArbitragePairInfo = (props: { pair: any }) => {

        const [tradeInfo, setTradeInfo] = useState(null)
        const [baseLiquidity, setBaseLiquidity] = useState("0")
        const [quoteLiquidity, setQuoteLiquidity] = useState("0")
        const [outputAmount, setOutputAmount] = useState("0")
        const [isTradable, setIsTradable] = useState(true)


        const handleSwap = async () => {
            toggleLoading();

            let DEPOSIT_AMOUNT = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals)
            let INPUT_TOKEN = baseAsset.address === ETHER_ADDRESS ? props.pair.weth : baseAsset.address;
            let IS_NATIVE = baseAsset.address == ETHER_ADDRESS
            let SwapParam = {
                amount: DEPOSIT_AMOUNT,
                weth9: props.pair.weth,
                wrapper: FANTOKENWRAPPER.address,
                pair: props.pair.pair,
                input: INPUT_TOKEN
            }
            let overrides = {
                value: IS_NATIVE ? DEPOSIT_AMOUNT : 0
            }

            if ((!IS_NATIVE) && (SwapParam.input != ethers.constants.AddressZero)) {
                const tokenContract = ERC20Contract(SwapParam.input);

                const allowance = await tokenContract.allowance(account, EXCHANGE.address);
                if (allowance.lt(DEPOSIT_AMOUNT)) {
                    const approveTx = await tokenContract.approve(EXCHANGE.address, ethers.constants.MaxUint256)
                    await approveTx.wait();
                }

            }

            await EXCHANGE.swap(SwapParam, overrides).then(async (tx) => {
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
        useEffect(() => {


            if (parseFloatWithDefault(baseInputValue, 0) === 0) {
                return
            }

            let _selectedBaseAddress = baseAsset.address === ETHER_ADDRESS ? props.pair.weth : baseAsset.address
            let _selectedQuoteAddress = quoteAsset.address === ETHER_ADDRESS ? props.pair.weth : quoteAsset.address

            let selectedBase
            let selectedQuote

            if (_selectedBaseAddress == props.pair.weth) {
                [selectedBase, selectedQuote] = _selectedBaseAddress == props.pair.token0 ? [props.pair.token0, props.pair.token1] : [props.pair.token1, props.pair.token0]
            } else if (_selectedQuoteAddress == props.pair.weth) {

                [selectedBase, selectedQuote] = _selectedQuoteAddress == props.pair.token0 ? [props.pair.token1, props.pair.token0] : [props.pair.token0, props.pair.token1]
            } else {
                [selectedBase, selectedQuote] = [_selectedBaseAddress, _selectedQuoteAddress]
            }

            let _baseAddress = selectedBase;
            let _quoteAddress = selectedQuote;

            console.log("base", _baseAddress, "quote", _quoteAddress)


            let _baseDecimals = props.pair.token0 == _baseAddress ? props.pair.token0Decimals : props.pair.token1Decimals
            let _quoteDecimals = props.pair.token1 == _quoteAddress ? props.pair.token1Decimals : props.pair.token0Decimals


            const baseToken = new Token(baseAsset.chainId, _baseAddress, _baseDecimals.toNumber(), baseAsset.symbol)
            const quoteToken = new Token(quoteAsset.chainId, _quoteAddress, _quoteDecimals.toNumber(), quoteAsset.symbol)

            const [baseReserve, quoteReserve] = _baseAddress == props.pair.token0 ? [props.pair.reserve0, props.pair.reserve1] : [props.pair.reserve1, props.pair.reserve0]

            const exchangePair = new Pair(
                CurrencyAmount.fromRawAmount(baseToken, baseReserve),
                CurrencyAmount.fromRawAmount(quoteToken, quoteReserve)
            )

            try {

                const baseAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(baseToken, JSBI.BigInt(ethers.utils.parseUnits(baseInputValue, _baseDecimals).toString()));

                let _tradeInfo = new Trade(
                    new Route([exchangePair], baseToken, quoteToken),
                    CurrencyAmount.fromRawAmount(baseToken, baseAmount.quotient),
                    TradeType.EXACT_INPUT
                )

                setTradeInfo(_tradeInfo)
                setBaseLiquidity(CurrencyAmount.fromRawAmount(baseToken, baseReserve).toSignificant(6))
                setQuoteLiquidity(CurrencyAmount.fromRawAmount(quoteToken, quoteReserve).toSignificant(6))
            } catch (ex) {
                console.log("EXCEPTION", ex)
                setIsTradable(false)
            }

        }, [props.pair])

        const getOutputAmount = () => {
            var output = 0
            if (tradeInfo) {
                let price = parseFloat(tradeInfo.executionPrice.toSignificant());
                let baseInput = parseFloat(baseInputValue);
                output = price * baseInput

            }
            return (output).toFixed(6)
        }

        return (

            isTradable && <Card isDisabled={!isTradable} fullWidth isHoverable className='flex flex-col gap-2'>
                <CardHeader>
                    <div className='w-full flex flex-row items-between justify-between '>
                        <div className='rounded-lg bg-danger-500/30 text-danger text-xs p-2'>{getDexNameByRouterAddress(props.pair.router)}</div>
                        <div className='rounded-lg bg-green-600 animate-pulse bg-success-500/30 text-success  text-xs p-2 text-end'>{getOutputAmount()} {quoteAsset.symbol}</div>
                    </div>
                </CardHeader>
                <CardBody>
                    {
                        tradeInfo && <div className={"w-full flex flex-col rounded-lg border border-default-100 p-2 text-center gap-2"}>

                            <div className='grid grid-cols-2 gap-2'>
                                <div className='w-full items-start justify-center flex flex-col'>
                                    <span className={"text-left text-xs w-full"}>Liquidity</span>

                                    <div className='rounded-lg border border-default-100  flex flex-col w-full'>
                                        <div className="flex items-center justify-start gap-2 px-2">
                                            <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                            <small className={"w-full text-start py-2 text-xs"} >{baseLiquidity} {baseAsset?.symbol}</small>
                                        </div>
                                        <div className="flex items-center justify-start gap-2 px-2">
                                            <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                            <small className={"w-full text-start py-2 text-xs"} >{quoteLiquidity} {quoteAsset?.symbol}</small>
                                        </div>
                                    </div>
                                </div>

                                <div className='w-full items-start justify-center flex flex-col'>
                                    <span className={"text-left text-xs w-full"}>Price</span>

                                    <div className='rounded-lg border border-default-100 flex flex-col w-full'>

                                        <div className="flex items-center justify-start gap-2 px-2">
                                            <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                            <small className="py-2 text-xs">{tradeInfo.executionPrice.invert().toSignificant()} {baseAsset?.symbol} per {quoteAsset?.symbol}</small>
                                        </div>
                                        <div className="flex items-center justify-start gap-2 px-2">
                                            <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                            <small className="py-2 text-xs">{tradeInfo.executionPrice.toSignificant()}  {quoteAsset?.symbol} per {baseAsset?.symbol}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={"w-full grid grid-cols-2 gap-2 justify-around rounded-lg border border-default-100 p-2 text-center"}>
                                <small className={"text-left"}>Price Impact</small>
                                <small className={"text-right"}>{tradeInfo.priceImpact.toFixed(2)}%</small>

                                {
                                    parseFloat(tradeInfo.priceImpact.toFixed(2)) > 5 &&
                                    <small className={"text-center bg-danger-500/10 text-danger-500 rounded-lg col-span-2 p-2"}>
                                        A swap of this size may have a high price impact, given the current liquidity in the pool. There may be a large difference between the amount of your input token and what you will receive in the output token
                                    </small>
                                }

                            </div>
                        </div>
                    }
                </CardBody>


            </Card>

        )
    }


    const TradeContainer = () => {
        const [selectedPair, setSelectedPair] = React.useState(null);

        const handleSelectionChange = (e) => {
            setSelectedPair(e.target.value);
        };

        useEffect(()=>{
            if(!isAddress(selectedPair)){
                return
            }

            fetchArbitragePairs()

        },[selectedPair])

        const fetchArbitragePairs = async() =>{
            
        }

        const handleSwapAll = async () => {
            toggleLoading();

            let DEPOSIT_AMOUNT = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals)
            let allSwapParams = [];
            let IS_NATIVE = baseAsset.address == ETHER_ADDRESS

            tradingPairs.forEach((pair) => {
                if (pair.valid) {

                    let INPUT_TOKEN = baseAsset.address === ETHER_ADDRESS ? pair.weth : baseAsset.address;
                    let swapParam = {
                        amount: DEPOSIT_AMOUNT,
                        weth9: pair.weth,
                        wrapper: FANTOKENWRAPPER.address,
                        pair: pair.pair,
                        input: INPUT_TOKEN
                    }
                    allSwapParams.push(swapParam);
                }
            });

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

        return (

            <div className='flex flex-col gap-2 w-full'>
                <Select
                    fullWidth
                    size='lg'
                    items={tradingPairs}
                    labelPlacement="outside"
                    selectedKeys={[selectedPair]}

                    onChange={handleSelectionChange}
                    placeholder="Please Select"
                    classNames={{
                        base: "min-h-[150px]",
                        trigger: "min-h-[140px]",
                    }}
                    renderValue={(pairs) => {
                        return pairs.map((pair: any) => (
                            <div key={pair.token0 + "-" + pair.token1} className="flex w-full items-center gap-2">

                                <PairInfo pair={pair.data} />
                            </div>
                        ));
                    }}
                >
                    {(pair) => (
                        pair.valid && <SelectItem  key={pair.pair} textValue={null}>
                            <ArbitragePairInfo key={pair.pair} pair={pair} />
                        </SelectItem>
                    )}
                </Select>

                <Button onClick={() => {
                    handleSwapAll();
                }} color='default' fullWidth>Swap All</Button>
            </div>
        );
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



            <div className="flex flex-col gap-2 rounded-xl w-full">
                <div className="w-full rounded-xl">
                    <div className="swap-inputs">
                        <div className="input sm:order-1">
                            <div onClick={() => {
                                setInputValue(baseAsset.balance, true)
                            }} className="balance cursor-pointer">
                                Balance: {baseAsset && baseAsset.balance}
                            </div>
                            <input value={baseInputValue} onChange={(e) => {
                                setInputValue(e.target.value, true)
                            }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false" />
                        </div>

                        <Card shadow='none' fullWidth className='my-3 flex flex-row gap-2'>
                            {
                                baseAsset && <Button size='lg' fullWidth className=" px-2" radius='full' variant="flat" color="default" onClick={() => {
                                    setIsBase(true)
                                    toggleSelectToken()
                                }} startContent={
                                    <div>
                                        <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={baseAsset && baseAsset.logoURI} />
                                    </div>
                                }
                                    endContent={
                                        <span translate={"no"} className="material-symbols-outlined ">
                                            expand_more
                                        </span>
                                    }
                                ><div className='w-full flex flex-col'>{baseAsset.symbol}</div>
                                </Button>
                            }

                            <Button isIconOnly size='lg' radius='full' color='default' variant='solid' onClick={() => {
                                handleSwapAssets()
                            }} className=" anim "
                            >
                                <span translate={"no"} className="material-symbols-outlined ">
                                    multiple_stop
                                </span>
                            </Button>

                            {
                                quoteAsset &&

                                <Button fullWidth size='lg' className="px-2" radius='full' variant="flat" color="default" onClick={() => {
                                    setIsBase(false)
                                    toggleSelectToken()
                                }} startContent={
                                    <div>
                                        <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={quoteAsset && quoteAsset.logoURI} />
                                    </div>
                                }
                                    endContent={
                                        <span translate={"no"} className="material-symbols-outlined ">
                                            expand_more
                                        </span>
                                    }
                                >
                                    <div className='w-full'>
                                        {quoteAsset.symbol}
                                    </div>
                                </Button>

                            }

                        </Card>


                    </div>
                </div>


                {
                    isLoaded && <TradeContainer />
                }



                <div className={"flex flex-col gap-2 w-full"}>
                    <div className={"w-full flex flex-col gap-2 rounded-lg"}>






                        {
                            pairInfo && pairInfo.valid && pairInfo.reserveBase == 0 && pairInfo.reserveQuote == 0 && <div className={"bg-red-500 text-white text-center w-full rounded-lg p-2"}>
                                {baseAsset?.symbol} x {quoteAsset?.symbol} No liquidity found!
                            </div>
                        }
                        {
                            pairInfo && !pairInfo.valid && <div className={"flex flex-col gap-2 text-white text-center w-full rounded-lg"}>
                                <Card className={"w-full rounded-lg flex flex-row items-center justify-start gap-2 p-2"}>
                                    <DoubleCurrencyIcon baseIcon={baseAsset?.logoURI} quoteIcon={quoteAsset?.logoURI} />
                                    <span className={"text-red-500"}>{baseAsset?.symbol} x {quoteAsset?.symbol} liquidity doesn't exists!</span>
                                </Card>
                            </div>
                        }
                    </div>

                    {
                        pairInfo && pairInfo.valid && baseAsset && quoteAsset && <div className={"w-full grid grid-cols-1 gap-2"}>
                            {
                                isAllowanceRequired() === true &&
                                <Button className={"w-full"} onClick={() => {
                                    handleApprove(baseAsset.address);
                                }} color="default">
                                    Unlock {baseAsset.symbol}
                                </Button>
                            }
                        </div>
                    }


                    <div className="w-full flex flex-col items-center justify-center">


                        {
                            account ? isAllowanceRequired() === false && pairInfo && pairInfo.valid && hasLiquidity &&
                                <Button className={"w-full"} onClick={() => {
                                    handleSwap()
                                }} color="default">
                                    Swap
                                </Button>
                                :
                                <Button className={"w-full"} onClick={() => {
                                    toggleConnectModal()
                                }} color="default">
                                    Connect
                                </Button>
                        }


                    </div>



                </div>
            </div>

        </>
    );
}
export const ARBITRAGE_TAB = memo(_ARBITRAGE_TAB)

