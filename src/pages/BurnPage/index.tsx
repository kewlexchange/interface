import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {useDiamondContract, useIMONTokenContract, useNFTContract} from "../../hooks/useContract";
import GEMBOXES_WHITELIST from "../../assets/data/GEMBOXESNFT_WHITELIST_PACKED.json";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {BigNumber} from "@ethersproject/bignumber";
import {ethers} from "ethers";
import {getIconByAsset, getIconByChainId, getNativeCurrencyByChainId} from "../../utils";
import {AnimationHeader} from "../../Components/AnimationHeader";
import Identicon from "../../Components/Identicon";

const BurnPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const GEMBOX_DIAMOND = useDiamondContract(chainId,true);
    const IMON_TOKEN_CONTRACT = useIMONTokenContract(chainId,true);
    const GEMBOXES_NFT_CONTRACT = useNFTContract();
    const [isUnlocked,setUnlocked] = useState(false);
    const [collections,setCollections] = useState([])
    const [activeCollection,setActiveCollection] = useState(null);
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()

    const [userNFTBalance,setUserNFTBalance] = useState(0);
    const [userTokenBalance, setUserTokenBalance] = useState("0")
    const [currentBurnFee,setCurrentBurnFee] = useState("0")
    const [userNativeCurrencyBalance,setUserNativeCurrencyBalance] = useState("0");
    const [burnAmount,setBurnAmount] = useState("0")
    const DEFAULT_COLLECTION_ID = 0;
    const handleBurn = async () => {
        if(!account){return;}
        if(!activeCollection){return;}
        toggleLoading();
        const burnGEMNFTOverrides = {
            value:ethers.utils.parseEther(currentBurnFee)
        }
        const DEFAULT_TOKEN_ID = `${activeCollection.allocPoint * 1e18}`;
        await GEMBOX_DIAMOND.burnGEMNFT(DEFAULT_COLLECTION_ID,DEFAULT_TOKEN_ID,burnAmount,burnGEMNFTOverrides).then(async (tx) => {
            await tx.wait();
            const summary = `Burning NFT's for: ${GEMBOX_DIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async ()=>{
            await initDefaults();
            toggleLoading();
        });
    }

    const handleUnlock = async () => {
        if(!account){return;}
        if(!activeCollection){return;}
        toggleLoading();
        const GEMNFT = GEMBOXES_NFT_CONTRACT(activeCollection.contractAddress,true);
        await GEMNFT.setApprovalForAll(GEMBOX_DIAMOND.address,true).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking NFT's for: ${GEMBOX_DIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async ()=>{
            await initDefaults();
            toggleLoading();
        });
    }

    const fetchBurnFee = async(amount) => {
        amount = amount == "" ? "0" : amount;
        const burnFee = await GEMBOX_DIAMOND.getCurrentBurnFees(DEFAULT_COLLECTION_ID,amount);
        setCurrentBurnFee(ethers.utils.formatEther(burnFee))
    }
    const initDefaults = async () => {
        if(!GEMBOX_DIAMOND){return;}
        const allCollections = await GEMBOX_DIAMOND.getAllCollections();
        setCollections(allCollections)
        setActiveCollection(allCollections[DEFAULT_COLLECTION_ID]);
        const GEMNFT = GEMBOXES_NFT_CONTRACT(allCollections[DEFAULT_COLLECTION_ID].contractAddress,true);


        const DEFAULT_TOKEN_ID = `${allCollections[DEFAULT_COLLECTION_ID].allocPoint * 1e18}`;


        let abiERC = [
            'function getNFTBalance(address addr,address nft,uint256 tokenId)',
            'function balanceOf(address addr)',
            'function decimals()',
            'function getEthBalance(address addr)',
            'function isApprovedForAll(address account, address operator)',
            'function getCurrentBurnFees(uint256 collectionId,uint256 amount)'
        ];
        let abiERCResults = [
            {"type":'uint256',"variable":"nftBalance"},
            {"type":'uint256',"variable":"tokenBalance"},
            {"type":'uint256',"variable":"tokenDecimals"},
            {"type":'uint256',"variable":"etherBalance"},
            {"type":'bool',"variable":"isApprovedForAll"},
            {"type":'uint256',"variable":"burnFees"},
        ];

        let abiInterfaceParam = new ethers.utils.Interface(abiERC)
        let multicallParams = [
            {
                target: GEMBOX_DIAMOND.address,
                callData: abiInterfaceParam.encodeFunctionData("getNFTBalance", [account,GEMNFT.address,DEFAULT_TOKEN_ID])
            },
            {
                target: IMON_TOKEN_CONTRACT.address,
                callData: abiInterfaceParam.encodeFunctionData("balanceOf", [account])
            },
            {
                target: IMON_TOKEN_CONTRACT.address,
                callData: abiInterfaceParam.encodeFunctionData("decimals", [])
            },
            {
                target: GEMBOX_DIAMOND.address,
                callData: abiInterfaceParam.encodeFunctionData("getEthBalance", [account])
            },
            {
                target: GEMNFT.address,
                callData: abiInterfaceParam.encodeFunctionData("isApprovedForAll", [account, GEMBOX_DIAMOND.address])
            },
            {
                target: GEMBOX_DIAMOND.address,
                callData: abiInterfaceParam.encodeFunctionData("getCurrentBurnFees", [DEFAULT_COLLECTION_ID,ethers.utils.parseEther("0")])
            },

        ];
        let multicallResponseObjects = {"nftBalance":0,"tokenBalance":0,"tokenDecimals":0,"etherBalance":0,"isApprovedForAll":false,"burnFees":0};

        try{
            const [blockNum, multicallResult] = await GEMBOX_DIAMOND.callStatic.aggregate(multicallParams)
            for (let i = 0; i < multicallResult.length; i++) {
                const decodeType = `${abiERCResults[i]["type"]} ${abiERCResults[i]["variable"]}`;
                let encodedMulticallData = multicallResult[i];
                const decodedMulticallData = ethers.utils.defaultAbiCoder.decode( [decodeType],encodedMulticallData)
                multicallResponseObjects[abiERCResults[i]["variable"]] = decodedMulticallData[abiERCResults[i]["variable"]];
            }
        }catch (e){

        }

        setUnlocked(multicallResponseObjects.isApprovedForAll);
        setUserNFTBalance(BigNumber.from(multicallResponseObjects.nftBalance).toNumber());
        setUserTokenBalance(ethers.utils.formatUnits(multicallResponseObjects.tokenBalance,multicallResponseObjects.tokenDecimals));
        setUserNativeCurrencyBalance(ethers.utils.formatEther(multicallResponseObjects.etherBalance))
        setCurrentBurnFee(ethers.utils.formatEther(multicallResponseObjects.burnFees))

    }

    const handleChangeInput = (e) => {
        setBurnAmount(e.target.value)
        fetchBurnFee(e.target.value)
    }
    useEffect(() => {
        initDefaults();
    },[chainId,account])

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
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

            <div className={"container mx-auto"}>

                <div className={"w-full lottie-anim"}>
                    <div className={"lottie fog"}>
                        <AnimationHeader repeat={true} width={"400px"} height={"400px"} className={"w-full"} dataSource={"/images/animation/fire.json"}/>
                    </div>
                    <div className={"lottie orb burn"}>
                        <AnimationHeader repeat={true} width={"100px"} height={"100px"} className={"w-full"} dataSource={"/images/animation/gem.json"}/>
                    </div>
                    <div className={"collection flex flex-col items-center justify-center"}>
                        <span className={"w-full text-center text-7xl sm:text-3xl font-bold text-black"}>BURN IMON NFT</span>
                        <span className={"w-full text-center font-bold text-pink-800"}>CLAIM $IMON TOKENS</span>
                    </div>
                    <div className={"w-full"}>
                        <section className=" w-full block h-[500px] z-10">
                            <div className="w-full h-full bg-center bg-[url('/images/covers/burn.png')] bg-cover">
                            </div>
                        </section>
                    </div>
                </div>
                <div className={"w-3/4 sm:w-full flex flex-col items-center gap-4 justify-center mx-auto transparent-bg rounded-2xl p-5"}>
                    <div className="grid grid-cols-1 gap-6 w-full xl:grid-cols-2 2xl:grid-cols-4">
                        <div
                            className="transparent-bg  cursor-pointer rounded-2xl p-4 ">
                            <div className="flex items-center">
                                <div
                                    className="inline-flex flex-shrink-0 justify-center items-center w-12 h-12 text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 rounded-lg shadow-md shadow-gray-300">
                                        <span translate={"no"} className="material-symbols-outlined">
                                            generating_tokens
                                        </span>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <span className="text-2xl font-bold leading-none text-gray-900">
                                        {userNFTBalance}
                                    </span>
                                    <h3 className="text-base uppercase font-normal text-gray-500">YOUR NFT BALANCE</h3>
                                </div>
                            </div>
                        </div>
                        <div
                            className="transparent-bg  cursor-pointer  rounded-2xl p-4 ">
                            <div className="flex items-center">
                                <div
                                    className="inline-flex flex-shrink-0 justify-center items-center w-12 h-12 text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 rounded-lg shadow-md shadow-gray-300">
                                       <span translate={"no"} className="material-symbols-outlined">
                                        autopay
                                        </span>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <span className="text-2xl font-bold leading-none text-gray-900">
                                        {userTokenBalance} $IMON
                                    </span>
                                    <h3 className="text-base uppercase font-normal text-gray-500">YOUR $IMON BALANCE</h3>
                                </div>
                            </div>
                        </div>
                        <div
                            className="transparent-bg  cursor-pointer  rounded-2xl p-4 ">
                            <div className="flex items-center">
                                <div
                                    className="inline-flex flex-shrink-0 justify-center items-center w-12 h-12 text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 rounded-lg shadow-md shadow-gray-300">
                                <span translate={"no"} className="material-symbols-outlined">
                                    playlist_add_check_circle
                                </span>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <span className="text-2xl font-bold leading-none text-gray-900">
                                        {activeCollection && activeCollection.burnedAmount ? BigNumber.from(activeCollection.burnedAmount).toNumber() : "0"} NFT
                                    </span>
                                    <h3 className="text-base font-normal uppercase text-gray-500">TOTAL BURNED AMOUNT</h3>
                                </div>
                            </div>
                        </div>
                        <div
                            className="transparent-bg  cursor-pointer  rounded-2xl p-4 ">
                            <div className="flex items-center">
                                <div
                                    className="inline-flex flex-shrink-0 justify-center items-center w-12 h-12 text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 rounded-lg shadow-md shadow-gray-300">
                                    <span translate={"no"} className="material-symbols-outlined">
                                        nest_secure_alarm
                                    </span>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <span className="text-2xl font-bold leading-none text-gray-900">
                                        {
                                            currentBurnFee
                                        } {getNativeCurrencyByChainId(chainId)}
                                    </span>
                                    <h3 className="text-base uppercase font-normal text-gray-500">CURRENT BURN DIFFICULTY</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl transparent-bg px-4 pb-4 w-full">
                        <div className="border transparent-border-color rounded-xl pb-0 mt-4 mb-4">
                            <div className="flex items-center justify-between border-b transparent-border-color flex-wrap p-2 py-4">
                                <div className="flex items-center gap-x-2 whitespace-nowrap">
                                    <img src={getIconByChainId(chainId)} className="w-5 h-5" alt=""/>Enter Amount</div>
                                <div className="whitespace-nowrap"><span
                                    className="text-xs text-gray-400 ">Balance :</span> <span>{userNativeCurrencyBalance} {getNativeCurrencyByChainId(chainId)} </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-start px-2 pr-0">
                                <div className="flex items-center gap-x-2 border-r transparent-border-color pr-8 py-4 select-none cursor-pointer">
                                    <img src={getIconByChainId(chainId)} className="w-5 h-5" alt=""/>{activeCollection && activeCollection.name}<span
                                        className="material-symbols-outlined">expand_more</span></div>
                                <div className="w-full flex items-center justify-between relative">
                                    <input  onChange={(e) => {
                                        handleChangeInput(e)
                                    }
                                    } type="text" placeholder="Enter Burn Amount"  className="pl-3 w-full bg-transparent outline-none font-incon font-bold text-lg" defaultValue={burnAmount}/>
                                </div>
                            </div>
                            <div className="flex items-end items-center justify-end border-t transparent-border-color flex-wrap p-2 py-4">
                                <div className="whitespace-nowrap"><span
                                    className="text-xs text-gray-400 ">Fee :</span> <span>{currentBurnFee} {getNativeCurrencyByChainId(chainId)} </span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex flex-col items-center justify-center">
                            {
                                isUnlocked && <button onPress={()=>{
                                    handleBurn();
                                }} className=" my-2 btn btn-primary w-full">Burn & Claim</button>
                            }
                            {
                                !isUnlocked && <button onPress={()=>{
                                    handleUnlock();
                                }} className=" my-2 btn btn-primary w-full">Unlock</button>
                            }

                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}


export default BurnPage;
