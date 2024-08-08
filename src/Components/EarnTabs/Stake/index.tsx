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
import { Accordion, AccordionItem, Avatar, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, DatePicker, Image, Spinner } from '@nextui-org/react';
import { formatUnits, parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';

import { parseAbsoluteToLocal, now, getLocalTimeZone } from "@internationalized/date";


const _STAKE_POOL_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const EXCHANGE = useExchangeContract(chainId, true)
    const FANTOKENWRAPPER = useFanTokenWrapperContract(chainId, true)
    const KEWLSTAKE = useKEWLStakeContract(chainId, true);

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


    const [pools, setPools]: any = useState(null)
    const [isLoading, setLoaded] = useState(false)

    useFetchAllTokenList(chainId, account)




    useEffect(() => {
        initDefaults()
        return;

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


        initDefaults()

        // setQuoteAsset(defaultAssets.find(token => token?.symbol === "KWL"))
    }, [chainId, account, defaultAssets])


    const initDefaults = async () => {
        setLoaded(false)
        const _pools = await KEWLSTAKE.fetch();
        setPools(_pools);
        console.log(_pools)
        setLoaded(true)
    }


    const StakeItem = (props: {poolInfo: any, stakeItem: any }) => {
        
        const handleHarvest = async () => {
            
        }

        const handleUnstake = async () => {

        }

        return (<Card shadow='sm' fullWidth>

            <CardBody>

            <div className='grid grid-cols-1 sm:grid-cols-3'>
                <div className='w-full flex flex-col gap-2'>
                    <span className='text-xs'>Deposit Amount</span>
                    <span>0.00000000 {} </span>
                </div>
                <div className='w-full flex flex-col gap-2'>
                    <span className='text-xs'>Pending Rewards</span>
                    <span>0.00000000</span>
                </div>
                <div className='w-full flex flex-row gap-2 items-center justify-center'>
                   <Button fullWidth radius='full' size='sm' variant='solid' color='danger'>Unstake</Button>
                   <Button fullWidth radius='full' size='sm' variant='solid' color='danger'>Harvest</Button>
                </div>
            </div>
            </CardBody>
            <CardFooter>
                <div className='w-full grid grid-cols-4 flex-row items-center justify-between'>
                    <div className='w-full flex flex-col gap-2'>
                        <span className='text-xs'>Joined At </span>
                        <span className='text-xs'>-</span>
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <span className='text-xs'>Rewarded At </span>
                        <span className='text-xs'>-</span>
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <span className='text-xs'>Leaved At</span>
                        <span className='text-xs'>-</span>
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <span className='text-xs text-danger'>Unlock Date</span>
                        <span className='text-xs'>-</span>
                    </div>
                    </div>
            </CardFooter>
        </Card>)
    }

    const StakePool = (props: { pool: any }) => {
        const [quoteInputValue, setQuoteInputValue] = useState("")
        const [userStakings,setUserStakings] : any = useState(null)
        const [isLoaded,setLoaded] = useState(false)

        const fetchUserStakings = async () => {
            setLoaded(false);
            if(!account){
                setLoaded(true)
                return;
            }
            const _userStakings =  await KEWLSTAKE.getUserInfoByPoolAddress(props.pool.pool,account)
            setUserStakings(_userStakings);
            setLoaded(true)

            console.log(_userStakings)

        }

        useEffect(()=>{
            fetchUserStakings();
        },[props.pool])

        const calculateAPR = () => {
            return `APR`;
        }

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

        }, [props.pool])


        return (
            <div className='w-full flex flex-col gap-2'>
                <div className='w-full'>


                    <div className="swap-inputs mb-2">
                        <div className="input sm:order-3">
                            {
                                <Button className="token-selector px-2" radius='full' variant="solid" color="danger" onClick={() => {
                                    setIsBase(false)
                                    toggleSelectToken()
                                }}
                                >
                                    Stake
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
                <div className='w-full flex flex-col gap-2 p-2'>

                    <StakeItem poolInfo={props.pool} stakeItem={null} />
                    <StakeItem poolInfo={props.pool} stakeItem={null} />
                    <StakeItem poolInfo={props.pool} stakeItem={null} />
                    <StakeItem poolInfo={props.pool} stakeItem={null} />
                    <StakeItem poolInfo={props.pool} stakeItem={null} />
                    <StakeItem poolInfo={props.pool} stakeItem={null} />
                    <StakeItem poolInfo={props.pool} stakeItem={null} />
                </div>
            </div>
        )
    }



    return (
        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
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

                {
                    !isLoading ? <>
                        <Spinner label="Loading..." color="danger" labelColor="danger" />
                    </> : <>
                        <Accordion fullWidth variant="splitted">


                            {


                                pools && pools.length > 0 && pools.map((pool, index) => {
                                    return (
                                        <AccordionItem key={index} aria-label=""

                                            startContent={
                                                <div className='w-full flex flex-col gap-2 inline-flex'>
                                                    <span>{pool.name}</span>

                                                    <div className='w-full grid grid-cols-3'>

                                                        <div className='flex flex-col gap-2 items-start justify-center'>
                                                            <div className='w-[60px] h-[60px]  rounded-full bg-danger-500 text-white items-center justify-center flex flex-col'>
                                                                <span className='text-xs'>APR</span>
                                                                <span>%100</span>
                                                            </div>
                                                        </div>

                                                        <div className='flex flex-col gap-0 items-start justify-center'>
                                                            <span className='text-xs'>Stake</span>
                                                            <span>{pool.tokenSymbol}</span>
                                                            <span className='text-xs'>{pool.tokenName}</span>
                                                        </div>

                                                        <div className='flex flex-col gap-0 items-start justify-center'>
                                                            <span className='text-xs'>Reward</span>
                                                            <span>{pool.rewardSymbol}</span>
                                                            <span className='text-xs'>{pool.rewardName}</span>
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-4'>
                                                        <div className='flex flex-col gap-2'>
                                                            <span className='text-xs'>Total Reward</span>
                                                            <span>{ethers.utils.formatUnits(pool.totalReward,pool.rewardDecimals)} {pool.rewardSymbol}</span>
                                                        </div>

                                                        <div className='flex flex-col gap-2'>
                                                            <span className='text-xs'>Total Claim</span>
                                                            <span>{ethers.utils.formatUnits(pool.totalRewardWithdraw,pool.rewardDecimals)} {pool.rewardSymbol}</span>
                                                        </div>

                                                        <div className='flex flex-col gap-2'>
                                                            <span className='text-xs'>Total Deposit</span>
                                                            <span>{ethers.utils.formatUnits(pool.totalDeposit, pool.tokenDecimals)} {pool.tokenSymbol}</span>
                                                        </div>

                                                        <div className='flex flex-col gap-2'>
                                                            <span className='text-xs'>Total Withdraw</span>
                                                            <span>{ethers.utils.formatUnits(pool.totalWithdraw, pool.tokenDecimals)} {pool.tokenSymbol}</span>
                                                        </div>

                                                    </div>
                                                </div>
                                            }
                                        >

                                            <StakePool key={index} pool={pool} />
                                        </AccordionItem>

                                    );
                                })


                            }
                        </Accordion>
                    </>

                }


            </div>

        </>
    );
}
export const STAKE_POOLS_TAB = memo(_STAKE_POOL_TAB)




