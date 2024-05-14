import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Identicon from "../../Components/Identicon";
import {
    generateExplorerURLByChain, getAssetIconByChainId,
    getAssetIconByChainIdFromTokenList,
    getIconByChainId,
    getNativeCurrencyByChainId,
    unixTimeToDateTime
} from "../../utils";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { useDiamondContract, useERC20Contract, useExchangeContract } from "../../hooks/useContract";
import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "../../hooks/useModals";
import { formatEther, parseEther } from "ethers/lib/utils";
import useDebounce from "../../hooks/useDebounce";
import { AnimationHeader } from "../../Components/AnimationHeader";
import { UnlockStakePool } from "../../Components/UnlockStakePool";
import { fetchAllTokenList } from "../../state/user/hooks";
import { useAppSelector } from "../../state/hooks";
import { DoubleCurrencyIcon } from "../../Components/DoubleCurrency";

const FarmPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const [farmPools, setFarmPools] = useState([]);
    const [activePool, setActivePool] = useState(null)
    const { state: showPools, toggle: togglePools } = useModal();

    const [isUnlocked, setUnlocked] = useState(false)
    const [stakeAmount, setStakeAmount] = useState("0")
    const debounceStakeAmount = useDebounce(stakeAmount, 500)

    const [timePeriod, setTimePeriod] = useState(0)
    const [scoreInfo, setScoreInfo] = useState(null)
    const ERC20Contract = useERC20Contract()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()

    fetchAllTokenList(chainId, account)

    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])


    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [chainId]);




    const handleChangeInput = (e) => {
        setStakeAmount(e.target.value)
    }

    const loadFarmPools = async () => {
        const _pairs = await EXCHANGE.getAllPairs();
        setFarmPools(_pairs);
        if (_pairs.length > 0) {
            setActivePool(_pairs[0])
        }
    }

    useEffect(() => {
        if (chainId) {
            loadFarmPools();
        } else {
            setFarmPools([])
        }
    }, [chainId, account])

    return (

        <>
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


            <div className={"container mx-auto my-5"}>

                <div className={"mx-auto w-[40%] sm:w-full"}>

                    <div className={"grid grid-cols-1 gap-5"}>
                        <div className={"bg-white  border-1 rounded-xl p-2 w-full"}>


                            <div className={"grid grid-cols-1 mx-auto w-full sm:w-full gap-2"}>


                                <div className="rounded-xl transparent-bg px-4 pb-4 w-full">
                                    <div className="rounded-xl flex gap-2 flex-col">
                                        <div className="flex items-center justify-between border-b transparent-border-color flex-wrap p-2 py-4">
                                            <span translate={"no"} className="flex items-center gap-x-2 whitespace-nowrap">Farm</span>
                                            <div className="whitespace-nowrap"><span
                                                className="text-xs text-pink-960 font-bold">Balance :</span> <span> 0.000000 </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-start swap">
                                            <div className="w-full swap-inputs">
                                                <div className="input sm:order-1">

                                                    {
                                                        activePool &&
                                                        <div onClick={() => {
                                                            togglePools();
                                                        }} className="farm-token-selector flex flex-row justify-between">
                                                            <DoubleCurrencyIcon baseIcon={getAssetIconByChainIdFromTokenList(chainId, defaultAssets, activePool.base.token)} quoteIcon={getAssetIconByChainIdFromTokenList(chainId, defaultAssets, activePool.quote.token)} />

                                                            <div className="sm:hidden">{activePool.base.symbol}x{activePool.quote.symbol}</div>
                                                            <div className="hidden sm:block">LP</div>
                                                            <span className="material-symbols-outlined font-bold -ml-1">
                                                                expand_more
                                                            </span>
                                                        </div>
                                                    }

                                                    <div className="balance text-black cursor-pointer hover:text-black/70">
                                                        Balance: 0.0000
                                                    </div>

                                                    <input defaultValue={stakeAmount} onChange={(e) => {
                                                        handleChangeInput(e)
                                                    }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                                        pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false" />
                                                </div>


                                            </div>
                                        </div>

                                        {
                                            showPools && <div className="w-full border border-1 rounded-xl p-2 flex items-start flex-col justify-start ">
                                                <div className={"w-full border-b transparent-border-color mb-2"}>
                                                    <span className={"font-bold"}>Farm Pools</span>
                                                </div>
                                                <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-2">
                                                    {
                                                        farmPools && farmPools.map((pool, index) => {
                                                            return <div key={`pool${index}`} onClick={() => {
                                                                setActivePool(pool)
                                                                togglePools()
                                                            }} className={(activePool.pair == pool.pair ? "selected " : "") + "stake-time-period-item flex flex-row gap-2 items-between justify-between border border-1 rounded-lg hover:bg-gray/50 p-2"}>
                                                                <div>{pool.base.symbol}x{pool.quote.symbol} LP</div>
                                                                <DoubleCurrencyIcon baseIcon={getAssetIconByChainIdFromTokenList(chainId, defaultAssets, pool.base.token)} quoteIcon={getAssetIconByChainIdFromTokenList(chainId, defaultAssets, pool.quote.token)} />

                                                            </div>
                                                        })

                                                    }

                                                </div>
                                            </div>
                                        }





                                        <div className={"flex flex-col gap-2"}>

                                            <div className={"grid grid-cols-2 gap-2"}>


                                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                                        APR
                                                    </span>
                                                    <span className={"text-pink-960 font-semibold whitespace-nowrap"}>
                                                        0
                                                    </span>
                                                </div>

                                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                                        Earnings
                                                    </span>
                                                    <span className={"text-pink-960 font-semibold whitespace-nowrap"}>
                                                        0.0000
                                                    </span>
                                                </div>

                                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                                        Liquidity
                                                    </span>
                                                    <span className={"text-pink-960 font-semibold whitespace-nowrap"}>
                                                        0.0000
                                                    </span>
                                                </div>

                                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                                        NFT Boost
                                                    </span>
                                                    <span className={"text-pink-960 font-semibold whitespace-nowrap"}>
                                                        0.0000
                                                    </span>
                                                </div>

                                            </div>

                                        </div>

                                        <div className="flex items-end items-center justify-end border-t transparent-border-color flex-wrap p-2 py-2">
                                            <div className="whitespace-nowrap"><span
                                                className="text-xs text-fuchsia-600 font-bold">Your Score :</span> <span>{"0.0000"} </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={"transparent-bg w-full rounded-2xl flex gap-2 p-2"}>
                                        <div className="w-full grid grid-cols-4 gap-2 sm:grid-cols-2">
                                            <div className="w-full transparent-bg rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                                                <span className={"text-xs font-bold whitespace-nowrap"}>
                                                    Total Locked Value
                                                </span>
                                                <span className={"text-pink-960 font-semibold whitespace-nowrap"}>
                                                    0.0000
                                                </span>
                                            </div>
                                            <div className="w-full transparent-bg rounded-xl flex flex-col items-center justify-center gap-2  p-2">
                                                <span className={"text-xs font-bold whitespace-nowrap"}>
                                                    Total Rewards
                                                </span>
                                                <span className={"text-cyan-500 font-semibold whitespace-nowrap"}>
                                                    0.0000
                                                </span>
                                            </div>
                                            <div className="w-full transparent-bg rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                                                <span className={"text-xs font-bold whitespace-nowrap"}>
                                                    Num. Of Farmers
                                                </span>
                                                <span className={"text-violet-600 font-semibold whitespace-nowrap"}>
                                                    0.0000
                                                </span>
                                            </div>
                                            <div className="w-full transparent-bg rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                                                <span className={"text-xs font-bold whitespace-nowrap"}>
                                                    Total Score
                                                </span>
                                                <span className={"text-pink-900 font-semibold whitespace-nowrap"}>
                                                    0.0000
                                                </span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="w-full flex flex-col items-center justify-center">
                                        {
                                            ((activePool && activePool.can_stake) && (scoreInfo && scoreInfo.votingMultiplier > 0)) && isUnlocked && <button onClick={() => {

                                            }} className=" my-2 btn btn-primary w-full">Stake</button>
                                        }
                                        {
                                            ((activePool && activePool.can_stake) && (scoreInfo && scoreInfo.votingMultiplier > 0)) && !isUnlocked && <button onClick={() => {

                                            }} className=" my-2 btn btn-primary w-full">Unlock</button>
                                        }

                                    </div>
                                </div>





                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}


export default FarmPage;
