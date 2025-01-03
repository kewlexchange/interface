import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "@/hooks/useModals";
import { NavLink } from "react-router-dom";
import IPage from "../../../interfaces/page";
import { Button, Input } from "@nextui-org/react";
import { useNFTDistributorContract, useNFTLaunchpadContract } from "../../../hooks/useContract";
import { formatEther, parseEther } from "@ethersproject/units";
import {Image} from "@nextui-org/react";
import { ChainId } from "../../../constants/chains";
import HOOP_WHITELIST from "../../../contracts/whitelist/hoop.json"
import Identicon from "../../../Components/Identicon";
import { title } from "../../../Components/Primitives";
 

const NFTDistributor: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [statusText, setStatusText] = useState("Waiting for confirmation...")
    const [amount,setAmount] = useState(0);
    const [totalRaised, setTotalRaised] : any = useState(parseEther("0"))
    const [totalSupply,setTotalSupply] : any = useState("0")
    const [pricePerMint,setPricePerMint] : any = useState(parseEther("0"))
    const NFTLaunchpadPage = useNFTDistributorContract();
    const [isLoaded,setIsLoaded] = useState(false)
    const [userProofs,setUserProofs] : any = useState(null)


    const [contractAddress,setContractAddress] = useState("0x73aE08c2Ed3e8eFb5a8B0766cB47B57C8d49679a")
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);


    const loadData = async () => {
        const myProofs = HOOP_WHITELIST.claims[account];
        setUserProofs(myProofs)
        if(chainId === ChainId.ARBITRUM_ONE){
            const GEMNFT = NFTLaunchpadPage(contractAddress,true);
            const _pricePerMint = await GEMNFT.getClaimFee();
            setPricePerMint(_pricePerMint);
            setIsLoaded(true)
   
        }

    }

    useEffect(()=>{
        if(chainId){
            loadData()
        }
    },[chainId,account])

    const handleMint = async () => {
        if(chainId !== ChainId.ARBITRUM_ONE){
            setTransaction({ hash: '', summary: '', error:{message:"Please switch to Arbitrum Network!"} });
            toggleError();
            return
        }
        if(!account){
            setTransaction({ hash: '', summary: '', error:{message:"Please connect with Metamask!"} });
            toggleError();
            return
        }

        if(!userProofs){
            setTransaction({ hash: '', summary: '', error:{message:"This address doesnt in whitelist!"} });
            toggleError();
            return
        }
   
        toggleLoading();
 
        const GEMNFT = NFTLaunchpadPage(contractAddress,true);
        const depositOverrides = {
            value : pricePerMint
          }

        await GEMNFT.distribute(account,userProofs.index,userProofs.amount,userProofs.proof,depositOverrides).then(async (tx)=>{
            await tx.wait();
            const summary = `Minting IMON Collection: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async ()=>{
            loadData();
            toggleLoading();
        });
    }

    return (

        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={statusText} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />

    

            <div className={"w-full mx-auto flex items-center justify-center flex-col"}>
                <div className="w-full flex  flex-col items-center justify-center">
                    <Image radius="none" removeWrapper   src={"/images/nftlaunchpad/hoop/cover.png"}/>
                </div>
                <div className={"w-full flex sm:text-center items-center justify-center flex-col gap-3 py-10"}>
                    <h1 className="text-3xl">HOOPOE MEMBERSHIP DISTRIBUTION</h1>
                    <h2 className={"text-lg text-center"}>
                    The distribution of HOOPOE membership NFTs will take place on the KEWL Platform, where users with whitelist privileges will be able to automatically claim their NFTs. The distribution will occur on the Arbitrum blockchain, ensuring a secure and efficient process. HOOPOE's NFT distribution on the KEWL Platform promises a unique digital asset experience for participants, contributing to the overall success of the project ecosystem.
                    </h2>
                </div>

                <div className="w-full flex flex-col items-center justify-center">
                    <Image width={300} height={300} src={"/images/nftlaunchpad/hoop/avatar.webp"}/>
                </div>
              

                <div className={" sm:w-[80%] w-full flex flex-col items-center justify-center gap-5 my-5"}>
        
                    <div className="w-full gap-2 flex flex-col items-center justify-center">
                        <Input readOnly onChange={(e)=>{
                            setContractAddress(e.target.value)
                        }} size={"lg"} type="text" label="Contract Address" value={contractAddress} placeholder="Enter your contract address" />


                        <div className={"w-full p-2 flex flex-col gap-2"}>
                            <h1 className={title({size:"lg",color:"pink"})}>Account</h1>
                            <div className="w-full border rounded-lg  border-default   p-2 flex flex-row gap-2 items-center justify-start">
                                <Identicon account={account} size={24}/>
                                <span>{account}</span>
                            </div>
                            <div className="w-full flex flex-col gap-2 items-start justify-start">
                                <h1 className={title({size:"lg",color:"pink"})}>Proofs</h1>
                                {
                                    userProofs && userProofs.proof.map((item,index)=>{
                                        return(
                                            <div key={`dist${index}`} className="w-full border  border-default  p-2 rounded-lg">
                                            <span className="text-sm">{item}</span>
                                        </div>
                                        )
                                    })
                                }
                               
                            </div>
                        </div>
                        
            
                        {
                            chainId !== ChainId.ARBITRUM_ONE ? <div className="p-2 w-full">
                                <div className="w-full bg-red-500 text-white rounded-lg text-lg p-2 text-center">
                                    <span className="text-white">
                                        Please switch to Arbitrum Blockchain
                                    </span>
                                </div>
                            </div> : userProofs ? <>
                                <Button onPress={()=>{
                                handleMint();
                            }} color="default" variant="solid">
                                Claim Your Membership NFT
                            </Button>
                            </> : <div className="p-2 w-full">
                                <div className="w-full bg-red-500 text-white rounded-lg text-lg p-2 text-center">
                                    <span className="text-white">
                                        Your account is not in whitelist!
                                    </span>
                                </div>
                            </div>
                        }
                    
                    </div>

               
            
                </div>
     
         </div>

       
        </>
    )
}


export default NFTDistributor;

