import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import {generateExplorerURLByChain, getIconByChainId, getNativeCurrencyByChainId} from "../../utils";
import {useWeb3React} from "@web3-react/core";
import {useDiamondContract} from "../../hooks/useContract";
import {ethers} from "ethers";
import {BigNumber} from "@ethersproject/bignumber";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {parseEther} from "ethers/lib/utils";
import Identicon from "../../Components/Identicon";
import {NavLink} from "react-router-dom";
import IconDAO from "../../assets/images/icons/dao.svg";

const CreateProposalPage: React.FunctionComponent<IPage> = props => {
    const {connector, account, provider, chainId} = useWeb3React()
    const {state: isTransactionSuccess, toggle: toggleTransactionSuccess} = useModal();
    const {state: isShowLoading, toggle: toggleLoading} = useModal();
    const {state: isErrorShowing, toggle: toggleError} = useModal()
    const [transaction, setTransaction] = useState({hash: '', summary: '', error: null})
    const {state: isNoProvider, toggle: toggleNoProvider} = useModal()

    const [contractAddress, setContractAddress] = useState("")
    const [tokenInfo, setTokenInfo] = useState(null);
    const [description, setDescription] = useState("")
    const PURGEPACTDIAMOND = useDiamondContract(chainId, true);
    const [proposals, setProposals] = useState([]);


    const fetchTokenInfo = async () => {
        if (!contractAddress) {
            setTokenInfo(null);
            return;
        }
        if (!chainId) {
            return
        }
        if (!PURGEPACTDIAMOND) {
            return
        }
        if (!ethers.utils.isAddress(contractAddress)) {
            setTokenInfo(null);
            return;
        }
        const _tokenInfo = await PURGEPACTDIAMOND.getTokenInfo(contractAddress);
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

    const handleCreateProposal = async () => {
        if (!contractAddress) {
            setTokenInfo(null);
            return;
        }
        if (!chainId) {
            return
        }
        if (!PURGEPACTDIAMOND) {
            return
        }
        if (!ethers.utils.isAddress(contractAddress)) {
            setTokenInfo(null);
            return;
        }

        if (!account) {
            return;
        }
        toggleLoading();
        let proposalOverrides = {value: parseEther("0.005")}
        await PURGEPACTDIAMOND.createProposal(contractAddress, description, proposalOverrides).then(async (tx) => {
            await tx.wait();
            const summary = `Creating Proposal for: ${contractAddress}`
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

    const initDefaults = async () => {
        const _proposals = await PURGEPACTDIAMOND.getProposals();
        setProposals(_proposals)

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
                    <div className={"transparent-bg rounded-xl p-2 w-full"}>

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
                                            <div
                                                className="absolute top-0 left-0 right-0 z-10 h-full shadow rounded-full"></div>
                                        </NavLink>
                                    </div>
                                </nav>
                            </div>
                        </div>

                        <div className="transparent-bg border rounded-xl px-4 pt-2 pb-2 w-full">

                            <div className="border transparent-border-color rounded-xl pb-0 mt-4 mb-4">
                                <div
                                    className="flex items-center justify-between border-b transparent-border-color flex-wrap p-2 py-4">
                                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                                       <span translate={"no"} className="material-symbols-outlined">
                                        playlist_add_circle
                                        </span>Create Proposal
                                    </div>
                                    <div className="whitespace-nowrap"><span
                                        className="text-xs text-gray-400 ">Balance :</span>
                                        <span>{"0.00"} {getNativeCurrencyByChainId(chainId)} </span>
                                    </div>
                                </div>
                                <div className="flex sm:flex-col items-center justify-center px-2 pr-0">
                                    <div
                                        className="min-w-[150px] sm:w-full flex items-center gap-x-2  pr-8 py-4 select-none cursor-pointer">
                                        <span translate={"no"} className="material-symbols-outlined">
                                            loyalty
                                        </span>{"Contract"}
                                    </div>
                                    <div className="w-full px-2 flex items-center justify-between relative sm:pb-2">
                                        <input onChange={(e) => {
                                            handleChangeInput(e)
                                        }
                                        } type="text" placeholder="Please enter contract address"
                                               className="bg-white rounded-full pl-3 w-full"
                                               defaultValue={contractAddress}/>
                                    </div>

                                </div>
                                <div className="flex sm:flex-col items-center justify-center px-2 pr-0 border-t transparent-border-color">
                                    <div
                                        className="w-[150px] sm:w-full flex items-center gap-x-2  pr-8 py-4 select-none cursor-pointer">
                                        <span translate={"no"} className="material-symbols-outlined">
                                            chat
                                        </span>{"Description"}
                                    </div>
                                    <div className="w-full flex items-center justify-center relative  px-2 sm:pb-2">
                                        <input onChange={(e) => {
                                            handleChangeDescriptionInput(e)
                                        }
                                        } type="text" placeholder="Please enter description"
                                               className="bg-white rounded-full pl-3 w-full bg-transparent outline-none"
                                               defaultValue={description}/>
                                    </div>
                                </div>

                            </div>
                            <div className="border transparent-border-color rounded-xl pb-0 mt-4 mb-4">
                                <div
                                    className="flex items-center justify-between border-b transparent-border-color flex-wrap p-2 py-4">
                                    <div className="flex items-center gap-x-2 whitespace-nowrap">
                                        <span translate={"no"} className="material-symbols-outlined">
                                            psychology_alt
                                        </span>
                                        Token Information
                                    </div>
                                </div>
                                <div className={"grid grid-cols-2 sm:grid-cols-1"}>
                                    <div>
                                        <div className="flex items-center justify-start px-2 pr-0  ">
                                            <div
                                                className="w-[150px] flex items-center gap-x-2 pr-8 py-4 select-none cursor-pointer">

                                                <span translate={"no"} className="material-symbols-outlined">
                                                    badge
                                                </span>
                                                {"Name"}
                                            </div>
                                            <div className="w-full flex items-center justify-between relative p-3">
                                                {tokenInfo && tokenInfo.name}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-start px-2 pr-0  ">
                                            <div
                                                className="w-[150px] flex items-center gap-x-2  pr-8 py-4 select-none cursor-pointer">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    add_photo_alternate
                                                </span>
                                                {"Symbol"}
                                            </div>
                                            <div className="w-full flex items-center justify-between relative p-3">
                                                {tokenInfo && tokenInfo.symbol}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-start px-2 pr-0">
                                            <div
                                                className="w-[150px] flex items-center gap-x-2  pr-8 py-4 select-none cursor-pointer">
                                                   <span translate={"no"} className="material-symbols-outlined">
                                                    repeat_one
                                                </span>{"Decimals"}
                                            </div>
                                            <div className="w-full flex items-center justify-between relative p-3">
                                                {tokenInfo && BigNumber.from(tokenInfo.decimals).toNumber()}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-start px-2 pr-0 -white/30 ">
                                            <div
                                                className="w-[150px] flex items-center gap-x-2 pr-8 py-4 select-none cursor-pointer">
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    group_work
                                                </span>{"Supply"}
                                            </div>
                                            <div className="w-full flex items-center justify-between relative p-3">
                                                {tokenInfo && ethers.utils.formatUnits(tokenInfo.totalSupply, tokenInfo.decimals)}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div
                                    className="flex items-end items-center justify-end border-t transparent-border-color flex-wrap p-2 py-4">
                                    <div className="whitespace-nowrap"><span
                                        className="text-xs text-gray-400 ">Fee :</span>
                                        <span>{"0000"} {getNativeCurrencyByChainId(chainId)} </span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex flex-col items-center justify-center">
                                <button onClick={() => {
                                    handleCreateProposal();
                                }} className=" my-2 btn btn-primary w-full hidden">Create Proposal
                                </button>

                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </>
    )
}


export default CreateProposalPage;
