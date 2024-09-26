import IPage from "@/interfaces/page";
import React, { createRef, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";

import { Button, Card,CardBody,CardFooter,CardHeader,Image, Tab, Tabs } from "@nextui-org/react";
import { NavLink } from "react-router-dom";
import { title } from "../../Components/Primitives";
import { useMetamorphContract } from "../../hooks/useContract";
import useModal from "../../hooks/useModals";
import { ethers } from "ethers";
import { MORPH_TAB } from "../../Components/MetamorphTabs/MorphTab";
import { BURN_TAB } from "../../Components/MetamorphTabs/BurnTab";


const MetamorphPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const Metamorph = useMetamorphContract(chainId, true)
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isErrorShowing, toggle: toggleError } = useModal()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    
    const handleTokenToNFT = async () => {
        toggleLoading();

        let depositAmount = ethers.utils.parseUnits("5","ether")
        let overrides = {
            value:depositAmount
        }


        const [tokenAmount,refundAmount] = await Metamorph.calculateNFTAmount(depositAmount,18);

        console.log("tokenAmount",tokenAmount);
      

        await Metamorph.morph(account,ethers.constants.AddressZero,depositAmount,overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${Metamorph.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        }); 
    }

  

    

    return (

        <>

            <div className={" sm:w-full max-w-xl min-w-xl h-full rounded-lg mx-auto my-5 p-4"}>
                <div className=" grid  grid-cols-1  gap-8 rounded-lg">

                <Card className={" flex gap-2 flex-col p-2 w-full"}>
                    <Tabs color={"default"} aria-label="Swap Tabs">
                                <Tab key="swap" title="Morph Token to NFT">
                                    <MORPH_TAB/>
                             
                                </Tab>
                                <Tab key="pools" title="Demorph NFT to Token">
                                    <BURN_TAB/>
                                </Tab>
                            </Tabs>
                    </Card>

                </div>
            </div>
        </>
    )
}


export default MetamorphPage;
