import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, SWAP_FEE_ON, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useStakeContract, useDomainContract, useKEWLFarmContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getAssetIconByChainIdFromTokenList, getNativeCurrencyByChainId, parseFloatWithDefault, truncateDecimals, unixTimeToDateTime } from '../../../utils';
import { Accordion, AccordionItem, Avatar, Button, Card } from '@nextui-org/react';
import { formatEther, formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { CurrencyAmount, Pair, Token, WETH9 } from '../../../entities';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';

const _FARM_TAB = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const IMON_STAKE_CONTRACT = useKEWLFarmContract(chainId, true);
    const CNS_DOMAIN_CONTRACT = useDomainContract(chainId, true);

    const ERC20Contract = useERC20Contract()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [allowanceAmount, setAllowanceAmount] = useState(parseEther("0"))
    const [baseAsset, setBaseAsset] = useState(null)
    const [quoteAsset, setQuoteAsset] = useState(null)
    const [isBase, setIsBase] = useState(true)
    const [baseInputValue, setBaseInputValue] = useState("")
    const [isUnlockRequired, setUnlockRequired] = useState(false)
    const [poolInfo, setPoolInfo]: any = useState(null);
    const [rewardInfo, setRewardInfo]: any = useState(null)
    const [isCNSRegistered, setCNSRegistered]: any = useState(false);
    const [allExchangePairs, setAllExchangePairs]: any = useState(null)
    const [userBalance,setUserBalance] : any = useState("0.000")
    const [pairInfo, setPairInfo]: any = useState(null);
    const PAIRContract = usePAIRContract()
    const [baseLiquidity, setBaseLiquidity] = useState("0")
    const [quoteLiquidity, setQuoteLiquidity] = useState("0")

    const [userBaseLiquidity, setUserBaseLiquidity] = useState("0")
    const [quserQuoteLiquidity, setUserQuoteLiquidity] = useState("0")

    useFetchAllTokenList(chainId, account)


    const setInputValue = (e, isBase) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        e = e.replace(",", ".")
        if (regex.test(e)) {
            setBaseInputValue(e)
        }

        setIsBase(isBase)
    }

    const onSelectToken = (tokenInfo) => {
        setBaseAsset(tokenInfo)
        toggleSelectToken()
    }

    const handleSelectPair = (pair,base,quote) => {
        console.log("pairInfo", pair)
        setBaseAsset(base)
        setQuoteAsset(quote)
        setPairInfo(pair);
        toggleSelectToken()

    }

    useEffect(()=>{
        initDefaults()
    },[baseAsset,quoteAsset,pairInfo])


    const initDefaults = async () => {

            const [_isRegistered, _Address] = await CNS_DOMAIN_CONTRACT.isRegistered(account);
            setCNSRegistered(_isRegistered);
            setBaseLiquidity("0.0000")
            setQuoteLiquidity("0.0000")
            if(!pairInfo){
                return;
            }

            const [_poolInfo, _rewardInfo] = await IMON_STAKE_CONTRACT.getPoolInfo(pairInfo.pair);
            console.log("poool", _poolInfo);
            console.log("reward", _rewardInfo);
            setPoolInfo(_poolInfo)
            setRewardInfo(_rewardInfo);

            const ERC20Token = PAIRContract(pairInfo.pair)
            const decimals = await ERC20Token.decimals();
            const symbol = await ERC20Token.symbol();
            const totalSupply = await ERC20Token.totalSupply()
            const _allowanceAmount = await ERC20Token.allowance(account, IMON_STAKE_CONTRACT.address);
            const _userBalance = await ERC20Token.balanceOf(account);
            let _kLast = await ERC20Token.kLast()
            const [_reserve0, _reserve1, _blockTimestampLast] = await ERC20Token.getReserves();


            console.log("pairInfo:",pairInfo.base.decimals,pairInfo.quote.decimals)

            const tokenA = new Token(baseAsset.chainId, pairInfo.base.token, BigNumber.from(pairInfo.base.decimals).toNumber(),pairInfo.base.symbol,pairInfo.base.name)

            const tokenB = new Token(quoteAsset.chainId, pairInfo.quote.token, BigNumber.from(pairInfo.quote.decimals).toNumber(),pairInfo.quote.symbol,pairInfo.quote.name)
            const [baseToken, quoteToken] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
            
            setUserBalance(formatUnits(_userBalance,decimals));
            setAllowanceAmount(_allowanceAmount);

            if (baseInputValue) {
                let _baseInputVal = parseUnits(baseInputValue, decimals);
                if (allowanceAmount.gte(_baseInputVal)) {
                    setUnlockRequired(false)
                } else {
                    setUnlockRequired(true)
                }
            }

            console.log("liquidityToken", pairInfo.pair,decimals)

      
            const liquidityToken: Token = new Token(chainId, pairInfo.pair, decimals, "PAIR", "PAIR", false)
            console.log("poolInfo",_poolInfo)

            let _totalLiquidityAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(liquidityToken, totalSupply);
            let _liquidityAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(liquidityToken, _poolInfo.totalDeposit.sub(_poolInfo.totalWithdraw));

            console.log("liquidity",_totalLiquidityAmount, _liquidityAmount)

            let reserve0: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(baseToken, _reserve0);
            let reserve1: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(quoteToken, _reserve1);
    
            const [baseReserve, quoteReserve] = baseToken.sortsBefore(quoteToken) ? [reserve0, reserve1] : [reserve1, reserve0]
            const exchangePair = new Pair(
                baseReserve,
                quoteReserve,
                liquidityToken.address
            )
            const liquidityValueA =
                _totalLiquidityAmount &&
                _liquidityAmount &&
                baseToken &&
                JSBI.greaterThanOrEqual(_totalLiquidityAmount.quotient, _liquidityAmount.quotient)
                ? CurrencyAmount.fromRawAmount(baseToken, exchangePair.getLiquidityValue(baseToken, _totalLiquidityAmount, _liquidityAmount, SWAP_FEE_ON, _kLast).quotient)
                : undefined


        const liquidityValueB =
                _totalLiquidityAmount &&
                _liquidityAmount &&
                quoteToken &&
                JSBI.greaterThanOrEqual(_totalLiquidityAmount.quotient, _liquidityAmount.quotient)
                ? CurrencyAmount.fromRawAmount(quoteToken, exchangePair.getLiquidityValue(quoteToken, _totalLiquidityAmount, _liquidityAmount, SWAP_FEE_ON, _kLast).quotient)
                : undefined

        
        setBaseLiquidity(baseToken.address === pairInfo.base.token ? liquidityValueA.toSignificant(6) : liquidityValueB.toSignificant(6))
        setQuoteLiquidity(quoteToken.address === pairInfo.quote.token ? liquidityValueB.toSignificant(6) : liquidityValueA.toSignificant(6))
        
 
     
    }

    useEffect(() => {
        console.log(baseAsset)
        console.log("baseInputValue", baseInputValue)
        if (baseInputValue) {
            try {
                let _baseInputVal = parseUnits(baseInputValue, baseAsset.decimals);
                if (allowanceAmount.gte(_baseInputVal)) {
                    setUnlockRequired(false)
                } else {
                    setUnlockRequired(true)
                }
            } catch (e) {
                //setInputValue("", true)
            }

        }

    }, [baseInputValue, allowanceAmount])

    useEffect(() => {
        initDefaults();
    }, [baseAsset, baseInputValue])


    const handleUnlock = async () => {
        if (![ChainId.ARBITRUM_ONE,ChainId.CHILIZ_SPICY_TESTNET, ChainId.CHILIZ_MAINNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Unsupported Chain!!" } });
            toggleError();
            return
        }
        
        if (!baseInputValue) { return }
        if (!baseAsset) { return }
        if(!pairInfo){return;}
        const ERC20Token = ERC20Contract(pairInfo.pair)
        const decimals = await ERC20Token.decimals();
        const _allowanceAmount = await ERC20Token.allowance(account, IMON_STAKE_CONTRACT.address);
        const _userBalance = await ERC20Token.balanceOf(account);
        setUserBalance(formatUnits(_userBalance,decimals));
        setAllowanceAmount(_allowanceAmount);

        let depositAmount = ethers.utils.parseUnits(baseInputValue, decimals);
        toggleLoading();
        await ERC20Token.approve(IMON_STAKE_CONTRACT.address, depositAmount, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${IMON_STAKE_CONTRACT.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();

        });
    }

    const handleStake = async () => {

        if (![ChainId.ARBITRUM_ONE,ChainId.CHILIZ_SPICY_TESTNET, ChainId.CHILIZ_MAINNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Unsupported Chain!!" } });
            toggleError();
            return
        }

        if (!isCNSRegistered) {
            setTransaction({ hash: '', summary: '', error: { message: "CNS Registration is Required!" } });
            toggleError();
            return
        }


    


        if (!baseInputValue) { return }
        if (!baseAsset) { return }

        
        if (!baseInputValue) { return }
        if (!baseAsset) { return }
        if(!pairInfo){return;}
        const ERC20Token = ERC20Contract(pairInfo.pair)
        const decimals = await ERC20Token.decimals();
        const _allowanceAmount = await ERC20Token.allowance(account, IMON_STAKE_CONTRACT.address);
        const _userBalance = await ERC20Token.balanceOf(account);

        let depositAmount = ethers.utils.parseUnits(baseInputValue, decimals);

        if(depositAmount.gt(_userBalance)){
            setTransaction({ hash: '', summary: '', error: {message:"Insufficient Balance"} });
            toggleError();
            return;
        }

        if(depositAmount.eq(0)){
            setTransaction({ hash: '', summary: '', error: {message:"Insufficient Amount"} });
            toggleError();
            return;
        }
    
        toggleLoading();
        await IMON_STAKE_CONTRACT.stake(pairInfo.pair, depositAmount).then(async (tx) => {
            await tx.wait();
            const summary = `Staking : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });

    }

    const calculateAPY = (_poolInfo, _rewardInfo) => {
        


        const totalReward = parseFloat(formatEther(_rewardInfo.total_reward_amount)); // toplam ödül
        const durationDays = 90; // 3 ay = 90 gün
        const annualDays = 365; // bir yıl = 365 gün
        const totalValue = parseFloat(formatEther(_poolInfo.totalDeposit.sub(_poolInfo.totalWithdraw))); // örnek toplam değer (yatırım miktarı)

        const apr = (totalReward / totalValue) * (annualDays / durationDays) * 100;

        return apr
        
    }
    const initExchangePairs = async () => {
        const _exchangePairs = await EXCHANGE.getAllPairs();

        let bannedList = ["CHZWIF","TRUMPFUN","MMW","KING","CHADZ","CATCHI","MC"]
   
        
        let validPairs = [
            { base: "KWL", quote: "WCHZ" },
            { base: "KWL", quote: "PEPPER" }
        ];
        
        const filteredPairs = _exchangePairs
        .filter(({ base, quote }) => {
            const isBaseMatch = validPairs.some(pair =>
                (pair.base === base.symbol.toUpperCase() && pair.quote === quote.symbol.toUpperCase()) ||
                (pair.base === quote.symbol.toUpperCase() && pair.quote === base.symbol.toUpperCase())
            );
            
            const isBanned = bannedList.includes(base.symbol.toUpperCase()) || bannedList.includes(quote.symbol.toUpperCase());
        
          return isBaseMatch && (!isBanned) ;
        }).slice().reverse();
    
        console.log(filteredPairs)

        setAllExchangePairs(filteredPairs);
        initDefaults();
    }
    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }
        initExchangePairs();
    }, [defaultAssets])

    return (
        <>
            <ModalInfo
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />

            <ModalSelectExchangePair disableToken={!isBase ? baseAsset : quoteAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={handleSelectPair} allExchangePairs={allExchangePairs} />

            {
                <div className="w-full rounded-xl pb-0">
                    <div className="rounded-xl pb-0 flex gap-2 flex-col">
                        <div className="swap-inputs">
                            <div className="input sm:order-1">


                            {
                            <Button className="px-2 token-selector min-w-[200px]" radius='full' variant="flat" color="default" onPress={() => {
                                setIsBase(true)
                                toggleSelectToken()
                            }} startContent={
                                <DoubleCurrencyIcon baseIcon={baseAsset?.logoURI ? baseAsset?.logoURI : "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x677f7e16c7dd57be1d4c8ad1244883214953dc47/logo.svg"} quoteIcon={quoteAsset?.logoURI ? quoteAsset?.logoURI : "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xed5740209fcf6974d6f3a5f11e295b5e468ac27c/logo.svg"}/>
                            }
                                endContent={
                                    <span translate={"no"} className="material-symbols-outlined ">
                                        expand_more
                                    </span>
                                }
                            >
                                    <span className='w-full'> {
                                                pairInfo ? <>
                                                {baseAsset?.symbol}x{quoteAsset?.symbol}
                                                </>:<>
                                                    Please Select
                                                </>
                                            }
                                    </span>
                            </Button>

                        }

                              

                                <div onPress={() => {
                                    setInputValue(userBalance, true)
                                }} className="balance  cursor-pointer">
                                    Balance: {userBalance}
                                </div>



                                <input value={baseInputValue} onChange={(e) => {
                                    setInputValue(e.target.value, true)
                                }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                    pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false" />
                            </div>


                        </div>

                        {
                            pairInfo &&  <div className='flex flex-col gap-2'>
                            <div className='w-full flex flex-col gap-2'>
                                <span className='font-bold'>Pool Info</span>
    
                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between  rounded-lg'>
                                    <span className='text-sm'>Total Value Locked</span>
                                    <span className='text-sm font-bold'>{poolInfo && truncateDecimals(ethers.utils.formatUnits(poolInfo.totalDeposit.sub(poolInfo.totalWithdraw), poolInfo.tokenInfo.decimals),6)} {poolInfo && poolInfo.tokenInfo.symbol}</span>
                                </Card>
    
                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between  rounded-lg'>
                                    <span className='text-sm'>Total Deposit</span>
                                    <span className='text-sm font-bold'>{poolInfo && truncateDecimals(ethers.utils.formatUnits(poolInfo.totalDeposit, poolInfo.tokenInfo.decimals),6)} {poolInfo && poolInfo.tokenInfo.symbol}</span>
                                </Card>
    
                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg'>
                                    <span className='text-sm'>Total Withdraw</span>
                                    <span className='text-sm font-bold'>{poolInfo && truncateDecimals(ethers.utils.formatUnits(poolInfo.totalWithdraw, poolInfo.tokenInfo.decimals),6)} {poolInfo && poolInfo.tokenInfo.symbol}</span>
                                </Card>
    
                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                    <span className='text-sm'>Joined Users</span>
                                    <span className='text-sm font-bold'>{poolInfo && BigNumber.from(poolInfo.totalJoined).toNumber()}</span>
                                </Card>
                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                    <span className='text-sm'>Leaved Users</span>
                                    <span className='text-sm font-bold'>{poolInfo && BigNumber.from(poolInfo.totalLeft).toNumber()}</span>
                                </Card>
    
                                <span className='font-bold'>LP Info</span>
                                <div className="w-full grid grid-cols-2 gap-2">
                                            <Card shadow='none' className="rounded-lg border border-default-100 flex flex-row items-center justify-start gap-2 px-2">
                                                <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                                <small className={"w-full text-start py-2"} >{baseLiquidity} {baseAsset?.symbol}</small>
                                            </Card>
                                            <Card shadow='none' className="rounded-lg border border-default-100 flex flex-row items-center justify-start gap-2 px-2">
                                                <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                                <small className={"w-full text-start py-2"} >{quoteLiquidity} {quoteAsset?.symbol}</small>
                                            </Card>
    
                                        </div>
    
    
                                <span className='font-bold'>Rewards</span>
                                <Accordion isCompact={true} variant="light" selectionMode="multiple">
                                    {rewardInfo && rewardInfo.map((reward, index) => {
                                        return <AccordionItem
                                            key={index}
                                            aria-label={reward.name}
                                            startContent={
                                                <Avatar
                                                    isBordered
                                                    color="default"
                                                    radius="full"
                                                    src={getAssetIconByChainIdFromTokenList(chainId, defaultAssets, reward.token)}
                                                />
                                            }
    
                                            subtitle={reward.name}
                                            title={reward.symbol}
                                        >
                                            <div className='w-full flex flex-col gap-2 p-3'>
                                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                                    <span className='text-sm'>Name</span>
                                                    <span className='font-bold'>{reward.name}</span>
                                                </Card>
                                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                                    <span className='text-sm'>Symbol</span>
                                                    <span className='font-bold'>{reward.symbol}</span>
                                                </Card>
                                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between  rounded-lg '>
                                                    <span className='text-sm'>Decimals</span>
                                                    <span className='font-bold'>{BigNumber.from(reward.decimals).toNumber()}</span>
                                                </Card>
                                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                                    <span className='text-sm'>Total Supply</span>
                                                    <span className='font-bold'>{ethers.utils.formatUnits(reward.total_supply, reward.decimals)}</span>
                                                </Card>
                                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                                    <span className='text-sm'>Total Reward</span>
                                                    <span className='font-bold'>{ethers.utils.formatUnits(reward.total_reward_amount, reward.decimals)}</span>
                                                </Card>
                                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                                    <span className='text-sm'>APY</span>
                                                    <span className='font-bold'>{calculateAPY(poolInfo, reward)}</span>
                                                </Card>
                                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                                    <span className='text-sm'>Start Date</span>
                                                    <span className='font-bold'>{unixTimeToDateTime(reward.created_at)}</span>
                                                </Card>
                                                <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between  rounded-lg '>
                                                    <span className='text-sm'>End Date</span>
                                                    <span className='font-bold'>{unixTimeToDateTime(reward.expired_at)}</span>
                                                </Card>
                                            </div>
                                        </AccordionItem>
                                    })
    
                                    }
                                </Accordion>
    
    
    
                            </div>
                            <div className='w-full flex flex-col gap-2'>
    
    
    
                                {
    
    
                                isCNSRegistered && baseAsset && baseAsset.address !== ETHER_ADDRESS && <Button onPress={() => {
                                        handleUnlock()
                                    }} color='default' size='lg' className='w-full' variant='solid'>Unlock</Button>
    
                                }
    
    
                                {
                                    isCNSRegistered && <Button onPress={() => {
                                        handleStake()
                                    }} color='default' size='lg' className='w-full' variant='solid'>Stake</Button>
                                }
    
    
    
                                {
                                    !isCNSRegistered &&
    
                                    <div className='w-full gap-2 p-2 flex flex-col'>
                                    <span className={"text-center bg-danger-500/10 text-danger-500 rounded-lg col-span-2 p-2"}>
                                            To participate in the farm pool and receive rewards, you need to register with the Chiliz Name Service (CNS).                                            </span>
                                        <Button as={NavLink} to={"/cns"} color='default' size='lg' className='w-full' variant='solid'>Register CNS</Button>
    
                                    </div>
                                }
    
    
    
                            </div>
                            </div>
                        }
                     
                       
                    </div>
                </div>
            }

        </>
    );
}
export const FARM_TAB = memo(_FARM_TAB)

