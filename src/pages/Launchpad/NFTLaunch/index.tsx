import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "@/hooks/useModals";
import { NavLink } from "react-router-dom";
import IPage from "../../../interfaces/page";
import { Button, Input, Slider } from "@nextui-org/react";
import { useNFTLaunchpadContract } from "../../../hooks/useContract";
import { formatEther, parseEther } from "@ethersproject/units";
import { Image } from "@nextui-org/react";
import { ChainId } from "../../../constants/chains";
import { title } from "../../../Components/Primitives";

const NFTLaunch: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [statusText, setStatusText] = useState("Waiting for confirmation...")
    const [amount, setAmount] = useState(1);
    const [totalRaised, setTotalRaised]: any = useState(parseEther("0"))
    const [totalSupply, setTotalSupply]: any = useState(parseEther("0"))
    const [pricePerMint, setPricePerMint]: any = useState(parseEther("0"))
    const NFTLaunchpadPage = useNFTLaunchpadContract();

    const [contractAddress, setContractAddress] = useState("0x04fa42044D98437D2839E06AC203E0A14fF631D7")
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);


    const loadData = async () => {
        const GEMNFT = NFTLaunchpadPage(contractAddress, true);
        const _totalSupply = await GEMNFT.maxSupply();
        const _totalBalance = await provider.getBalance(contractAddress);
        const _pricePerMint = await GEMNFT.pricePerMint();

        setPricePerMint(_pricePerMint);
        setTotalRaised(_totalBalance);
        setTotalSupply(_totalSupply);
    }

    useEffect(() => {
        if (chainId) {
            loadData()
        }
    }, [chainId, account])

    const handleMint = async () => {
        if (![ChainId.CHILIZ_SPICY_TESTNET, ChainId.CHILIZ_MAINNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Unsupported Chain!!" } });
            toggleError();
            return
        }
        if (!amount) { return }
        if (amount === 0) {
            setTransaction({ hash: '', summary: '', error: { message: "Amount cannot be zero!" } });
            toggleError();
            return
        }
        if (!account) {
            setTransaction({ hash: '', summary: '', error: { message: "Please connect with metamask!" } });
            toggleError();
            return
        }
        let overrides = {
            value: pricePerMint.mul(amount)
        }

        toggleLoading();
        const GEMNFT = NFTLaunchpadPage(contractAddress, true);
        await GEMNFT.mint(amount, account, overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Minting IMON Collection: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
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
                    <Image radius="none" removeWrapper  src={"/images/nftlaunchpad/csp/cover.png"} />
                </div>
                <div className={"w-full flex sm:text-center items-center justify-center flex-col gap-3 py-10"}>
                    <h1 className={title({ size: "lg", color: "violet" })}>Chili Sport Serial</h1>
                    <h2 className={title({ size: "md", color: "indigo" })}>
                        OMGart's Chz Chain Player Collection
                    </h2>
                </div>

                <div className="w-full flex flex-col items-center justify-center">
                    <Image src={"/images/nftlaunchpad/csp/avatar.gif"} />
                </div>


                <div className={"sm:w-[60%] w-full flex flex-col items-center justify-center gap-5 my-5"}>
                    <div className={"w-full rounded-lg flex flex-row items-center justify-center text-center gap-2"}>
                        <div className="w-full grid sm:grid-cols-3 grid-cols-1 gap-2">
                            <div className={"w-full border flex flex-col gap-2 border-3  border-default  rounded-xl p-2"}>
                                <h2 className={title({ size: "sm", color: "violet" })}>TOTAL RAISED</h2>
                                <span className={title({ size: "sm", color: "orange" })}>{formatEther(totalRaised)} CHZ</span>
                            </div>
                            <div className={"w-full border flex flex-col gap-2 border-3  border-default  rounded-xl p-2"}>
                                <h2 className={title({ size: "sm", color: "violet" })}>TOTAL SUPPLY</h2>
                                <span className={title({ size: "sm", color: "orange" })}>{BigNumber.from(totalSupply).toNumber()}</span>
                            </div>
                            <div className={"w-full border flex flex-col gap-2 border-3  border-default  rounded-xl p-2"}>
                                <h2 className={title({ size: "sm", color: "violet" })}>PRICE PER ITEM</h2>
                                <span className={title({ size: "sm", color: "orange" })}>{formatEther(pricePerMint)} CHZ</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full gap-2 flex flex-col items-center justify-center">
                        <Input className="w-full" readOnly size={"lg"} type="text" label="Contract Address" value={contractAddress} placeholder="Enter your contract address" />

                        <Slider
                            onChange={(e) => {
                                setAmount(e)
                            }}
                            size="lg"
                            step={1}
                            label={"Enter your mint amount"}
                            color="default"
                            showSteps={true}
                            maxValue={30}
                            minValue={1}
                            defaultValue={1}
                            className="w-full"
                        />

                        <div className="w-full rounded-lg border  border-default flex flex-row gap-2 items-center justify-between p-2">
                            <span>Total</span>
                            <span>{amount > 0 ? formatEther(pricePerMint.mul(amount)) : 0} CHZ</span>
                        </div>
                        <Button className="w-full" size="lg" onPress={() => {
                            if ([ChainId.CHILIZ_SPICY_TESTNET, ChainId.CHILIZ_MAINNET].includes(chainId)) {
                                handleMint();
                            }

                        }} color="default" variant="solid">
                            Mint
                        </Button>
                    </div>



                </div>

            </div>


        </>
    )
}


export default NFTLaunch;

