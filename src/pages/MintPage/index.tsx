import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import {AnimationHeader} from "../../Components/AnimationHeader";
import Identicon from "../../Components/Identicon";
import {ethers} from "ethers";
import GEMBOXES_WHITELIST from "../../assets/data/GEMBOXESNFT_WHITELIST_PACKED.json"
import {useDiamondContract, useMoleContract} from "../../hooks/useContract";
import {useWeb3React} from "@web3-react/core";
import {BigNumber} from "@ethersproject/bignumber";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {SocialLinks} from "../../Components/SocialLinks";
import {Unicon} from "../../Components/Unicon";
import {ChainId, DEFAULT_CHAIN_ASSETS_URL} from "../../constants/chains";
import {formatEther} from "ethers/lib/utils";
import {getNativeCurrencyByChainId} from "../../utils";
const MintPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
   
    const MoleNFTContract = useMoleContract();

   
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()

    const handleMint = async () => {
        if(!account){return;}
        if(!chainId) {return;}
        if(![ChainId.CHILIZ_MAINNET,ChainId.CHILIZ_SPICY_TESTNET].includes(chainId)){
            let error = {message:"Unsupported Chain!"}
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
            return;
        }

        let contractAddress = ""
        if(chainId == ChainId.CHILIZ_MAINNET){
            contractAddress = "0x93bf3D67364e59d005e90b2358216dB107103a58"
        }else if(chainId == ChainId.CHILIZ_SPICY_TESTNET){
            contractAddress = "0x80E578e9a1Ca395B30A3C30C10D9d2f69c9cb28a"
        }

        toggleLoading();
        const GEMNFT = MoleNFTContract(contractAddress,true);
        await GEMNFT.mintNFT().then(async (tx)=>{
            await tx.wait();
            const summary = `Minting IMON Collection: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async ()=>{
            toggleLoading();
        });


    }

    useEffect(()=>{},[chainId,account])

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


            <div className={"container w-full h-full mx-auto py-5"}>
                <div className={"w-full"}>
                   
                    <div className={" flex flex-col items-center justify-center"}>
                        <span className={"w-full text-center text-7xl sm:text-3xl font-bold text-black"}>IMON MOLE COLLECTION</span>
                        <span className={"w-full text-center font-bold text-pink-800"}>
                                Unlock treasure box and claim a free NFT
                        </span>
                    </div>
                </div>
                <div className={"w-3/4 sm:w-full flex flex-col items-center gap-4 justify-center mx-auto rounded-2xl p-5"}>
                   
                    <div className="w-full">
                    <AnimationHeader repeat={true} width={"350px"} height={"350px"} className={"w-full"} dataSource={"/images/animation/chest.json"}/>

                    </div>
                    <div className={"w-full p-5 rounded-lg"}>
                        <p>
                        Featuring 36 unique miner moles, a vibrant reflection of the mining world. Each NFT stands out with its exclusive designs and blockchain assurance. Explore the enchanting dance of the mining realm in your collection!
                        </p>
                    </div>

                    <button onPress={()=>{
                      handleMint()
                    }} className={"btn btn-primary"}>Airdrop is Expired</button>
                </div>


            </div>
        </>
    )
}


export default MintPage;
