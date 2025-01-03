import IPage from "../../interfaces/page";
import React, {memo, useCallback, useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import Identicon from "../../Components/Identicon";
import {
    generateExplorerURLByChain, getAssetIconByChainId,
    getIconByChainId,
    getNativeCurrencyByChainId,
    unixTimeToDateTime
} from "../../utils";
import {BigNumber} from "@ethersproject/bignumber";
import {ethers} from "ethers";
import {useWeb3React} from "@web3-react/core";
import {useDiamondContract, useERC20Contract, useTokenContract} from "../../hooks/useContract";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {formatEther} from "ethers/lib/utils";
import {NFT} from "../../Components/NFT";
import {updateStakingItemIsExpanded} from "../../state/user/reducer";
import { useAppDispatch, useAppSelector } from "../../state/hooks";

const UnstakePage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId,true);
    const [userStakings,setUserStakings] = useState([]);
    const {state: isTransactionSuccess, toggle: toggleTransactionSuccess} = useModal();
    const {state: isShowLoading, toggle: toggleLoading} = useModal();
    const {state: isErrorShowing, toggle: toggleError} = useModal()
    const [transaction, setTransaction] = useState({hash: '', summary: '', error: null})
    const {state: isNoProvider, toggle: toggleNoProvider} = useModal()
    const dispatch = useAppDispatch()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);


    const _StakeItem = (props:{stakingItem,index,expanded}) =>{
        const {state: isExpanded, toggle: toggleExpanded} = useModal()
        const isExpandedState = useAppSelector((state) => (state.user.stakingItems[props.index]["expanded"]));

        const updateState = () => {
            dispatch(updateStakingItemIsExpanded({ index: props.index,expanded:!isExpandedState}))

        }


        return(
            <>
                <div className="transparent-bg rounded-xl pb-0 mt-4 mb-4 hover:bg-white/20">
                    <div className="flex items-center justify-between border-b transparent-border-color flex-wrap p-2 py-4">
                        <div className="flex items-center gap-x-2 whitespace-nowrap">
                            <img className={"rounded-full w-6 h-6"} src={getAssetIconByChainId(chainId,props.stakingItem.poolToken)}/>
                            {props.stakingItem.poolName}
                        </div>
                        <div className="whitespace-nowrap">
                            <button className={"transparent-bg hover:bg-white/30 rounded-lg px-2"}>
                                Claim
                            </button>
                        </div>
                    </div>
                    <div className={"w-full grid grid-cols-1 rounded-2xl flex gap-2 p-2"}>
                        <div className="w-full transparent-bg rounded-xl flex flex-row items-center justify-between gap-2 p-2">
                            <div className={"flex flex-col"}>
                                <span className={"text-xs font-bold whitespace-nowrap"}>Reward Amount</span>
                                <span className={"font-extrabold"}>{ethers.utils.formatUnits(props.stakingItem.rewardAmount,props.stakingItem.rewardDecimals)}</span>
                            </div>
                            <button onPress={()=>{
                                updateState()
                            }} className={"rounded-full flex items-center justify-center w-8 h-8 transparent-bg hover:bg-white/30"}>
                                <span translate={"no"} className="material-symbols-outlined">
                                    expand_more
                                </span>
                            </button>
                        </div>
                        {isExpandedState &&
                            <div className={"w-full grid grid-cols-2 gap-2"}>
                                <div className={"row-span-6 sm:row-span-6 sm:col-span-2 "}>
                                    <NFT itemType={"ERC-1155"} canStake={true} showMetadata={false} reloadFunction={undefined} canSell={false} key={"nft"} contractAddress={props.stakingItem.nft} tokenId={props.stakingItem.tokenId}/>
                                </div>
                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                                                            <span className={"text-xs font-bold whitespace-nowrap"}>
                                                                               Locked Amount
                                                                            </span>
                                    <span className={"text-pink-960 font-semibold whitespace-nowrap"}>
                                                                                {formatEther(props.stakingItem.depositAmount)}
                                                                            </span>
                                </div>
                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2  p-2">
                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                                                               Time Period
                                                                            </span>
                                    <span className={"text-cyan-500 font-semibold whitespace-nowrap"}>
                                                                                {BigNumber.from(props.stakingItem.timePeriod.div(86400)).toNumber()}
                                                                            </span>
                                </div>
                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                        Score
                                    </span>
                                    <span className={"text-violet-600 font-semibold text-xs  text-xs whitespace-nowrap"}>{BigNumber.from(props.stakingItem.totalScore).toNumber()} </span>
                                </div>
                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                        Joined At
                                    </span>
                                    <span className={"text-violet-600 font-semibold text-xs  whitespace-nowrap"}>
                                       {unixTimeToDateTime(props.stakingItem.joinedAt)}
                                    </span>
                                </div>
                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                        Unlock Time
                                    </span>
                                    <span className={"text-violet-600 font-semibold text-xs  whitespace-nowrap"}>
                                            {unixTimeToDateTime(props.stakingItem.unlockedAt)}
                                     </span>
                                </div>
                                <div className="w-full transparent-bg rounded-xl flex flex-col items-start justify-center gap-2 p-2">
                                    <span className={"text-xs font-bold whitespace-nowrap"}>
                                        Claim Request
                                    </span>
                                    <span className={"text-violet-600 font-semibold text-xs  whitespace-nowrap"}>
                                        {props.stakingItem.requestedAt > 0 ? unixTimeToDateTime(props.stakingItem.requestedAt) : "-"}
                                  </span>
                                </div>
                            </div>

                        }
                    </div>
                </div>
            </>
        )
    }
    const StakeItem = memo(_StakeItem)

        useEffect(()=>{

    },[userStakings])
    const loadStakingPools = async () => {
        if(!account){return}
        var _userStakings = await IMONDIAMOND.getUserStakingInfo(account);
        var stakingItems = [];
        _userStakings.map((stakingItem,index)=>{
            stakingItems.push( {expanded:false,item:stakingItem})
        })
        setUserStakings(stakingItems);
    }

    useEffect(()=>{
        if(chainId){
            loadStakingPools();
        }
    },[])

    return (

        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider}/>

            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                          isShowing={isShowLoading}/>
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                                     isShowing={isTransactionSuccess}/>


            <div className={"container mx-auto my-5"}>
                <div className={"mx-auto w-[50%] sm:w-full"}>
                <div className={"grid grid-cols-1 gap-5"}>
                    <div className={"transparent-bg  border-1 rounded-xl p-2 w-full"}>

                        <div className="w-full max-w-full">
                            <div className="block overflow-hidden mb-3">
                                <nav>
                                    <div role="tablist" className="flex relative bg-opacity-60 p-1 h-10 w-auto rounded-full transparent-bg shadow-2xl shadow-blue-gray-500/40">
                                        <NavLink to={"/earn/stake"} role="tab" className="grid place-items-center text-center w-full h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal text-[#FFFFFF]" data-value="react">
                                            <div translate={"no"} className="z-20 flex items-center justify-center">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    playlist_add_check_circle
                                                </span>
                                                &nbsp;Stake
                                            </div>
                                        </NavLink>
                                        <NavLink to={"/earn/unstake"} role="tab" className="grid place-items-center text-center w-full h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal text-[#FFFFFF]" data-value="html">
                                            <div className="z-20 flex items-center justify-center">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    playlist_add_circle
                                                </span>
                                                &nbsp;Unstake
                                            </div>
                                            <div className="absolute top-0 left-0 right-0 z-10 h-full bg-white/30 shadow rounded-full"></div>
                                        </NavLink>
                                    </div>
                                </nav>
                            </div>
                        </div>
                        <div className={"grid grid-cols-1 mx-auto w-full sm:w-full gap-2"}>
                            <div className="rounded-xl transparent-bg px-4 pb-4 w-full">
                                    {
                                        userStakings && userStakings.length > 0 ? userStakings.map((stakingItem,key)=>{
                                            return <StakeItem index={key} key={`stk${key}`} expanded={stakingItem.expanded} stakingItem={stakingItem.item}/>
                                        })
                                            :<div className={"w-full flex items-center justify-center py-10"}>
                                                <span className={"text-lg w-full text-center"}>Your active staking positions will appear here.</span>
                                            </div>
                                    }
                            </div>
                        </div>

                    </div>
                </div>
                </div>
            </div>

        </>
    )
}


export default UnstakePage;
