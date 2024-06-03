import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { ethers } from "ethers";
import useFilePreview from "../../hooks/useFilePreview";
import { useWeb3React } from "@web3-react/core";

import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "../../hooks/useModals";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { useDiamondContract } from "../../hooks/useContract";
import SudokuImg from '../../assets/images/arbiscan.svg'
import { NavLink, useLocation } from "react-router-dom";
import { IDOItem } from "../../Components/IDOItem";
import { Button, Card, CardBody, CardFooter, CardFooter, Image } from "@nextui-org/react";
import { CHZINUIDO } from "../../Components/IDOItem/chzinu";
import { CHZINUIDOSEC } from "../../Components/IDOItem/chzinusec";
import { TBTIDO } from "../../Components/IDOItem/tbt/round1";
import { CHILIZPEPEFIRSTIDO } from "../../Components/IDOItem/chilizpepefirst";
import { CHILIZPEPESECONDIDO } from "../../Components/IDOItem/chilizpepesecond";
import { ANGRYHOOPIDO } from "../../Components/IDOItem/angryhoop";
import { TBTTokenIDO } from "../../Components/IDOItem/tbttoken";
import { ChilizShibaIDO } from "../../Components/IDOItem/chilizshiba";
import { MRLTokenIDO } from "../../Components/IDOItem/mrl";

const LaunchpadPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [statusText, setStatusText] = useState("Waiting for confirmation...")
    const location = useLocation();




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
            <ModalLoading text={statusText} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />




            <div className={"w-full px-2 py-5"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <Card fullWidth>
                        <CardBody>
                            {
                                location.pathname === "/launchpad/imon" && <IDOItem name={"Contribute IMON"} />
                            }
                            {
                                location.pathname === "/launchpad/chzinufirst" && <CHZINUIDO name={"CHZINU IDO - ROUND1"} />
                            }
                            {
                                location.pathname === "/launchpad/chzinu" &&
                                <CHZINUIDOSEC name={"CHZINU IDO - ROUND 2"} />

                            }
                            {
                                location.pathname === "/launchpad/tbt" &&
                                <TBTTokenIDO name={"TBT IDO"} />

                            }
                            {
                                location.pathname === "/launchpad/chzpepefirst" &&
                                <CHILIZPEPEFIRSTIDO name={"CHZPEPE IDO I"} />

                            }
                            {
                                location.pathname === "/launchpad/chzpepesecond" &&
                                <CHILIZPEPESECONDIDO name={"CHZPEPE IDO II"} />
                            }
                            {
                                location.pathname === "/launchpad/angry" &&
                                <ANGRYHOOPIDO name={"ANGRY HOOP"} />
                            }
                            {
                                location.pathname === "/launchpad/chilizshiba" &&
                                <ChilizShibaIDO name={"Chiliz SHIBA"} />
                            }
                             {
                                location.pathname === "/launchpad/mrl" &&
                                <MRLTokenIDO name={"MarloVerse"} />
                            }
                            {
                                location.pathname === "/launchpad/tbt" &&
                                <TBTTokenIDO name={"TBT IDO"} />
                            }
                            {
                                (location.pathname === "/launchpad" || location.pathname === "/launchpad/") &&  <MRLTokenIDO name={"MarloVerse"} />

                            }
                        </CardBody>
                        <CardFooter>
                            <Button as={NavLink} to='/tos' variant="light" size='sm'>Terms of Service</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

        </>
    )
}


export default LaunchpadPage;

