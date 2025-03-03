import React, { useEffect, useState } from "react";
import { BLOCKCHAINS, ChainId } from "../../constants/chains";
import { addBlockchain, changeActiveNetwork } from "../../utils/web3Provider";
import useModal, { ModalError, ModalLoading, ModalNoProvider } from "../../hooks/useModals";
import { BigNumber } from "@ethersproject/bignumber";
import { useWeb3React } from '@web3-react/core'
import { switchChain } from "../../utils/switchChain";
import { Button, Card } from "@nextui-org/react";

export const DropdownNetwork = (props: { className?: string, testMode?: boolean }) => {
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isLoading, toggle: toggleIsLoading } = useModal()
    const { connector, provider, account, chainId } = useWeb3React()
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })




    useEffect(() => {

    }, [chainId])

    const handleChangeActiveNetwork = async (chainId:any) => {
        if (chainId) {
            toggleIsLoading();
            try {
                await switchChain(connector, chainId);
            } catch (error) {
                setTransaction({ hash: '', summary: '', error: error });
                toggleError();
            } finally {
                toggleIsLoading();
            }
        } else {
            toggleNoProvider()
        }
    }


    function Networks() {
        return (
            <>
                <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
                <ModalError
                    isShowing={isErrorShowing}
                    hide={toggleError}
                    error={transaction.error}
                />
                <ModalLoading isClosable={true} isShowing={isLoading} hide={toggleIsLoading} text={"Switching Network..."} />
                <div className={"w-full"}>

                    <div className="grid grid-cols-2 gap-3 p-2">


                    <Card shadow="none"  isPressable className={chainId == ChainId.SONIC_MAINNET ? "bg-danger text-white" : ""}
                            onPress={() => {
                                handleChangeActiveNetwork(ChainId.SONIC_MAINNET);
                            }}>
                            <div className="flex flex-row gap-2 p-2">
                                <img className={"w-10 h-10 p-2"} src="/images/coins/sonic.svg" alt="SONIC" />
                                <div className="flex w-full flex-col items-start justify-start">
                                    <span>SONIC</span>
                                    <small>SONIC Main Network</small>
                                </div>
                            </div>
                        </Card>

                    <Card shadow="none"  isPressable className={chainId == ChainId.AVALANCHE ? "bg-danger text-white" : ""}
                            onPress={() => {
                                handleChangeActiveNetwork(ChainId.AVALANCHE);
                            }}>
                            <div className="flex flex-row gap-2 p-2">
                                <img className={"w-10 h-10 p-2"} src="/images/coins/avax.svg" alt="AVAX" />
                                <div className="flex w-full flex-col items-start justify-start">
                                    <span>AVALANCHE</span>
                                    <small>C Chain Main Network</small>
                                </div>
                            </div>
                        </Card>

                        <Card shadow="none"  isPressable className={chainId == ChainId.CHILIZ_MAINNET ? "bg-danger text-white" : ""}

                            onPress={() => {
                                handleChangeActiveNetwork(ChainId.CHILIZ_MAINNET);
                            }}>
                            <div className="flex flex-row gap-2 p-2">
                                <img className={"w-10 h-10 p-2"} src="/images/coins/chz.svg" alt="CHILIZ" />

                                <div className="flex w-full flex-col items-start justify-start">
                                    <span>CHILIZ</span>
                                    <small>MAIN NETWORK</small>
                                </div>
                            </div>
                        </Card>


                        <Card shadow="none"  isPressable className={chainId == ChainId.ARBITRUM_ONE ? "bg-danger text-white" : ""}
                            onPress={() => {
                                handleChangeActiveNetwork(ChainId.ARBITRUM_ONE);
                            }}>
                            <div className="flex flex-row gap-2 p-2">
                                <img className={"w-10 h-10 p-2"} src="/images/coins/arb.svg" alt="ARBITRUM_ONE" />
                                <div className="flex w-full flex-col items-start justify-start">
                                    <span>ARBITRUM</span>
                                    <small>ARBITRUM ONE</small>
                                </div>
                            </div>
                        </Card>



{/* 

                        <Card shadow="none"  isPressable className={chainId == ChainId.BITCI ? "bg-danger" : ""}

                            onPress={() => {
                                handleChangeActiveNetwork(ChainId.BITCI);
                            }}>
                            <div className="flex flex-row gap-2 p-2">
                                <img className={"w-10 h-10 p-2"} src="/images/coins/bitci.svg" alt="CHILIZ" />
                                <div className="flex w-full flex-col items-start justify-start">
                                    <span>BITCI</span>
                                    <small>BITCI MAINNET</small>
                                </div>
                            </div>

                        </Card>
                        <Card shadow="none" isPressable className={chainId == ChainId.BITCI_TEST ? "bg-danger" : ""}

                            onPress={() => {
                                handleChangeActiveNetwork(ChainId.BITCI_TEST);
                            }}>
                            <div className="flex flex-row gap-2 p-2">
                                <img className={"w-10 h-10 p-2"} src="/images/coins/bitci.svg" alt="CHILIZ" />
                                <div className="flex w-full flex-col items-start justify-start">
                                    <span>BITCI</span>
                                    <small>BITCI TESTNET</small>
                                </div>
                            </div>

                        </Card> */}



                    </div>
                </div>

            </>
        )
    }

    return (
        <>
            <Networks />
        </>
    )
}
