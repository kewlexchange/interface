import React, { useEffect, useState } from "react";
import { BLOCKCHAINS, ChainId } from "../../constants/chains";
import { addBlockchain, changeActiveNetwork } from "../../utils/web3Provider";
import useModal, { ModalError, ModalLoading, ModalNoProvider } from "../../hooks/useModals";
import { BigNumber } from "@ethersproject/bignumber";
import { useWeb3React } from '@web3-react/core'
import { switchChain } from "../../utils/switchChain";
import { Button,Image, Tooltip } from "@nextui-org/react";

export const NetworkHeader = (props: { className?: string, testMode?: boolean }) => {
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
                <div className={"w-full h-full items-center justify-center hidden lg:block"}>

                    <div className="w-full h-full  items-center justify-center flex flex-row gap-2">

                        
                     
                        <Tooltip color="danger" content={"Switch Network to SONIC"}>
                        <Button 
                        radius="full"
                        isIconOnly
                        variant={chainId === ChainId.SONIC_MAINNET ? "flat" : "light"}
                        color={chainId === ChainId.SONIC_MAINNET ? "danger" : "default"}
                        className={chainId === ChainId.SONIC_MAINNET ? "p-2 animate animate-pulse" : "p-2"} 
                        onPress={() => {
                            handleChangeActiveNetwork(ChainId.SONIC_MAINNET);
                        }}>
                             <Image className={"w-8 h-8"} src="/images/coins/sonic.svg" alt="SONIC" />
                        </Button>
                        </Tooltip>

                        <Tooltip color="danger" content={"Switch Network to Chiliz"}>
                        <Button 
                        radius="full"
                        isIconOnly
                        variant={chainId === ChainId.CHILIZ_MAINNET ? "flat" : "light"}
                        color={chainId === ChainId.CHILIZ_MAINNET ? "danger" : "default"}
                        className={chainId === ChainId.CHILIZ_MAINNET ? "p-2 animate animate-pulse" : "p-2"} 
                        onPress={() => {
                            handleChangeActiveNetwork(ChainId.CHILIZ_MAINNET);
                        }}>
                             <Image className={"w-8 h-8"} src="/images/coins/chz.svg" alt="CHILIZ" />
                        </Button>
                        </Tooltip>


                        <Tooltip color="danger" content={"Switch Network to AVALANCHE"}>
                        <Button 
                        radius="full"
                        isIconOnly
                        variant={chainId === ChainId.AVALANCHE ? "flat" : "light"}
                        color={chainId === ChainId.AVALANCHE ? "danger" : "default"}
                        className={chainId === ChainId.AVALANCHE ? "p-2 animate animate-pulse" : "p-2"} 
                        onPress={() => {
                            handleChangeActiveNetwork(ChainId.AVALANCHE);
                        }}>
                             <Image className={"w-8 h-8"} src="/images/coins/avax.svg" alt="AVAX" />
                        </Button>
                        </Tooltip>


                        <Tooltip color="danger" content={"Switch Network to Arbitrum"}>
                        <Button 
                        radius="full"
                        isIconOnly
                        variant={chainId === ChainId.ARBITRUM_ONE ? "flat" : "light"}
                        color={chainId === ChainId.ARBITRUM_ONE ? "danger" : "default"}
                        className={chainId === ChainId.ARBITRUM_ONE ? "p-2 animate animate-pulse" : "p-2"} 
                        onPress={() => {
                            handleChangeActiveNetwork(ChainId.ARBITRUM_ONE);
                        }}>
                             <Image className={"w-8 h-8"} src="/images/coins/arb.svg" alt="ARBITRUM ONE" />
                        </Button>
                        </Tooltip>


                      
                       

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
