import IPage from "../../../interfaces/page";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useDiamondContract } from "../../../hooks/useContract";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "../../../hooks/useModals";
import { DEFAULT_CHAIN_ASSETS_URL } from "../../../constants/chains";
import { NFTItem } from "../../../Components/NFTItem";
import { NFT } from "../../../Components/NFT";
import {
    getIconByChainId,
    getNativeCurrencyByChainId,
    getNFTItemType,
    getShordAccount,
    getShordAccountForMobile
} from "../../../utils";
import { formatEther, parseEther } from "ethers/lib/utils";
import Identicon from "../../../Components/Identicon";
import { Button, Card, CardHeader, Input, Image, Slider, CardBody, CardFooter } from "@nextui-org/react";
const NFTDetails: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [nftItem, setNFTItem] = useState(null);
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [defaultAmount, setDefaultAmount] = useState("0")
    const [totalPrice, setTotalPrice] = useState("0")
    const [minters, setMinters] = useState([])
    const [royaltiesFee, setRoyaltiesFee] = useState("0")


    useEffect(() => {
        if (!nftItem) { return; }
        const _defaultAmount = parseInt(defaultAmount ? defaultAmount : "0");
        const _totalPrice = nftItem.price_per_token.mul(_defaultAmount)
        setTotalPrice(formatEther(_totalPrice));

        if (nftItem.hasRoyalties) {
            const _royaltiesFee = nftItem.royaltiesFee.div(nftItem.amount)
            setRoyaltiesFee(formatEther(_royaltiesFee.mul(_defaultAmount)))
        }


    }, [defaultAmount])
    const handleBuy = async () => {
        if (!account) { return; }
        if (defaultAmount === "") {
            setTransaction({ hash: '', summary: '', error: { message: "Amount is not valid!" } });
            toggleError();
            return;
        }


        const buyParams = [{
            collectionId: nftItem.collectionId,//1
            itemId: nftItem.itemId, // 0
            tokenId: nftItem.tokenId, // 1
            amount: defaultAmount
        }]

        const priceNFT = parseEther(totalPrice);
        let buy1155ParamOverrides = {
            value: priceNFT
        }

        toggleLoading();
        await IMONDIAMOND.buy(buyParams, buy1155ParamOverrides.value, buy1155ParamOverrides).then(async (tx) => {
            await tx.wait();
            const summary = `Buying NFT: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });


    }

    useEffect(()=>{},[chainId,account])

    const handleCancel = async () => {
        if (!account) { return; }

        const cancelParams = [{
            collectionId: nftItem.collectionId,//1
            itemId: nftItem.itemId
        }]

        toggleLoading();
        await IMONDIAMOND.cancel(cancelParams).then(async (tx) => {
            await tx.wait();
            const summary = `Cancelling NFT Listings: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            fetchAssets();
        });


    }


    const fetchAssets = async () => {
        if (!IMONDIAMOND) { return; }
        const _collectionParams = location.pathname.replace("/nfts/", "")
        const [collectionId, itemId] = _collectionParams.split("/");
        const [marketItem, collectionInfo] = await IMONDIAMOND.fetchItem(collectionId, itemId);
        setNFTItem(marketItem);
        setDefaultAmount("")
        console.log("activeItem", marketItem)
        console.log("collection", collectionInfo)
    }

    const handleChangeInput = (e) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        let checkValue = e.target.value.replace(",", ".")
        if (regex.test(checkValue)) {
            setDefaultAmount(checkValue)
            return
        }
        setDefaultAmount("")
    }

    useEffect(() => {
        fetchAssets()
    }, [chainId, account, IMONDIAMOND])

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
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />


            <div className={" mx-auto max-w-xl min-w-xl py-10"}>
                <div className={"w-full"}>
                    <div className=" w-full px-4">
                        <div className={"w-full flex flex-col gap-2 items-center justify-center"}>
                            {
                                nftItem && <NFT reloadFunction={undefined} showMetadata={true} itemType={getNFTItemType(nftItem.assetType)} contractAddress={nftItem.contract_address} tokenId={nftItem.tokenId} canSell={false} canStake={false} />

                            }

                            {
                                account && nftItem && account != nftItem.seller && !nftItem.is_cancelled &&
                                <>

                                    <div className="max-w-xl w-full min-w-xl sm:w-full sm:max-w-full">
                                        <Card>
                                            <CardHeader className="flex gap-3">
                                                <Image
                                                    alt="Intelligent Monsters"
                                                    height={40}
                                                    radius="sm"
                                                    src={getIconByChainId(chainId, false)}
                                                    width={40}
                                                />
                                                <div className="flex flex-col">
                                                    <p className="text-md">Buy NFT</p>
                                                    <p className="text-small text-default-500">Available Item : {BigNumber.from(nftItem.remaining_amount).toNumber()} NFT </p>
                                                </div>
                                            </CardHeader>
                                            <CardBody>
                                                <div className="flex items-center justify-start p-2">


                                                    <Slider
                                                        onChange={(e) => {
                                                            setDefaultAmount(e)
                                                        }}
                                                        size="lg"
                                                        step={1}
                                                        color="default"
                                                        label="Amount"
                                                        showSteps={false}
                                                        maxValue={BigNumber.from(nftItem.remaining_amount).toNumber()}
                                                        minValue={0}
                                                        defaultValue={0}
                                                        className="w-full"
                                                    />


                                                </div>
                                                <div className="grid grid-cols-2 gap-4 justify-between  flex-wrap">
                                                    <Card className={"whitespace-nowrap flex flex-col rounded-lg p-2 gap-2"}>
                                                        <span className="text-xs text-pink-960 font-semibold ">Royalties Fee</span>  <span className={"flex flex-row items-center justify-start gap-2"}><img className={"w-5 h-5"} src={getIconByChainId(chainId)} /> {royaltiesFee} {getNativeCurrencyByChainId(chainId)} </span>
                                                    </Card>
                                                    <Card className="whitespace-nowrap flex flex-col rounded-lg p-2 gap-2  items-start justify-center">
                                                        <span className="text-xs text-pink-960 font-semibold ">Royalties Receiver</span> <span className={"flex flex-row gap-2"}><Identicon size={20} account={nftItem.royaltiesReceiver} /> <span>{getShordAccount(nftItem.royaltiesReceiver)}</span></span>
                                                    </Card>
                                                    <Card className={"whitespace-nowrap flex flex-col rounded-lg  p-2 gap-2"}>
                                                        <span className="text-xs text-pink-960 font-semibold ">Unit Price</span>  <span className={"flex flex-row items-center justify-start gap-2"}><img className={"w-5 h-5"} src={getIconByChainId(chainId)} /> {formatEther(nftItem.price_per_token)} {getNativeCurrencyByChainId(chainId)} </span>
                                                    </Card>
                                                    <Card className="whitespace-nowrap flex flex-col rounded-lg  p-2 gap-2">
                                                        <span className="text-xs text-pink-960 font-semibold ">Total Price</span> <span className={"flex flex-row items-center justify-start gap-2"}><img className={"w-5 h-5"} src={getIconByChainId(chainId)} />  {totalPrice} {getNativeCurrencyByChainId(chainId)} </span>
                                                    </Card>

                                                </div>
                                            </CardBody>
                                            <CardFooter>
                                                <div className="w-full flex flex-col items-center justify-center">
                                                    {account && nftItem && !nftItem.is_cancelled && account && nftItem && !nftItem.is_completed &&
                                                        <Button color="default" size="lg" onClick={() => {
                                                            handleBuy()
                                                        }} className="w-full">Buy Now</Button>
                                                    }

                                                </div>
                                            </CardFooter>
                                        </Card>


                                    </div>
                                </>
                            }

                            {account && nftItem && !nftItem.is_cancelled && !nftItem.is_completed && account === nftItem.seller &&

                                <div className="max-w-xl min-w-xl sm:w-full sm:max-w-full rounded-xl  p-2">
                                    <Button onClick={() => {
                                        handleCancel()
                                    }} color="default" size="lg" className={"w-full"}>Cancel</Button>
                                </div>}


                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}


export default NFTDetails;
