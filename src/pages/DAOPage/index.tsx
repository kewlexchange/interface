import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import {
    convertTimeStampToDay,
    generateExplorerURLByChain,
    getIconByChainId,
    getNativeCurrencyByChainId, unixTimeToDateTime
} from "../../utils";
import {useWeb3React} from "@web3-react/core";
import {useDiamondContract} from "../../hooks/useContract";
import {ethers} from "ethers";
import {BigNumber} from "@ethersproject/bignumber";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {parseEther} from "ethers/lib/utils";
import Identicon from "../../Components/Identicon";
import {Link, NavLink} from "react-router-dom";
import {AnimationHeader} from "../../Components/AnimationHeader";
import NO_PROPOSAL_FOUND_LOTTIE from '../../assets/images/animation/no-proposal-found.json';
import ReactSpeedometer from "react-d3-speedometer";
import GaugeChart from "react-gauge-chart";

const DAOPage: React.FunctionComponent<IPage> = props => {
    const {connector, account, provider, chainId} = useWeb3React()
    const {state: isTransactionSuccess, toggle: toggleTransactionSuccess} = useModal();
    const {state: isShowLoading, toggle: toggleLoading} = useModal();
    const {state: isErrorShowing, toggle: toggleError} = useModal()
    const [transaction, setTransaction] = useState({hash: '', summary: '', error: null})
    const {state: isNoProvider, toggle: toggleNoProvider} = useModal()

    const [contractAddress, setContractAddress] = useState("")
    const [tokenInfo, setTokenInfo] = useState(null);
    const [description, setDescription] = useState("")
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const [proposals, setProposals] = useState([]);


    const fetchTokenInfo = async () => {
        if (!contractAddress) {
            setTokenInfo(null);
            return;
        }
        if (!chainId) {
            return
        }
        if (!IMONDIAMOND) {
            return
        }
        if (!ethers.utils.isAddress(contractAddress)) {
            setTokenInfo(null);
            return;
        }
        const _tokenInfo = await IMONDIAMOND.getTokenInfo(contractAddress);
        setTokenInfo(_tokenInfo);
    }

    useEffect(() => {
        if (!chainId) {
            return;
        }
        initDefaults();
    }, [chainId, account, provider])
    useEffect(() => {
        fetchTokenInfo();
    }, [contractAddress])

    const handleChangeInput = (e) => {
        setContractAddress(e.target.value)
    }

    const handleChangeDescriptionInput = (e) => {
        setDescription(e.target.value)
    }

    const initDefaults = async () => {
        const _proposals = await IMONDIAMOND.getProposals();
        console.log("PROPS",_proposals);
        setProposals(_proposals)
    }

    const handleVote = async (proposal, isUpVote) => {
        if (!chainId) {
            return
        }
        if (!IMONDIAMOND) {
            return
        }
        if (!ethers.utils.isAddress(proposal.stake_token)) {
            return;
        }
        if (!account) {
            return;
        }
        toggleLoading();
        let proposalOverrides = {value: proposal.vote_fee}
        await IMONDIAMOND.vote(proposal.index, isUpVote, proposalOverrides).then(async (tx) => {
            await tx.wait();
            const summary = `Voting Proposal for: ${proposal.stake_token}`
            setTransaction({hash: tx.hash, summary: summary, error: null});
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({hash: '', summary: '', error});
            toggleError();
        }).finally(async () => {
            await initDefaults();
            toggleLoading();
        });
    }
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
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


            <div
                className={"container mt-[20px] w-2/4 mx-auto sm:w-full mdx:w-2/3 md:w-5/6 md2:w-4/5 2xl:w-3/4 sm:mt-2"}>
                <div className={"grid grid-cols-1 gap-5"}>
                    <div className={"transparent-bg  border-1 rounded-xl p-2 w-full"}>

                        <div className="w-full max-w-full">
                            <div className="block overflow-hidden mb-3">
                                <nav>
                                    <div role="tablist"
                                         className="flex relative bg-opacity-60 p-1 h-10 w-auto rounded-full transparent-bg shadow-2xl shadow-blue-gray-500/40">
                                        <NavLink to={"/dao"} role="tab"
                                                 className="grid place-items-center text-center w-full h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal text-[#FFFFFF]"
                                                 data-value="react">
                                            <div className="z-20 flex items-center justify-center">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    playlist_add_check_circle
                                                </span>
                                                &nbsp;Stake Proposals
                                            </div>
                                            <div
                                                className="absolute top-0 left-0 right-0 z-10 h-full bg-white/30 shadow rounded-full"></div>
                                        </NavLink>
                                        <NavLink to={"/dao/create"} role="tab"
                                                 className="grid place-items-center text-center w-full h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal text-[#FFFFFF]"
                                                 data-value="html">
                                            <div className="z-20 flex items-center justify-center">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    playlist_add_circle
                                                </span>
                                                &nbsp;Create Proposal
                                            </div>
                                        </NavLink>
                                    </div>
                                </nav>
                            </div>
                        </div>
                        {
                            proposals.length > 0 ? <>
                                    <div className={"grid grid-cols-2 sm:grid-cols-1 gap-2"}>
                                        {
                                            proposals.slice(0).reverse().map((proposalItem, index) => {
                                                return <div key={`proposalItem${index}`} className="hover:shadow-lg rounded-2xl p-4 transparent-bg w-full">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center">
                                                            <span className="rounded-xl relative p-2 bg-blue-100">
                                                                <Identicon size={25} account={proposalItem.stake_token}/>
                                                            </span>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-md text-white dark:text-white ml-2">
                                                                    {proposalItem.description}
                                                                </span>
                                                                <span className="text-[8px] text-gray-500 dark:text-white ml-2">
                                                                     {proposalItem.stake_token}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <a target={"_blank"} href={generateExplorerURLByChain(chainId, proposalItem.stake_token, true)} className="hover:shadow-lg hover:border-sky-800 border w-[30px] h-[30px] p-1 border-gray-200 flex items-center justify-center rounded-full">
                                                                   <span translate={"no"} className="material-symbols-outlined">
                                                                        visibility
                                                                   </span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-start gap-2 my-2">
                                                        {proposalItem.executed ?
                                                            <span className="px-2 py-1 flex items-center font-semibold text-xs rounded-md text-green-700 bg-green-50">
                                                                EXECUTED
                                                            </span>
                                                            :
                                                            <span className="px-2 py-1 flex items-center text-xs rounded-md text-blue-600 font-semibold bg-blue-200">
                                                                ACTIVE
                                                            </span>
                                                        }
                                                        <span className={"px-2 py-1 flex items-center text-xs rounded-md text-green-600 font-semibold bg-green-200"}>Required Vote Count : {BigNumber.from(proposalItem.vote_count).toNumber()}</span>

                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className={"w-full grid grid-cols-1 gap-2 transparent-bg p-2 rounded-lg"}>
                                                            <p className="flex flex-row items-center justify-start text-white">
                                                                <span translate={"no"} className="material-symbols-outlined">badge</span>
                                                                <span className="mt-2 xl:mt-0 sm:text-xs w-fulls">
                                                                  {proposalItem.stake_asset_name}
                                                                </span>
                                                            </p>
                                                            <p className="flex flex-row items-center justify-start text-white">
                                                                <span translate={"no"} className="material-symbols-outlined">add_photo_alternate</span>
                                                                <span className="mt-2 xl:mt-0 whitespace-nowrap sm:text-xs w-fulls">
                                                                    {proposalItem.stake_asset_symbol}
                                                                </span>
                                                            </p>
                                                            <p className="flex flex-row items-center justify-start text-white">
                                                            <span translate={"no"} className="material-symbols-outlined">repeat_one</span>
                                                                <span className="mt-2 xl:mt-0 sm:text-xs w-fulls">
                                                                  {BigNumber.from(proposalItem.stake_asset_decimals).toNumber()}
                                                                </span>
                                                            </p>
                                                            <p className="flex flex-row items-center justify-start text-white">
                                                                <span translate={"no"}className="material-symbols-outlined">group_work </span>
                                                                <span className="mt-2 xl:mt-0 sm:text-xs w-fulls">
                                                                  {ethers.utils.formatUnits(proposalItem.stake_asset_total_supply, proposalItem.stake_asset_decimals)}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className={"w-full grid grid-cols-1 gap-2 transparent-bg p-2 rounded-lg"}>
                                                            <p className="flex flex-row items-center justify-start text-white">
                                                                <span translate={"no"} className="material-symbols-outlined">badge</span>
                                                                <span className="mt-2 xl:mt-0 whitespace-nowrap sm:text-xs w-fulls">
                                                                  {proposalItem.reward_asset_name}
                                                                </span>
                                                            </p>
                                                            <p className="flex flex-row items-center justify-start text-white">
                                                                <span translate={"no"} className="material-symbols-outlined">add_photo_alternate</span>
                                                                <span className="mt-2 xl:mt-0 sm:text-xs w-fulls">
                                                                    {proposalItem.reward_asset_symbol}
                                                                </span>
                                                            </p>
                                                            <p className="flex flex-row items-center justify-start text-white">
                                                                <span translate={"no"} className="material-symbols-outlined">repeat_one</span>
                                                                <span className="mt-2 xl:mt-0 sm:text-xs w-fulls">
                                                                  {BigNumber.from(proposalItem.reward_asset_decimals).toNumber()}
                                                                </span>
                                                            </p>
                                                            <p className="flex flex-row items-center justify-start text-white">
                                                                <span translate={"no"}className="material-symbols-outlined">group_work </span>
                                                                <span className="mt-2 xl:mt-0 sm:text-xs w-fulls">
                                                                  {ethers.utils.formatUnits(proposalItem.reward_asset_total_supply, proposalItem.reward_asset_decimals)}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 m-auto mt-5">
                                                        <div
                                                            className={"w-full flex flex-col gap-2 items-center justify-center"}>
                                                            <span
                                                                className="text-sm inline-block text-gray-500 dark:text-gray-100">
                                                                Positive Votes
                                                            </span>
                                                            <GaugeChart
                                                                id={`positiveVotes${index}-${proposalItem.stake_asset_token}`}
                                                                nrOfLevels={20}
                                                                colors={["green", "red"]}
                                                                arcWidth={0.3}
                                                                percent={proposalItem.up_vote / 100}
                                                                textColor={"#fff"}
                                                                needleBaseColor={"green"}
                                                                formatTextValue={(value) => proposalItem.up_vote}
                                                            />
                                                        </div>
                                                        <div
                                                            className={"w-full flex flex-col gap-2 items-center justify-center"}>
                                                            <span
                                                                className="text-sm inline-block text-gray-500 dark:text-gray-100">
                                                                Negative Votes
                                                            </span>
                                                            <GaugeChart
                                                                id={`negativeVotes${index}-${proposalItem.stake_asset_token}`}
                                                                nrOfLevels={20}
                                                                colors={["red", "green"]}
                                                                arcWidth={0.3}
                                                                cornerRadius={8}
                                                                percent={proposalItem.down_vote / 100}
                                                                textColor={"#fff"}
                                                                needleBaseColor={"red"}
                                                                formatTextValue={(value) => proposalItem.down_vote}
                                                            />
                                                        </div>

                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-1 items-center justify-center my-2 gap-2 w-full">
                                           <span className="px-2 py-1 flex w-full items-center text-xs rounded-md font-semibold text-yellow-500 bg-yellow-100">
                                                Created At : {unixTimeToDateTime(proposalItem.created_at)}
                                            </span>
                                                        <span className="px-2 py-1 flex w-full items-center text-xs rounded-md font-semibold text-yellow-500 bg-yellow-100">
                                                Last Vote : {unixTimeToDateTime(proposalItem.last_vote)}
                                            </span>
                                                        <span   className="px-2 py-1 flex w-full items-center text-xs rounded-md font-semibold text-pink-960 bg-green-100">
                                                Total Deposit : {ethers.utils.formatEther(proposalItem.total_deposit)} {getNativeCurrencyByChainId(chainId)}
                                            </span>
                                                        <span className="px-2 py-1 flex w-full items-center text-xs rounded-md font-semibold text-pink-960 bg-green-100">
                                                Current Vote Fee : {ethers.utils.formatEther(proposalItem.vote_fee)} {getNativeCurrencyByChainId(chainId)}
                                            </span>

                                                    </div>

                                                    <div className={"grid grid-cols-3 gap-3"}>
                                                        <button onClick={() => { handleVote(proposalItem, true) }} className={"rounded-lg py-2 hover:border-green-300 border border-green-500 text-pink-960 bg-green-100 flex flex-col items-center justify-center"}>
                                                        <span translate={"no"} className="material-symbols-outlined">thumb_up</span>
                                                            Unlock Pool
                                                        </button>
                                                        <button onClick={() => {
                                                            handleVote(proposalItem, false)
                                                        }} className={"rounded-lg py-2 hover:border-red-300 border border-red-500 text-red-500 bg-red-100 flex flex-col items-center justify-center"}>
                                                          <span translate={"no"} className="material-symbols-outlined">
                                                            thumb_down
                                                          </span>
                                                            Lock Pool
                                                        </button>
                                                        <NavLink to={{pathname: `/dao/${proposalItem.index}`}}
                                                                 className={"rounded-lg py-2 hover:border-blue-300 border border-blue-500 text-blue-500 bg-blue-100 flex flex-col items-center justify-center"}>
                                                    <span translate={"no"} className="material-symbols-outlined">
                                                    arrows_more_up
                                                    </span>
                                                            See More
                                                        </NavLink>
                                                    </div>


                                                </div>

                                            })
                                        }
                                    </div>
                                </> :
                                <>
                                    <div
                                        className={"sm:w-full min-h-[600px] sm:min-h-[420px] w-1/2 mx-auto flex flex-col items-center justify-center"}>
                                        <AnimationHeader repeat={true} width={"100%"} height={"100%"}
                                                         className={"w-full"} dataSource={NO_PROPOSAL_FOUND_LOTTIE}/>
                                        <span className={"sm:text-lg text-3xl"}>Active staking proposals will appear here.</span>
                                    </div>


                                </>
                        }


                    </div>
                </div>
            </div>
        </>
    )
}


export default DAOPage;
