import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useStakeContract, useDomainContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getAssetIconByChainIdFromTokenList, getNativeCurrencyByChainId, parseFloatWithDefault, unixTimeToDateTime } from '../../../utils';
import { Accordion, AccordionItem, Avatar, Button, Card,Image } from '@nextui-org/react';
import { formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { WETH9 } from '../../../entities';

const _STAKE_TAB = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const IMON_STAKE_CONTRACT = useStakeContract(chainId, true);
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


    const initDefaults = async () => {
        let _baseAssetAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address;
        let _isWETH = baseAsset.address === ETHER_ADDRESS ? false : true;

        if (_isWETH) {
            const ERC20Token = ERC20Contract(baseAsset.address)
            const _allowanceAmount = await ERC20Token.allowance(account, IMON_STAKE_CONTRACT.address);
            setAllowanceAmount(_allowanceAmount);

            console.log("baseAsset:", baseAsset)

            if (baseInputValue) {
                let _baseInputVal = parseUnits(baseInputValue, baseAsset.decimals);
                if (allowanceAmount.gte(_baseInputVal)) {
                    setUnlockRequired(false)
                } else {
                    setUnlockRequired(true)
                }
            }
        } else {
            setAllowanceAmount(ethers.constants.MaxUint256)
        }

        const [_isRegistered, _Address] = await CNS_DOMAIN_CONTRACT.isRegistered(account);
        setCNSRegistered(_isRegistered);
        const [_poolInfo, _rewardInfo] = await IMON_STAKE_CONTRACT.getPoolInfo(_baseAssetAddress);
        console.log("poool", _poolInfo);
        console.log("reward", _rewardInfo);
        setPoolInfo(_poolInfo)
        setRewardInfo(_rewardInfo);
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
                setInputValue("", true)
            }

        }

    }, [baseInputValue, allowanceAmount])

    useEffect(() => {
        if (!baseAsset) {
            return;
        }
        initDefaults();
    }, [baseAsset, baseInputValue])


    const handleUnlock = async () => {
        if (![ChainId.ARBITRUM_ONE, ChainId.CHILIZ_SPICY_TESTNET, ChainId.CHILIZ_MAINNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Unsupported Chain!!" } });
            toggleError();
            return
        }
        if (!baseInputValue) { return }
        if (!baseAsset) { return }
        let depositAmount = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        toggleLoading();
        const ERC20Token = ERC20Contract(baseAsset.address)
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
        let _baseAssetAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address;
        let _isWETH = baseAsset.address === ETHER_ADDRESS ? true : false;

        let depositAmount = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        console.log("depositAmount", depositAmount);
        let overrides = {
            value: _isWETH ? depositAmount : parseEther("0")
        }
        toggleLoading();
        await IMON_STAKE_CONTRACT.stake(_baseAssetAddress, depositAmount, overrides).then(async (tx) => {
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
        const secondsInDay = 86400 * 365 * 3;
        const dailyReward = _rewardInfo.reward_per_second * secondsInDay;
        const dailyRewardPerStaker = dailyReward * (_poolInfo.totalDeposit / _rewardInfo.accumulated_token_per_share);
        const apy = dailyRewardPerStaker / _poolInfo.totalDeposit;
        console.log("APY", apy);
        return apy;
    }

    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        setBaseAsset(defaultAssets.find(token => token?.symbol === getNativeCurrencyByChainId(chainId)))
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

            <ModalSelectToken disableToken={baseAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={null} allExchangePairs={null} />


            {

                <div className="w-full rounded-xl pb-0">
                    <div className="rounded-xl pb-0 flex gap-2 flex-col">
                        <div className="swap-inputs">
                            <div className="input sm:order-1">

{
                            baseAsset &&

                            <Button className="token-selector" radius='full' variant="flat" color="default" onClick={() => {
                                setIsBase(true)
                                toggleSelectToken()
                            }} startContent={
                                <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={baseAsset.logoURI} />
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
                                    setInputValue(baseAsset?.balance, true)
                                }} className="balance  cursor-pointer">
                                    Balance: {baseAsset && baseAsset.balance}
                                </div>



                                <input value={baseInputValue} onChange={(e) => {
                                    setInputValue(e.target.value, true)
                                }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                    pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false" />
                            </div>


                        </div>
                        <div className='w-full flex flex-col gap-2'>
                            <span className='font-bold'>Pool Info</span>

                            <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between  rounded-lg'>
                                <span className='text-sm'>Total Value Locked</span>
                                <span className='text-sm font-bold'>{poolInfo && ethers.utils.formatUnits(poolInfo.totalDeposit.sub(poolInfo.totalWithdraw), poolInfo.tokenInfo.decimals)} {poolInfo && poolInfo.tokenInfo.symbol}</span>
                            </Card>

                            <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg'>
                                <span className='text-sm'>Total Deposit</span>
                                <span className='text-sm font-bold'>{poolInfo && ethers.utils.formatUnits(poolInfo.totalDeposit, poolInfo.tokenInfo.decimals)} {poolInfo && poolInfo.tokenInfo.symbol}</span>
                            </Card>
                            <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg'>
                                <span className='text-sm'>Total Withdraw</span>
                                <span className='text-sm font-bold'>{poolInfo && ethers.utils.formatUnits(poolInfo.totalWithdraw, poolInfo.tokenInfo.decimals)} {poolInfo && poolInfo.tokenInfo.symbol}</span>
                            </Card>

                            <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                <span className='text-sm'>Joined Users</span>
                                <span className='text-sm font-bold'>{poolInfo && BigNumber.from(poolInfo.totalJoined).toNumber()}</span>
                            </Card>
                            <Card shadow='none' className='w-full flex flex-row gap-2 items-center justify-between rounded-lg '>
                                <span className='text-sm'>Leaved Users</span>
                                <span className='text-sm font-bold'>{poolInfo && BigNumber.from(poolInfo.totalLeft).toNumber()}</span>
                            </Card>


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


                        isCNSRegistered && baseAsset && baseAsset.address !== ETHER_ADDRESS && <Button onClick={() => {
                                    handleUnlock()
                                }} color='default' size='lg' className='w-full' variant='solid'>Unlock</Button>

                            }


                            {
                                isCNSRegistered && <Button onClick={() => {
                                    handleStake()
                                }} color='default' size='lg' className='w-full' variant='solid'>Stake</Button>
                            }



                            {
                                !isCNSRegistered &&

                                <div className='w-full gap-2 p-2 flex flex-col'>
                                    <span>
                                        To participate in the stake pool and receive rewards, you need to register with the Chiliz Name Service (CNS).                                            </span>
                                    <Button as={NavLink} to={"/cns"} color='default' size='lg' className='w-full' variant='solid'>Register CNS</Button>

                                </div>
                            }



                        </div>
                    </div>
                </div>
            }

        </>
    );
}
export const STAKE_TAB = memo(_STAKE_TAB)

