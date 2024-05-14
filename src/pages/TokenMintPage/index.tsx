import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import {AnimationHeader} from "../../Components/AnimationHeader";
import Identicon from "../../Components/Identicon";
import {ethers} from "ethers";
import GEMBOXES_WHITELIST from "../../assets/data/GEMBOXESNFT_WHITELIST_PACKED.json"
import {useDiamondContract, useIMON404Contract, useMoleContract} from "../../hooks/useContract";
import {useWeb3React} from "@web3-react/core";
import {BigNumber} from "@ethersproject/bignumber";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {SocialLinks} from "../../Components/SocialLinks";
import {Unicon} from "../../Components/Unicon";
import {ChainId, DEFAULT_CHAIN_ASSETS_URL} from "../../constants/chains";
import {formatEther, parseEther} from "ethers/lib/utils";
import {getNativeCurrencyByChainId} from "../../utils";
import { title } from "../../Components/Primitives";
import { CONTRACT_ADRESSES } from "../../contracts/addresses";
const TokenMintPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
   
    const IMON404TokenContract = useIMON404Contract();

   
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()

    const handleMint = async () => {
        if(!account){return;}
        if(!chainId) {return;}
        if(![ChainId.CHILIZ_SPICY_TESTNET].includes(chainId)){
            let error = {message:"Please switch to Chiliz Spicy Test Network!"}
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
            return;
        }

        let contractAddress = ""
        if(chainId == ChainId.CHILIZ_MAINNET){
            contractAddress = CONTRACT_ADRESSES.CHZ.MAIN.IMON404
        }else if(chainId == ChainId.CHILIZ_SPICY_TESTNET){
            contractAddress = CONTRACT_ADRESSES.CHZ.TEST.IMON404
        }

        const amount = parseEther("10")
        toggleLoading();
        const GEMNFT = IMON404TokenContract(contractAddress,true);
        await GEMNFT.mint(amount).then(async (tx)=>{
            await tx.wait();
            const summary = `Minting IMON404 Collection: ${tx.hash}`
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
                        <span className={title({size:"lg",color:"blue"})}>Revolutionize Tokenization</span>
                        <span className={"w-full text-center font-bold text-pink-800"}>
                       Minting INTELLIGENT MONSTERS ERC404 with Experimental ERC-20 / ERC-721 Fusion
                        </span>
                    </div>
                </div>
                <div className={"w-3/4 sm:w-full flex flex-col items-center gap-4 justify-center mx-auto rounded-2xl p-5"}>
                   
                    <div className="w-full">
                    <AnimationHeader repeat={true} width={"350px"} height={"350px"} className={"w-full"} dataSource={"/images/animation/erc404.json"}/>

                    </div>
                    <div className={"w-full p-5 rounded-lg"}>
                        <p>
                        ERC-404 is an experimental, mixed ERC-20 / ERC-721 implementation with native liquidity and fractionalization. While these two standards are not designed to be mixed, this implementation strives to do so in as robust a manner as possible while minimizing tradeoffs.

In its current implementation, ERC-404 effectively isolates ERC-20 / ERC-721 standard logic or introduces pathing where possible.

Pathing could best be described as a lossy encoding scheme in which token amount data and ids occupy shared space under the assumption that negligible token transfers occupying id space do not or do not need to occur.

Integrating protocols should ideally confirm these paths by checking that submitted parameters are below the token id range or above.

This iteration of ERC-404 specifically aims to address common use-cases and define better interfaces for standardization, that reduce or remove conflicts with existing ERC-20 / ERC-721 consensus.

This standard is entirely experimental and unaudited, while testing has been conducted in an effort to ensure execution is as accurate as possible.

The nature of overlapping standards, however, does imply that integrating protocols will not fully understand their mixed function.
                        </p>
                    </div>

                    <button onClick={()=>{
                      handleMint()
                    }} className={"btn btn-primary"}>Mint Now</button>
                </div>


            </div>
        </>
    )
}


export default TokenMintPage;
