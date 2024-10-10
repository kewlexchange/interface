import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tabs, Tab, Card, CardBody, Button, Image } from "@nextui-org/react";
import Identicon from "../../Components/Identicon";
import { Route, Routes, useLocation } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { usePEPPERContract } from "../../hooks/useContract";
import { formatEther } from "@ethersproject/units";
import useModal, { ModalError, ModalLoading, ModalSuccessTransaction } from "../../hooks/useModals";
import { BigNumber } from "ethers";


const PepperPage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()
    const PEPPER = usePEPPERContract(chainId, true)
    const [isLoading, setLoaded] = useState(false)
    const [rewardAmount, setRewardAmount] = useState("0")
    const [rewardAmount2, setRewardAmount2] = useState("0")
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [claimStatus,setClaimStatus] = useState(false)
    const[cap,setCap] = useState("0")

    const[claimStartBlock,setClaimStartBlock] = useState("0")

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props]);


    const loadPepper = async () => {
        setLoaded(true)
        if (account) {
            let claimEnabled = await PEPPER.getClaimStatus();
            console.log("claimStatus", claimEnabled)

            console.log("account", account)


            const [rewardStakingPoolAmount, rewardStakingAmount] = await PEPPER.calculateRewards(account);
            setRewardAmount(formatEther(rewardStakingPoolAmount))

            const [rewardStakingPoolAmount2, rewardStakingAmount2] = await PEPPER.calculateRewards2(account);
            setRewardAmount2(formatEther(rewardStakingPoolAmount2))

            const _cap = await PEPPER.cap();
            setCap(formatEther(_cap))
            


            const _claimStartBlock = await PEPPER.claimStartBlock();
            console.log("_claimStartBlock",_claimStartBlock)
            setClaimStartBlock(BigNumber.from(_claimStartBlock).toString())
            

            setClaimStatus(claimEnabled)


        }
        setLoaded(false)
    }

    const handleClaim = async () => {
        toggleLoading();
        await PEPPER.claim().then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${PEPPER.address}`
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

    const handleClaim2 = async () => {
        toggleLoading();
        await PEPPER.claim2().then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${PEPPER.address}`
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

    useEffect(() => {
        loadPepper()
    },
        [
            account, chainId
        ])


    return (

        <>
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />

            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />

            <div className={"w-full px-2 py-5 swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>

                    <Card className={" flex gap-2 flex-col rounded-xl p-2 w-full"}>

                        <div className="w-full max-w-full">

                            <Tabs color={"default"} aria-label="Stake Tabs">
                                <Tab key="trade" title="PEPPER">

                                    <div className="w-fulll flex flex-col gap-4">
                                        <div className="w-full flex items-center justify-center">
                                            <Card isPressable onPress={()=>{
                                                loadPepper()
                                            }}>
                                                <CardBody>
                                                <Image src="/images/pepper.webp" />
                                                </CardBody>
                                            </Card>
                                      
                                        </div>

                                        <div className="flex flex-row justify-between">
                                            <span>Claim Status</span>
                                            <span>{claimStatus ? "LIVE" : "PENDING"}</span>

                                        </div>

                                        <div className="flex flex-row justify-between">
                                            <span>CAP</span>
                                            <span>{cap} PEPPER</span>

                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <span>Claim Start Block</span>
                                            <span>{claimStartBlock}</span>

                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <span>Reward Amount</span>
                                            <span>{rewardAmount} PEPPER</span>
                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <span>Reward Amount</span>
                                            <span>{rewardAmount2} PEPPER</span>

                                        </div>
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-2 py-4">
                                        <Button isDisabled={!claimStatus} onClick={() => {
                                            handleClaim()
                                        }} fullWidth size="lg">Harvest PEPPER 1</Button>

                                        <Button isDisabled={!claimStatus}  onClick={() => {
                                            handleClaim2()
                                        }} fullWidth size="lg">Harvest PEPPER 2</Button>
                                    </div>
                                </Tab>

                            </Tabs>

                        </div>
                    </Card>

                </div>
            </div>

        </>
    )
}


export default PepperPage;
