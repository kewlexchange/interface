import React, { useEffect, useState } from "react";
import { BLOCKCHAINS, ChainId } from "../../constants/chains";
import { addBlockchain, changeActiveNetwork } from "../../utils/web3Provider";
import useModal, { ModalError, ModalLoading, ModalNoProvider } from "../../hooks/useModals";
import { BigNumber } from "@ethersproject/bignumber";
import { useWeb3React } from '@web3-react/core'
import { switchChain } from "../../utils/switchChain";
import { Button } from "@nextui-org/react";

export const Network = (props: { className?: string, testMode?: boolean }) => {
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isLoading, toggle: toggleIsLoading } = useModal()
    const { connector, provider, account, chainId } = useWeb3React()
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})




    useEffect(() => {

    }, [chainId])

    const handleChangeActiveNetwork = async (chainId) => {
        if (chainId) {
            toggleIsLoading();
            try {
                await switchChain(connector, chainId);
            } catch (error) {
                setTransaction({ hash: '', summary: '', error:error });
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
                <div className={"w-full py-5"}>

                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">

                        <div onPress={() => {
                            handleChangeActiveNetwork(ChainId.CHILIZ_MAINNET);
                        }} className={"w-full flex flex-row gap-2 items-center hover:bg-gray/50 rounded-lg p-3 " + (chainId === ChainId.CHILIZ_MAINNET ? "bg-green-500  text-white " : "bg-default")}>
                            <div className="thumb bsc">
                                <img className={"w-10 h-10"} src="/images/coins/chz.svg" alt="CHILIZ" />
                            </div>
                            <div className="flex flex-col items-start justify-start">
                                <span className={"font-bold"}>CHILIZ</span>
                                <small>CHILIZ MAIN NETWORK</small>
                            </div>
                        </div>

                        <div onPress={() => {
                            handleChangeActiveNetwork(ChainId.SONIC_MAINNET);
                        }} className={"w-full flex flex-row gap-2 items-center hover:bg-gray/50 rounded-lg p-3 " + (chainId === ChainId.SONIC_MAINNET ? "bg-green-500  text-white " : "bg-default")}>
                            <div className="thumb bsc">
                                <img className={"w-10 h-10"} src="/images/coins/sonic.svg" alt="SONIC" />
                            </div>
                            <div className="flex flex-col items-start justify-start">
                                <span className={"font-bold"}>SONIC</span>
                                <small>SONIC MAIN NETWORK</small>
                            </div>
                        </div>

                        <div onPress={() => {
                            handleChangeActiveNetwork(ChainId.CHILIZ_SPICY_TESTNET);
                        }} className={"w-full flex flex-row gap-2 items-center hover:bg-gray/50 rounded-lg p-3 " + (chainId === ChainId.CHILIZ_SPICY_TESTNET ? "bg-green-500  text-white " : "bg-default")}>
                            <div className="thumb bsc">
                                <img className={"w-10 h-10"} src="/images/coins/chz.svg" alt="CHILIZ" />
                            </div>
                            <div className="flex flex-col items-start justify-start">
                                <span className={"font-bold"}>CHILIZ TEST</span>
                                <small>CHILIZ SPICY TEST NETWORK</small>
                            </div>
                        </div>

                        <div onPress={() => {
                            handleChangeActiveNetwork(ChainId.ARBITRUM_ONE);
                        }} className={"w-full flex flex-row gap-2 items-center hover:bg-gray/50 rounded-lg p-3 " + (chainId === ChainId.ARBITRUM_ONE ? "bg-green-500  text-white " : "transparent-bg")}>
                            <div className="thumb bsc">
                                <img className={"w-10 h-10"} src="/images/coins/arb.svg" alt="ARBITRUM" />
                            </div>
                            <div className="flex flex-col items-start justify-start">
                                <span className={"font-bold"}>ARBITRUM</span>
                                <small>ARBITRUM ONE</small>
                            </div>
                        </div>
                        {/* 
                        <div onPress={() => {
                            handleChangeActiveNetwork(ChainId.BITCI);
                        }} className={"w-full hidden flex flex-row gap-2 items-center hover:bg-gray/50 rounded-lg p-3 " + ([ChainId.BITCI, ChainId.BITCI_TEST].includes(chainId) ? "bg-green-500 text-white" : "transparent-bg")}>
                            <div className="thumb bsc">
                                <img className={"w-10 h-10"} src="/images/coins/bitci.svg" alt="BITCI" />
                            </div>
                            <div className="flex flex-col items-start justify-start">
                                <span className={"font-bold"}>BITCI</span>
                                <small>BITCI Chain</small>
                            </div>
                        </div>

                        <div onPress={() => {
                            handleChangeActiveNetwork(ChainId.BITCI_TEST);
                        }} className={"w-full hidden flex flex-row gap-2 items-center hover:bg-gray/50 rounded-lg p-3 " + ([ChainId.BITCI, ChainId.BITCI_TEST].includes(chainId) ? "bg-green-500 text-white" : "transparent-bg")}>
                            <div className="thumb bsc">
                                <img className={"w-10 h-10"} src="/images/coins/bitci.svg" alt="BITCI" />
                            </div>
                            <div className="flex flex-col items-start justify-start">
                                <span className={"font-bold"}>BITCI</span>
                                <small>BITCI Chain</small>
                            </div>
                        </div> */}

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
