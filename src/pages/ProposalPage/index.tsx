import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import {
    convertTimeStampToDay,
    generateExplorerURLByChain,
    getIconByChainId,
    getNativeCurrencyByChainId, getShordAccountForMobile, unixTimeToDateTime
} from "../../utils";
import {useWeb3React} from "@web3-react/core";
import {useDiamondContract} from "../../hooks/useContract";
import {ethers} from "ethers";
import {BigNumber} from "@ethersproject/bignumber";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {formatEther, isAddress, parseEther} from "ethers/lib/utils";
import Identicon from "../../Components/Identicon";
import {NavLink} from "react-router-dom";
import IconDAO from "../../assets/images/icons/dao.svg";
import { useLocation } from 'react-router-dom';

const ProposalPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [proposalIndex, setProposalIndex] = useState(ethers.constants.AddressZero)
    const location = useLocation()
    const [proposalItem,setProposalItem] = useState(null);
    const [votes,setVotes] = useState(null);


    const [contractAddress,setContractAddress] = useState("")
    const [tokenInfo,setTokenInfo] = useState(null);
    const [description,setDescription] = useState("")
    const IMONDIAMOND = useDiamondContract(chainId,true);
    const [proposals,setProposals] = useState([]);




    const initProposalInfo = async () => {
        const [_proposal,_votes] = await IMONDIAMOND.getProposal(proposalIndex);
        setProposalItem(_proposal)
        setVotes(_votes);
    }
    useEffect(()=>{
        if(!chainId){return;}
        if(parseInt(proposalIndex) >= 0){
            initProposalInfo();
        }
    },[proposalIndex,chainId,account,connector])

    const handleVote = async (proposal, isUpVote) => {
        if(!chainId){return}
        if(!IMONDIAMOND){return}
        if(!ethers.utils.isAddress(proposal.token)){
            return;
        }
        if(!account){return;}
        toggleLoading();
        let proposalOverrides = {value:proposal.voteFee}
        await IMONDIAMOND.vote(proposal.token,isUpVote,proposalOverrides).then(async (tx) => {
            await tx.wait();
            const summary = `Voting Proposal for: ${proposal.token}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async ()=>{
            await initProposalInfo();
            toggleLoading();
        });
    }

    useEffect(() => {
        const _proposalIndex  = location.pathname.replace("/dao/","")
        setProposalIndex(_proposalIndex)
        document.title = props.title + " " + _proposalIndex + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />

            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading  text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading} isShowing={isShowLoading}/>
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess}/>


            <div className={"container mt-[20px] w-2/4 mx-auto sm:w-full mdx:w-2/3 md:w-5/6 md2:w-4/5 2xl:w-3/4 sm:mt-2"}>
                <div className={"grid grid-cols-1 gap-5"}>
                    <div className={"transparent-bg border-1 rounded-xl p-2 w-full"}>

                        <div className="w-full max-w-full">
                            <div className="block overflow-hidden mb-3">
                                <nav>
                                    <div role="tablist" className="flex relative bg-opacity-60 p-1 h-10 w-auto rounded-full border transparent-bg shadow-2xl shadow-blue-gray-500/40 backdrop-blur-2xl backdrop-saturate-200">

                                        <NavLink to={`/dao/${proposalItem && proposalItem.index}`} role="tab" className="grid place-items-center text-center w-full h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal text-[#FFFFFF]" data-value="html">
                                            <div className="z-20 flex items-center justify-center">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    playlist_add_circle
                                                </span>
                                                &nbsp;Proposal : {proposalItem && proposalItem.description}
                                            </div>
                                            <div className="absolute top-0 left-0 right-0 z-10 h-full bg-white/30 shadow rounded-full"></div>
                                        </NavLink>
                                        <NavLink to={"/dao"} role="tab" className="grid place-items-center text-center w-full h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal text-[#FFFFFF]" data-value="react">
                                            <div className="z-20 flex items-center justify-center">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    playlist_add_check_circle
                                                </span>
                                                &nbsp;Stake Proposals
                                            </div>
                                        </NavLink>
                                    </div>
                                </nav>
                            </div>
                        </div>
                        <div className={"grid grid-cols-1 mx-auto w-[50%] sm:w-full gap-2"}>
                            {
                                proposalItem && <div key={`proposalItem`} className="hover:shadow-lg rounded-2xl p-4 transparent-bg w-full">



                                    </div>
                            }
                            {
                                votes && votes.length > 0 &&
                                <div key={`votes`} className="hover:shadow-lg rounded-2xl p-4 transparent-bg  w-full">
                                    <div className="w-full h-full rounded-xl">
                                        <div className="flex flex-col justify-between w-full text-center rounded-xl dark:border-gray-700">
                                            <div>
                                                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                                                    Votes {votes.length}
                                                </h3>
                                            </div>


                                            <div className="mt-8">
                                                <ul className="flex flex-col text-left space-y-1.5">

                                                    {
                                                        votes.slice(0).reverse().map((voteItem,index)=>{
                                                            return <li key={`voteItem${index}`}
                                                                className="relative flex gap-x-4 pb-2 overflow-hidden">
                                                                <div className="mt-0.5 relative h-full">
                                                                    <div className="absolute top-7 bottom-0 left-2.5 w-px h-96 -ml-px border-r border-dashed border-gray-300 dark:border-gray-600"></div>
                                                                    {
                                                                        voteItem.isUpVote ? <div className={"text-green-600"}>
                                                                            <span translate={"no"} className="material-symbols-outlined">thumb_up</span>
                                                                        </div> : <div className={"text-red-600"}>
                                                                            <span translate={"no"} className="material-symbols-outlined">thumb_down</span>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div className="py-1.5 w-full rounded-full text-xs font-medium text-gray-600 bg-transparent hover:bg-white/30 hover:cursor-pointer border border-gray-200 shadow-sm dark:text-gray-400 dark:bg-slate-900 dark:border-gray-700">
                                                                    <div  className="flex flex-row gap-2 items-center justify-center px-2">
                                                                        <div className={"w-full flex flex-row gap-2 items-center justify-start"}>
                                                                            <Identicon size={16} account={voteItem.delegate}/>
                                                                            <span>{getShordAccountForMobile(voteItem.delegate)}</span>
                                                                        </div>
                                                                        <div className={"w-full flex flex-row gap-2 items-center justify-end"}>
                                                                            <span>{formatEther(voteItem.totalDeposit)}</span><img className={"w-5 h-5"} src={getIconByChainId(chainId,false)}/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        })
                                                    }

                                                </ul>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute top-1/2 -left-1/2 -z-[1] w-60 h-32 bg-purple-200 blur-[100px] -translate-y-1/2 dark:bg-violet-900/30"></div>
                                    </div>



                                </div>
                            }



                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}


export default ProposalPage;
