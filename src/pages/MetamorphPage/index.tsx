import IPage from "@/interfaces/page";
import React, { createRef, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";

import { Button, Card, CardBody, CardFooter, CardHeader, Image, Tab, Tabs } from "@nextui-org/react";
import { NavLink } from "react-router-dom";
import { title } from "../../Components/Primitives";
import { useMetamorphContract } from "../../hooks/useContract";
import useModal from "../../hooks/useModals";
import { ethers } from "ethers";
import { MORPH_TAB } from "../../Components/MetamorphTabs/MorphTab";
import { BURN_TAB } from "../../Components/MetamorphTabs/BurnTab";
import { Settings } from "lucide-react";


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

        let depositAmount = ethers.utils.parseUnits("5", "ether")
        let overrides = {
            value: depositAmount
        }


        const [tokenAmount, refundAmount] = await Metamorph.calculateNFTAmount(depositAmount, 18);

        console.log("tokenAmount", tokenAmount);


        await Metamorph.morph(account, ethers.constants.AddressZero, depositAmount, overrides).then(async (tx) => {
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

      <Card fullWidth shadow="none" className='bg-transparent flex gap-2 flex-col w-full'>
                        <CardBody>
                        <Tabs
                            disableAnimation
                            radius="lg"
                            fullWidth
                            classNames={{
                                base: "w-full",
                                tabList: [
                                    "relative",
                                    "bg-white/[0.01] dark:bg-black/[0.01]",
                                    "backdrop-blur-xl",
                                    "border border-violet-500/10",
                                    "p-1",
                                    "rounded-2xl",
                                    "flex",
                                    "gap-1"
                                ].join(" "),
                                cursor: "hidden",
                                tab: [
                                    "flex-1",
                                    "h-9",
                                    "px-4",
                                    "rounded-xl",
                                    "flex items-center justify-center",
                                    "gap-2",
                                    "text-xs font-medium",
                                    "text-violet-600/50 dark:text-violet-400/50",
                                    "group",
                                    "relative",
                                    "overflow-hidden",
                                    "transition-all duration-200",
                                    "data-[selected=true]:bg-violet-500/[0.02] dark:data-[selected=true]:bg-violet-400/[0.02]",
                                    "data-[selected=true]:backdrop-blur-xl",
                                    "data-[selected=true]:text-violet-500 dark:data-[selected=true]:text-violet-400",
                                    "before:absolute",
                                    "before:inset-0",
                                    "before:rounded-xl",
                                    "before:opacity-0",
                                    "before:pointer-events-none",
                                    "before:z-[-1]",
                                    "data-[selected=true]:before:opacity-100",
                                    "before:bg-gradient-to-r",
                                    "before:from-violet-500/0",
                                    "before:via-violet-500/[0.07]",
                                    "before:to-violet-500/0",
                                    "before:transition-opacity",
                                    "data-[selected=true]:before:animate-shimmer",
                                    "before:bg-[length:200%_100%]",
                                    "hover:bg-violet-500/[0.01] dark:hover:bg-violet-400/[0.01]",
                                    "hover:text-violet-500/70"
                                ].join(" "),
                                tabContent: "relative z-10",
                                panel: "pt-4"
                            }}
                            aria-label="Swap Tabs"
                        >

                            <Tab
                                key="pools"
                                title={
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg">
                                            <span translate="no" className="material-symbols-outlined text-[18px]">waves</span>
                                        </div>
                                        <span>Morph</span>
                                    </div>
                                }
                            >
                                <MORPH_TAB />
                            </Tab>

                            <Tab
                                key="settings"
                                title={
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg">
                                            <Settings className="w-4 h-4" />
                                        </div>
                                        <span>Demorph</span>
                                    </div>
                                }
                            >
                                <BURN_TAB />
                            </Tab>
                        </Tabs>
                            </CardBody>
                    
                    </Card>

                </div>
            </div>
        </>
    )
}


export default MetamorphPage;
