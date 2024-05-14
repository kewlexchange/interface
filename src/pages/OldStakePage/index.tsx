import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
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
import {useDiamondContract, useERC20Contract} from "../../hooks/useContract";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {formatEther, parseEther} from "ethers/lib/utils";
import useDebounce from "../../hooks/useDebounce";
import {AnimationHeader} from "../../Components/AnimationHeader";
import {UnlockStakePool} from "../../Components/UnlockStakePool";

const OldStakePage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId,true);
    const [stakePools,setStakePools] = useState([]);
    const [activeStakePool,setActiveStakePool] = useState(null)
    const {state:showPools, toggle:togglePools } = useModal();

    const [isUnlocked,setUnlocked] = useState(false)
    const [stakeAmount,setStakeAmount] = useState("0")
    const debounceStakeAmount = useDebounce(stakeAmount, 500)

    const [timePeriod,setTimePeriod] = useState(0)
    const [scoreInfo,setScoreInfo] = useState(null)
    const ERC20Contract = useERC20Contract()
    const {state: isTransactionSuccess, toggle: toggleTransactionSuccess} = useModal();
    const {state: isShowLoading, toggle: toggleLoading} = useModal();
    const {state: isErrorShowing, toggle: toggleError} = useModal()
    const [transaction, setTransaction] = useState({hash: '', summary: '', error: null})
    const {state: isNoProvider, toggle: toggleNoProvider} = useModal()



    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);




    const handleAllowance = async () => {
        if(!activeStakePool){return;}
        let poolToken = ERC20Contract(activeStakePool.pool_contract);
        const tokenDecimals = await poolToken.decimals();
        const transferAmount = ethers.utils.parseUnits(stakeAmount,tokenDecimals);
        toggleLoading();
        await poolToken.approve(IMONDIAMOND.address, transferAmount, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${IMONDIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async () => {
           // await loadIGODetails();
            setUnlocked(true);
            toggleLoading();
        });
    }

    const handleStake = async () => {
        if(!activeStakePool){return;}
        let poolToken = ERC20Contract(activeStakePool.pool_contract);
        const tokenDecimals = await poolToken.decimals();
        const transferAmount = ethers.utils.parseUnits(stakeAmount,tokenDecimals);
        toggleLoading();
        await IMONDIAMOND.stake(timePeriod,activeStakePool.proposalId,transferAmount).then(async (tx) => {
            await tx.wait();
            const summary = `Staking tokens for: ${IMONDIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async () => {
            setUnlocked(false);
            toggleLoading();
        });
    }

    const getScoreInfo = async (inputAmount) => {
        const _scoreInfo = await IMONDIAMOND.getUserCurrentScoreInfo(inputAmount,activeStakePool.proposalId,timePeriod,account)
        setScoreInfo(_scoreInfo);
    }

    const checkAllowance = async (amount) =>{
        // Token
        if(!IMONDIAMOND){return;}
        if(!activeStakePool){return;}
        if(!account){return;}
        if(amount == ""){amount = "0"}

        let poolToken = ERC20Contract(activeStakePool.pool_contract);
        const tokenDecimals = await poolToken.decimals();
        const inputAmount = ethers.utils.parseUnits(amount,tokenDecimals)
        const allowanceAmount = await poolToken.allowance(account,IMONDIAMOND.address);

        if(inputAmount > allowanceAmount){
            setUnlocked(false)
        }else{
            setUnlocked(true)
        }
        await getScoreInfo(inputAmount)


    }

    useEffect(() => {
        checkAllowance(debounceStakeAmount)
    },[IMONDIAMOND,debounceStakeAmount,timePeriod,activeStakePool])

    const handleChangeInput = (e) => {
        setStakeAmount(e.target.value)
    }

    const loadStakePools = async () => {
        const _stakePools = await IMONDIAMOND.getPools();
        setStakePools(_stakePools);
        if(_stakePools.length>0){
            setActiveStakePool(_stakePools[0])
        }
    }

    useEffect(()=>{
        if(chainId){
            loadStakePools();
        }
    },[chainId,account])

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
                                                <div className="z-20 flex items-center justify-center">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    playlist_add_check_circle
                                                </span>
                                                    <span translate={"no"}>Stake</span>
                                                </div>
                                                <div className="absolute top-0 left-0 right-0 z-10 h-full bg-white/30 shadow rounded-full"></div>
                                            </NavLink>
                                            <NavLink to={"/earn/unstake"} role="tab" className="grid place-items-center text-center w-full h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal text-[#FFFFFF]" data-value="html">
                                                <div className="z-20 flex items-center justify-center">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    playlist_add_circle
                                                </span>
                                                    <span translate={"no"}>Unstake</span>
                                                </div>
                                            </NavLink>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                            <div className={"grid grid-cols-1 mx-auto w-full sm:w-full gap-2"}>


                                <div className="rounded-xl transparent-bg px-4 pb-4 w-full">
                                    <div className="transparent-bg rounded-xl pb-0 mt-4 mb-4">
                                        <div className="flex items-center justify-between border-b transparent-border-color flex-wrap p-2 py-4">
                                            <span translate={"no"} className="flex items-center gap-x-2 whitespace-nowrap">Stake</span>
                                            <div className="whitespace-nowrap"><span
                                                className="text-xs text-sky-600 font-bold">Balance :</span> <span>{scoreInfo && ethers.utils.formatUnits(scoreInfo.userBalance,activeStakePool.pool_decimals)} {activeStakePool && activeStakePool.pool_symbol} </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-start py-2 pl-2 ">
                                            <button onClick={()=>{
                                                togglePools();
                                            }} className="flex items-center gap-x-2 pr-8 select-none cursor-pointer bg-white/30 hover:bg-white/50 rounded-full p-2">
                                                {
                                                    activeStakePool && <img src={getAssetIconByChainId(chainId,activeStakePool.pool_contract)} className="w-5 h-5" alt=""/>
                                                }{
                                                activeStakePool && activeStakePool.pool_symbol
                                            }<span translate={"no"}
                                                className="material-symbols-outlined">expand_more</span></button>
                                            <div className="w-full flex items-center justify-between relative px-2">
                                                <input  onChange={(e) => {
                                                    handleChangeInput(e)
                                                }
                                                } type="text" placeholder="Enter Stake Amount"  className="bg-white rounded-full pl-3 w-full" defaultValue={stakeAmount}/>
                                            </div>
                                        </div>

                                        {
                                            showPools &&  <div className="mx-2 transparent-bg rounded-lg flex items-start flex-col justify-start p-2 ">
                                                <div className={"w-full border-b transparent-border-color mb-2"}>
                                                    <span className={"font-bold"}>Stake Pools</span>
                                                </div>
                                                <div className="w-full grid grid-cols-4 sm:grid-cols-2 gap-2 ">
                                                    {
                                                        stakePools && stakePools.map((pool,index)=>{
                                                            return <div key={`pool${index}`} onClick={()=>{
                                                                setActiveStakePool(pool)
                                                                togglePools()
                                                            }} className={(activeStakePool.pool_contract == pool.pool_contract ? "selected " : "") + "stake-time-period-item"}>
                                                                <div className={"period"}>{pool.pool_symbol} x {pool.reward_symbol}</div>
                                                                <div className={"badge bg-white/50"}>
                                                                    <img src={getAssetIconByChainId(chainId,pool.pool_contract)}/>
                                                                </div>
                                                            </div>
                                                        })

                                                    }

                                                </div>
                                            </div>
                                        }





                                        <div className={"flex flex-col p-2 gap-2"}>

                                            {
                                                ((activeStakePool && activeStakePool.can_stake == false) || (scoreInfo && scoreInfo.votingMultiplier == false)) && <UnlockStakePool repeat={true} width={"50%"} height={"50%"} className={"w-full p-2 row-auto"} dataSource={"/images/animation/unlock-with-vote.json"}/>

                                            }

                                            <div className={"grid grid-cols-2 gap-2"}>


                                                <div className="row-span-2 sm:row-span-4 rounded-lg  flex items-start flex-col justify-start p-2 transparent-bg ">
                                                    <div className={"w-full border-b transparent-border-color mb-2"}>
                                                        <span className={"font-bold"}>Time Lock Period</span>
                                                    </div>
                                                    <div className="w-full grid grid-cols-2 sm:grid-cols-1 gap-2 ">
                                                        <div onClick={()=>(setTimePeriod(0))} className={(timePeriod == 0 ? "selected " : "") + "stake-time-period-item"}>
                                                            <div className={"period"}>1 Month</div>
                                                            <div translate={"no"} className={"badge bg-purple-600"}>1x</div>
                                                        </div>
                                                        <div onClick={()=>(setTimePeriod(1))}  className={(timePeriod == 1 ? "selected " : "") + "stake-time-period-item"}>
                                                            <div className={"period"}>3 Month</div>
                                                            <div translate={"no"}  className={"badge bg-fuchsia-500"}>2x</div>
                                                        </div>
                                                        <div onClick={()=>(setTimePeriod(2))}  className={(timePeriod == 2 ? "selected " : "") + "stake-time-period-item"}>
                                                            <div className={"period"}>6 Month</div>
                                                            <div translate={"no"}  className={"badge bg-blue-500"}>4x</div>
                                                        </div>
                                                        <div onClick={()=>(setTimePeriod(3))}  className={(timePeriod == 3 ? "selected " : "") + "stake-time-period-item"}>
                                                            <div className={"period"}>1 Year</div>
                                                            <div translate={"no"}  className={"badge bg-green-500"}>8x</div>
                                                        </div>
                                                        <div onClick={()=>(setTimePeriod(4))}  className={(timePeriod == 4 ? "selected " : "") + "stake-time-period-item"}>
                                                            <div className={"period"}>2 Year</div>
                                                            <div translate={"no"}  className={"badge bg-lime-500"}>16x</div>
                                                        </div>
                                                        <div onClick={()=>(setTimePeriod(5))}  className={(timePeriod == 5 ? "selected " : "") + "stake-time-period-item"}>
                                                            <div className={"period"}>3 Year</div>
                                                            <div translate={"no"}  className={"badge  bg-yellow-500"}>32x</div>
                                                        </div>
                                                        <div onClick={()=>(setTimePeriod(6))}  className={(timePeriod == 6 ? "selected " : "") + "stake-time-period-item"}>
                                                            <div className={"period"}>4 Year</div>
                                                            <div translate={"no"}  className={"badge bg-orange-500"}>64x</div>

                                                        </div>
                                                        <div onClick={()=>(setTimePeriod(7))}  className={(timePeriod == 7 ? "selected " : "") + "stake-time-period-item"}>
                                                            <div className={"period"}>5 Year</div>
                                                            <div translate={"no"}  className={"badge bg-red-500"}>128x</div>
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className="transparent-bg  rounded-lg flex items-start flex-col justify-start p-2 ">
                                                    <div className={"w-full border-b transparent-border-color mb-2"}>
                                                        <span className={"font-bold"}>Amount Multiplier</span>
                                                    </div>
                                                    <div className="w-full gap-2 ">
                                                        <div className={"selected flex flex-row items-center justify-around w-full"}>
                                                            <div className={"w-full"}>{scoreInfo ? formatEther(scoreInfo.amountMultiplier) : "0" }  {getNativeCurrencyByChainId(chainId)}</div>
                                                            <div className={"badge bg-sky-600"}>1x</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="transparent-bg  rounded-lg flex items-start flex-col justify-start p-2 ">
                                                    <div className={"w-full border-b transparent-border-color mb-2"}>
                                                        <span className={"font-bold"}>Voting Multiplier</span>
                                                    </div>
                                                    <div className="w-full gap-2 ">
                                                        <div className={"selected flex flex-row items-center justify-around w-full"}>
                                                            <div className={"w-full"}>{scoreInfo ? formatEther(scoreInfo.votingMultiplier) : "0" }  {getNativeCurrencyByChainId(chainId)}</div>
                                                            <div className={"badge bg-pink-600"}>1x</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="transparent-bg  rounded-lg flex items-start flex-col justify-start p-2 ">
                                                    <div className={"w-full border-b transparent-border-color mb-2"}>
                                                        <span className={"font-bold"}>Referral Multiplier</span>
                                                    </div>
                                                    <div className="w-full gap-2 ">
                                                        <div className={"selected flex flex-row items-center justify-around w-full"}>
                                                            <div className={"w-full"}>{scoreInfo ? formatEther(scoreInfo.referralMintMultiplier) : "0" }  {getNativeCurrencyByChainId(chainId)}</div>
                                                            <div className={"badge bg-green-600"}>1x</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="transparent-bg  rounded-lg flex items-start flex-col justify-start p-2 ">
                                                    <div className={"w-full border-b transparent-border-color mb-2"}>
                                                        <span className={"font-bold"}>Burn Multiplier</span>
                                                    </div>
                                                    <div className="w-full gap-2 ">
                                                        <div className={"selected flex flex-row items-center justify-around w-full"}>
                                                            <div className={"w-full"}>{scoreInfo ? formatEther(scoreInfo.referralBurnMultiplier) : "0" }  {getNativeCurrencyByChainId(chainId)}</div>
                                                            <div className={"badge bg-orange-500"}>1x</div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="flex items-end items-center justify-end border-t transparent-border-color flex-wrap p-2 py-2">
                                            <div className="whitespace-nowrap"><span
                                                className="text-xs text-fuchsia-600 font-bold">Your Score :</span> <span>{scoreInfo ? BigNumber.from(scoreInfo.totalScore).toNumber() : "0" } </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={"transparent-bg w-full rounded-2xl flex gap-2 p-2"}>
                                        <div className="w-full grid grid-cols-4 gap-2 sm:grid-cols-2">
                                            <div className="w-full transparent-bg rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                                                <span className={"text-xs font-bold whitespace-nowrap"}>
                                                   Total Value Locked
                                                </span>
                                                <span className={"text-pink-960 font-semibold whitespace-nowrap"}>
                                                    {activeStakePool && formatEther(activeStakePool.total_deposit_amount)}
                                                </span>
                                            </div>
                                            <div className="w-full transparent-bg rounded-xl flex flex-col items-center justify-center gap-2  p-2">
                                                <span className={"text-xs font-bold whitespace-nowrap"}>
                                                   Total Rewards
                                                </span>
                                                <span className={"text-cyan-500 font-semibold whitespace-nowrap"}>
                                                    {activeStakePool && formatEther(activeStakePool.total_reward_amount)}
                                                </span>
                                            </div>
                                            <div className="w-full transparent-bg rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                                                <span className={"text-xs font-bold whitespace-nowrap"}>
                                                   Num. Of Stakers
                                                </span>
                                                <span className={"text-violet-600 font-semibold whitespace-nowrap"}>
                                                    {activeStakePool && BigNumber.from(activeStakePool.total_stakers).toNumber()}
                                                </span>
                                            </div>
                                            <div className="w-full transparent-bg rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                                                <span className={"text-xs font-bold whitespace-nowrap"}>
                                                   Total Score
                                                </span>
                                                <span className={"text-pink-900 font-semibold whitespace-nowrap"}>
                                                  {activeStakePool && BigNumber.from(activeStakePool.total_score).toNumber()}
                                            </span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="w-full flex flex-col items-center justify-center">
                                        {
                                            ((activeStakePool && activeStakePool.can_stake) && (scoreInfo && scoreInfo.votingMultiplier > 0)) && isUnlocked && <button onClick={()=>{
                                                handleStake()
                                            }} className=" my-2 btn btn-primary w-full">Stake</button>
                                        }
                                        {
                                            ((activeStakePool && activeStakePool.can_stake) && (scoreInfo && scoreInfo.votingMultiplier > 0)) && !isUnlocked && <button onClick={()=>{
                                                handleAllowance()
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


export default OldStakePage;
