import React, { memo, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useFanTokenWrapperContract, useKEWLVestingContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { fetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { Avatar, Button, ButtonGroup, Card, DatePicker, Image, Input, TimeInput } from '@nextui-org/react';
import { parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';
import {parseDate, getLocalTimeZone} from "@internationalized/date";
import {useDateFormatter} from "@react-aria/i18n";
import { format } from 'date-fns';
import {parseAbsoluteToLocal, Time, ZonedDateTime} from "@internationalized/date";


const _SWAP_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const KEWLVESTING = useKEWLVestingContract(chainId, true)

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
    const userSlippageTolerance = useAppSelector((state) => state.user.userSlippageTolerance);
    const [allExchangePairs, setAllExchangePairs]: any = useState(null)


    const [lockDate, setLockDate] = useState(parseAbsoluteToLocal(new Date().toISOString()));
    const [claimAccount,setClaimAccount] = useState(account)
    fetchAllTokenList(chainId, account)



    const fetchPairs = async () =>{
        const _allExchangePairs = await EXCHANGE.getAllPairs();
        setAllExchangePairs(_allExchangePairs)
    }

    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        fetchPairs()


        const kwlToken = defaultAssets.find(token => token && token.symbol === "KWL");
        if (kwlToken) {
            setBaseAsset(kwlToken);
            setQuoteAsset(defaultAssets.find(token => token?.symbol === getNativeCurrencyByChainId(chainId)))
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


 
    const handleLockTokens = async () => {

        setTransaction({ hash: '', summary: '', error: {message:"Under maintenance!"} });
        toggleError();
        
        const baseVal = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        const expireDate = moment(lockDate).unix();



        return;
        toggleLoading();
        var hasError = false;
        let fanToken = ERC20Contract(baseAsset.address);
        await fanToken.approve(KEWLVESTING.address, baseVal, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${KEWLVESTING.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            toggleLoading();
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
            hasError = true;
            
        })
        if(hasError){
            return
        }


        let feeOverrides = {
            value:parseEther("10")
        }
        toggleLoading();
        await KEWLVESTING.lockTokens(baseAsset.address,baseVal,claimAccount,expireDate,feeOverrides).then(async (tx) => {
            await tx.wait();
            const summary = `Locking Tokens : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });

    }

    useEffect(() => {
        if (!isSupportedChain(chainId)) {
            setBaseAsset(null)
            setQuoteAsset(null)
            setPairInfo(null)
        }
        
    }, [chainId, account, defaultAssets, provider,baseAsset,quoteAsset,  baseInputValue, quoteInputValue])

    


    const onSelectToken = (tokenInfo) => {
        isBase ? setBaseAsset(tokenInfo) : setQuoteAsset(tokenInfo)
        toggleSelectToken()
    }

    const handleSelectPair = (pair:any, base: any, quote: any) => {
        setBaseAsset(base);
        setQuoteAsset(quote);
        toggleSelectToken();
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

                    <div className="swap-inputs flex flex-col gap-2">
                        <div className="input ">


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

                        <div className="w-full flex flex-row gap-2">
                            <DatePicker size='lg' value={lockDate} onChange={setLockDate} label={"Unlock Date"} variant={"flat"} />
                        </div>

                        <div className="w-full flex flex-row gap-2">
                            <Input value={claimAccount} onValueChange={setClaimAccount} size={"lg"} type="text" label="Claim Address" placeholder="0x"  />
                        </div>
                    </div>
                </div>

                <div className={"flex flex-col gap-2 w-full"}>
 
                    <div className="w-full flex flex-col items-center justify-center">
                       <Button onClick={()=>{
                        handleLockTokens();
                       }} size='lg' fullWidth color='danger'>Lock Tokens</Button>
                    </div>
                </div>
            </div>
          
        </>
    );
}
export const VESTING_UNLOCK_TAB = memo(_SWAP_TAB)

