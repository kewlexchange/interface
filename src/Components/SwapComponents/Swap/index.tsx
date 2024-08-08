import React, { memo, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, TradeType } from '../../../constants/misc';
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

        let _baseAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address
        let _quoteAddress = quoteAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : quoteAsset.address

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


 


        
        if (parseFloat(tradeInfo.priceImpact.toFixed(2)) > 15) {
           // displayError("A swap of this size may have a high price impact, given the current liquidity in the pool. There may be a large difference between the amount of your input token and what you will receive in the output token");
          //  return
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



            <div className="flex flex-col gap-2 rounded-xl w-full">
                <div className="w-full rounded-xl">

            


                    <div className="swap-inputs">
                        <div className="input sm:order-1">


                            {
                                baseAsset &&

                                <Button className="token-selector  px-2" radius='full' variant="flat" color="default" onClick={() => {
                                    setIsBase(true)
                                    toggleSelectToken()
                                }} startContent={
                                    <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={baseAsset && baseAsset.logoURI} />
                                }
                                    endContent={
                                        <span translate={"no"} className="material-symbols-outlined ">
                                            expand_more
                                        </span>
                                    }
                                >{baseAsset.symbol}
                                </Button>

                            }




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




                        <button onClick={() => {
                            handleSwapAssets()
                        }} className="swap-currencies sm:order-2  my-3 anim "
                            style={{ "left": "calc(50% - 16px)" }}>
                            <span translate={"no"} className="material-symbols-outlined ">
                                arrow_downward
                            </span>
                        </button>

                        <div className="input sm:order-3">


                            {
                                quoteAsset &&

                                <Button className="token-selector px-2" radius='full' variant="flat" color="default" onClick={() => {
                                    setIsBase(false)
                                    toggleSelectToken()
                                }} startContent={
                                    <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={quoteAsset && quoteAsset.logoURI} />

                                }
                                    endContent={
                                        <span translate={"no"} className="material-symbols-outlined ">
                                            expand_more
                                        </span>
                                    }
                                >
        
                                    {quoteAsset.symbol}
                                </Button>

                            }


                            <div onClick={() => {
                                setInputValue(quoteAsset && quoteAsset.balance, false)
                            }} className="balance cursor-pointer">
                                Balance: {quoteAsset && quoteAsset.balance}
                            </div>


                            <input value={quoteInputValue} onChange={(e) => {
                                setInputValue(e.target.value, false)
                            }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false" />
                        </div>
                    </div>
                </div>

                <div className={"flex flex-col gap-2 w-full"}>
                    <div className={"w-full flex flex-col gap-2 rounded-lg"}>

                        {
                            tradeInfo && <div className={"w-full grid grid-cols-2 rounded-lg border border-default-100 p-2 text-center gap-2"}>

                                <div className={"flex items-start justify-start w-full col-span-2"}>
                                    Trading Info
                                </div>
                                <small className={"col-span-2 text-left"}>Available Liquidity</small>
                                <div className="rounded-lg border border-default-100 flex items-center justify-start gap-2 px-2">
                                    <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                    <small className={"w-full text-start py-2"} >{baseLiquidity} {baseAsset?.symbol}</small>
                                </div>
                                <div className="rounded-lg border border-default-100 flex items-center justify-start gap-2 px-2">
                                    <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                    <small className={"w-full text-start py-2"} >{quoteLiquidity} {quoteAsset?.symbol}</small>
                                </div>

                                <small className={"col-span-2 text-left"}>Price</small>

                                <div className="rounded-lg border border-default-100 flex items-center justify-start gap-2 px-2">
                                    <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                    <small className="py-2">{tradeInfo.executionPrice.invert().toSignificant()} {baseAsset?.symbol} per {quoteAsset?.symbol}</small>
                                </div>
                                <div className="rounded-lg border border-default-100 flex items-center justify-start gap-2 px-2">
                                    <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                    <small className="py-2">{tradeInfo.executionPrice.toSignificant()}  {quoteAsset?.symbol} per {baseAsset?.symbol}</small>
                                </div>


                            </div>
                        }

                        {
                            tradeInfo && <div className={"w-full grid grid-cols-2 gap-2 justify-around rounded-lg border border-default-100 p-2 text-center"}>
                                <small className={"text-left"}>Price Impact</small>
                                <small className={"text-right"}>{tradeInfo.priceImpact.toFixed(2)}%</small>

                                {
                                    parseFloat(tradeInfo.priceImpact.toFixed(2)) > 5 &&
                                    <small className={"text-center bg-danger-500/10 text-danger-500 rounded-lg col-span-2 p-2"}>
                                        A swap of this size may have a high price impact, given the current liquidity in the pool. There may be a large difference between the amount of your input token and what you will receive in the output token
                                    </small>
                                }

                            </div>
                        }




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
                                }} color="danger">
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
                                }} color="danger">
                                    Swap
                                </Button>
                                :
                                <Button className={"w-full"} onClick={() => {
                                    toggleConnectModal()
                                }} color="danger">
                                    Connect
                                </Button>
                        }


                    </div>



                </div>
            </div>
          
        </>
    );
}
export const SWAP_TAB = memo(_SWAP_TAB)

