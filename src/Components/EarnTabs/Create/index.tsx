import React, { memo, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useFanTokenWrapperContract, useKEWLStakeContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { Avatar, Button, ButtonGroup, Card, DatePicker, Image } from '@nextui-org/react';
import { formatUnits, parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';

import {parseAbsoluteToLocal,now, getLocalTimeZone} from "@internationalized/date";


const _CREATE_STAKE_POOL_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const EXCHANGE = useExchangeContract(chainId, true)
    const FANTOKENWRAPPER = useFanTokenWrapperContract(chainId, true)
    const KEWLSTAKE = useKEWLStakeContract(chainId,true);

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
    const [lockDate, setLockDate] = useState(parseAbsoluteToLocal(new Date().toISOString()));

    useFetchAllTokenList(chainId, account)




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



    useEffect(() => {
        if (!isSupportedChain(chainId)) {
            setBaseAsset(null)
            setQuoteAsset(null)
            setPairInfo(null)
        }
        fetchPrice()
    }, [chainId, account, defaultAssets, provider, baseAsset, quoteAsset, baseInputValue, quoteInputValue])

    

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

    const handleUnlock = async  () => {
        let poolToken = ERC20Contract(quoteAsset.address);
        const tokenDecimals = await poolToken.decimals();
        const transferAmount = ethers.constants.MaxUint256
        toggleLoading();
        await poolToken.approve(KEWLSTAKE.address, transferAmount, { from: account }).then(async (tx) => {
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

    const handleCreatePool = async () =>{

        if(chainId != ChainId.CHILIZ_SPICY_TESTNET){
            displayError("Unsupported Chain!")
            return;
        }
        if (!baseAsset) { displayError("Please select base asset!"); return; }
        if (!quoteAsset) { displayError("Please select quote asset!"); return; }
        if (quoteInputValue === "") { displayError("Input amount not valid!"); return; }


        let baseTokenERC = ERC20Contract(baseAsset.address);
        let quoteTokenERC = ERC20Contract(quoteAsset.address);
        const _baseAllowanceAmount = await baseTokenERC.allowance(account, KEWLSTAKE.address);
        const _quoteAllowanceAmount = await quoteTokenERC.allowance(account, KEWLSTAKE.address);


        let depositAmount = ethers.utils.parseUnits(quoteInputValue, quoteAsset.decimals);
        const expireDate = moment(lockDate).unix();

        console.log("Lock Date",lockDate);
        console.log("Allowances: BASE ",formatUnits(_baseAllowanceAmount,baseAsset.decimals), "Quote",formatUnits(_quoteAllowanceAmount,quoteAsset.decimals));

        console.log("Expire Date",expireDate);
        console.log("Deposit Amount",ethers.utils.formatUnits(depositAmount,quoteAsset.decimals));
        console.log("Quote",quoteAsset.symbol);



        console.log("Base Asset",baseAsset.address,baseAsset.symbol, "Quote asset", quoteAsset.address,quoteAsset.symbol)
        toggleLoading();
        await KEWLSTAKE.create(baseAsset.address, quoteAsset.address, depositAmount, expireDate).then(async (tx) => {
            await tx.wait();
            const summary = `Trading : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            fetchPrice();
            toggleLoading();
        }); 
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

                    <span>Stake Asset</span>


                    {
                        baseAsset &&

                        <Button fullWidth size='lg' className=" px-2 mb-2" radius='lg' variant="flat" color="default" onClick={() => {
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
                        >

                            <div className='w-full'>{baseAsset.symbol}</div>
                        </Button>

                    }


                    <span>Reward Asset</span>

                    <div className="swap-inputs mb-2">





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


                    <span>Expire Date</span>


                    <DatePicker
                    value={lockDate} onChange={setLockDate}
                                fullWidth
                                label="Expire Date"
                                variant="flat"
                                hideTimeZone
                                size='lg'
                                showMonthAndYearPickers
                      
                            />
          
                </div>

             
                <Button onClick={()=>{
                            // unlock
                            handleUnlock()
                        }} size='lg' fullWidth color='danger' variant='solid'>Unlock</Button>
                <Button onClick={()=>{
                            // stake

                            handleCreatePool()
                        }} size='lg' fullWidth color='danger' variant='solid'>Create Pool</Button>
            </div>

        </>
    );
}
export const CREATE_STAKE_POOL_TAB = memo(_CREATE_STAKE_POOL_TAB)




