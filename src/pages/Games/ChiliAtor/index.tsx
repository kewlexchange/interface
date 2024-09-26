import IPage from "@/interfaces/page";
import React, {lazy, Suspense, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import useModal, {
    ModalNoProvider,
    ModalError,
    ModalLoading,
    ModalSuccessTransaction,
    ModalConnect
} from "../../../hooks/useModals";
import {Unity, useUnityContext} from "react-unity-webgl";
import UniwalletModal from "../../../Components/Modal/UniwalletModal";
import {parseEther} from "ethers/lib/utils";
import {useChiliatorGameContract} from "../../../hooks/useContract";
import {Card, CardBody, Tab, Tabs} from "@nextui-org/react";
import {GameTab, UnityGameContainer} from "./Game";
import {PlayersTab} from "./Players";
import {EarningsTab} from "./Earnings";
import {bool} from "prop-types";


const ChiliAtorPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const ChiliatorGameContract = useChiliatorGameContract(chainId, true);
    const {state: isTransactionSuccess, toggle: toggleTransactionSuccess} = useModal();
    const {state: isShowLoading, toggle: toggleLoading} = useModal();
    const [transaction, setTransaction] = useState({hash: '', summary: '', error: null})
    const {state: isNoProvider, toggle: toggleNoProvider} = useModal()
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const { state: isConnect, toggle: toggleConnectModal } = useModal()
    const [sendData,handleSendData] = useState("")

    useEffect(()=>{
        global.window.handleConnectFunc = handleConnect;
        global.window.handleDepositFunc = handleDeposit;
        global.window.handleClaimRewardFunc = handleClaimReward;
        global.window.handleGetPlayersFunc = handleGetPlayers;
        global.window.handleGetGameHashListFunc = handleGetGameHashList;
        global.window.handleGetGameStatsFunc = handleGetGameStats;
    },[chainId,account])
    const initDefaults = async () => {

    }


    const handleGetGameStats =  () => {
        return ""//await ChiliatorGameContract.getStats()
    }

    const handleGetPlayers = async (gameTimestamp) => {
        return await ChiliatorGameContract.getPlayers(gameTimestamp)
    }

    const handleGetGameHashList = async () => {
        return await ChiliatorGameContract.getGameHashList()
    }

    const handleConnect = async () => {
        toggleConnectModal()
    }


    const handleDeposit = async (depositAmount: any) => {
        let betOverrides = {
            value:parseEther(depositAmount)
        }
        toggleLoading();
        await ChiliatorGameContract.placeBet(betOverrides).then(async (tx)=>{
            await tx.wait();
            const summary = `Place Bet: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async ()=>{
            initDefaults();
            toggleLoading();
        });
    }

    const handleClaimReward = async (params:any) => {
        toggleLoading();
        await ChiliatorGameContract.claimReward(params.gameHash,params.address,params.nodeIndex,params.amount,params.merkleProof).then(async (tx)=>{
            await tx.wait();
            const summary = `Claim Reward: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async ()=>{
            initDefaults();
            toggleLoading();
        });
    }

    useEffect(() => {
        document.title = props.title + " - The Trustworthy Blockchain with PonyGames";
    }, []);
    return (
        <div className={"p-2 w-full"}>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading  text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading} isShowing={isShowLoading}/>
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess}/>
            <UniwalletModal />
            <ModalConnect isShowing={isConnect} hide={toggleConnectModal} />


            <Tabs color={"default"}>
                <Tab title="Game">
                    <Card>
                        <CardBody>
                            <UnityGameContainer sendPacked={sendData}/>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab title="Players">
                    <Card>
                        <CardBody>
                            <PlayersTab/>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab title="Earnings">
                    <Card>
                        <CardBody>
                            <EarningsTab/>

                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>

    )
}


export default ChiliAtorPage;
