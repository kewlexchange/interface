import React, { memo, useEffect, useMemo, useState } from 'react';
import ContentLoader from "react-content-loader"
import { useWeb3React } from "@web3-react/core";
import { useDiamondContract, useDomainContract, useNFT1155Contract, useNFT721Contract, useNFTContract } from "../../hooks/useContract";
import { base64 } from "ethers/lib.esm/utils";
import { deriveUniconAttributeIndices } from "../Unicon/utils";
import { BigNumber, ethers } from "ethers";
import useModal, {
    ModalError,
    ModalLoading,
    ModalNoProvider,
    ModalSellNFT,
    ModalSuccessTransaction,
    ModalTransferNFT
} from "../../hooks/useModals";
import { Simulate } from "react-dom/test-utils";
import toggle = Simulate.toggle;
import { parseEther } from "ethers/lib/utils";
import { MetadataItem } from "../MetadataItem";
import { getNFTItemType, unixTimeToDateTime, uriToHttp, uriToIMONProxy } from "../../utils";
import { Accordion, AccordionItem, Button, Card, CardBody, CardHeader, Chip, Input, Select, SelectItem, Table, TableBody, TableColumn, TableHeader, Textarea } from '@nextui-org/react';
import {Chrome} from '@uiw/react-color'
import { hsvaToHex } from '@uiw/color-convert';

const _DomainItem = (props: { domainEntry, itemType, contractAddress, tokenId, showMetadata, canSell, canStake, reloadFunction, canView?}) => {
    const [isLoaded, setLoaded] = useState(false);
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const DOMAINS = useDomainContract(chainId, true)

    const [svgImage, setSVGImage] = useState(null)
    const nftImage = useMemo(() => svgImage, [svgImage])
    const [isSVGImage, setIsSVGImage] = useState(false);
    const IMON_NFTContract = (props.itemType === "ERC-1155" ? useNFT1155Contract() : useNFT721Contract());
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isSell, toggle: toggleSell } = useModal();
    const { state: isTransfer, toggle: toggleTransfer } = useModal();

    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [isLocked, setLocked] = useState(false)
    const [metadata, setMetadata] = useState(null)
    const [contractInfo, setContractInfo] = useState(null)
    const [domainEntry, setDomainInfo]: any = useState(null)
    const [primayName, setPrimaryName]: any = useState(null)

    const [isExpanded, setExpanded]: any = useState(false)

    const handleSell = async (price, amount) => {
        let _userBalance = parseInt(price ? price : "0");
        let _defaultPrice = parseInt(amount ? amount : "0");

        if (_userBalance == 0) { return }
        if (_defaultPrice == 0) { return }

        toggleLoading();
        let sellParams = [{
            assetType: props.itemType === "ERC-1155" ? 3 : 2,
            contractAddress: props.contractAddress,
            tokenId: props.tokenId,
            amount: amount,
            price: parseEther(price)
        }]
        await IMONDIAMOND.sell(sellParams).then(async (tx) => {
            await tx.wait();
            const summary = `Selling NFT's for: ${IMONDIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            toggleSell()
            if (props.reloadFunction) {
                props.reloadFunction()
            }
            fetchImage()
        });
    }
    const handleUnlock = async () => {
        toggleLoading();
        const NFTContract = await IMON_NFTContract(props.contractAddress, true);
        await NFTContract.setApprovalForAll(IMONDIAMOND.address, true).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking NFT's for: ${IMONDIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            if (props.reloadFunction) {
                props.reloadFunction()
            }
            fetchImage();
        });
    }

    const handleTransfer = async (amount, receiver) => {

        if (props.itemType === "ERC-1155") {
            if (parseInt(amount) === 0) {
                setTransaction({ hash: '', summary: '', error: { "message": "Invalid Amount" } });
                toggleError();
                return;
            }
            if (!ethers.utils.isAddress(receiver)) {
                setTransaction({ hash: '', summary: '', error: { "message": "Invalid Address" } });
                toggleError();
                return;
            }
            toggleLoading();
            const NFTContract = await IMON_NFTContract(props.contractAddress, true);
            await NFTContract.safeTransferFrom(account, receiver, props.tokenId, amount, receiver).then(async (tx) => {
                await tx.wait();
                const summary = `Transferring NFT's for: ${receiver}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                await provider.getTransactionReceipt(tx.hash).then(() => {
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error });
                toggleError();
            }).finally(async () => {
                toggleLoading();
            });
        } else if (props.itemType === "ERC-721") {
            toggleLoading();
            const NFTContract = await IMON_NFTContract(props.contractAddress, true);
            console.log(NFTContract)
            await NFTContract.transferFrom(account, receiver, props.tokenId).then(async (tx) => {
                await tx.wait();
                const summary = `Transferring NFT's for: ${receiver}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                await provider.getTransactionReceipt(tx.hash).then(() => {
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error });
                toggleError();
            }).finally(async () => {
                toggleLoading();
            });
        }


    }

    const [hsva, setHsva] = useState({ h: 214, s: 43, v: 90, a: 1 });


    const fetchImage = async () => {
        if (!props.tokenId) { return; }
        var metaData = "";
        const NFTContract = await IMON_NFTContract(props.contractAddress, true);
        const assetURI = props.itemType === "ERC-1155" ? await NFTContract.uri(props.tokenId) : await NFTContract.tokenURI(props.tokenId)
        let _contractInfo = {
            itemType: getNFTItemType(props.itemType),
            contractAddress: props.contractAddress,
            tokenId: `${props.tokenId}`
        }
        setContractInfo(_contractInfo)
        if (account) {
            var _hasAllowance = false;
            try {
                _hasAllowance = await NFTContract.isApprovedForAll(account, IMONDIAMOND.address);
            } catch (exception) {
                _hasAllowance = false;
            } finally {
                setLocked(_hasAllowance)
            }
        }
        if (assetURI.toString().length === 0) {
            return;
        }
        const base64EncodingString = "data:application/json;base64,";
        const ipfsString = "ipfs://"
        if (assetURI.includes(base64EncodingString)) {
            metaData = assetURI.substring(base64EncodingString.length, assetURI.length - 0);
            let metadataJSON = JSON.parse(decodeURIComponent(atob(metaData)));

            setMetadata(metadataJSON)
            setSVGImage(metadataJSON.image)
            setLoaded(true)
            setIsSVGImage(true);

        } else if (assetURI.includes(ipfsString)) {
            var _assetURI = assetURI;
            let fixedTokenId = ((parseInt(props.tokenId) / 1e18) * 1e18).toString()
            if ((!_assetURI.includes(props.tokenId)) && (!_assetURI.includes(fixedTokenId))) {
                _assetURI = `${_assetURI}/${props.tokenId}`
            }
            _assetURI = uriToHttp(_assetURI);
            const _metadataParams = await (
                await fetch(
                    _assetURI[0]
                )
            ).json();
            setSVGImage(uriToHttp(_metadataParams?.image)[0])
            setMetadata(_metadataParams)
            setLoaded(true)
            setIsSVGImage(false);


        } else {
            const _metadataParams = await (
                await fetch(
                    uriToIMONProxy(assetURI)
                )
            ).json();
            setSVGImage(uriToIMONProxy(_metadataParams?.image))
            setMetadata(_metadataParams)
            setLoaded(true)
            setIsSVGImage(false);

        }
    }

    const handleImageError = (event, url) => {
        event.target.src = `${url}`;
    };

    const handleSetAsPrimaryName = async () => {
        if (!props.domainEntry) {
            return;
        }
        toggleLoading();
        await DOMAINS.setName(account, BigNumber.from(props.tokenId).toHexString()).then(async (tx) => {
            await tx.wait();
            const summary = `Settings primary namer: ${account}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            props.reloadFunction();
        });

    }

    const fetchDomainInfo = async () => {
        console.log(props.tokenId)
        const userPrimaryName = await DOMAINS.getDomainByAddress(account);
        setPrimaryName(userPrimaryName)
        const [_domainInfo, _resolveInfo] = await DOMAINS.getDomainAndResolveInfoByNameHash(BigNumber.from(props.tokenId).toHexString())
        setDomainInfo({ domainInfo: _domainInfo, resolveInfo: _resolveInfo })
        console.log("domain:", _domainInfo);
        console.log("resolve:", _resolveInfo)

        //  console.log(resolveInfo);
    }


    const handleChangeComplete = (color) => {
        console.log("color",color)
        //this.setState({ background: color.hex });
      };
    
    useEffect(() => {
        // fetchDomainInfo();
    }, [props.tokenId])
    // @ts-ignore
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

            <ModalSellNFT handleSell={handleSell} isShowing={isSell} hide={toggleSell} contractAddress={props.contractAddress} tokenId={props.tokenId} tokenType={props.itemType} />
            <ModalTransferNFT handleTransfer={handleTransfer} isShowing={isTransfer} hide={toggleTransfer} contractAddress={props.contractAddress} tokenId={props.tokenId} tokenType={props.itemType} />


            {
                props.domainEntry && props.domainEntry.domainInfo.isValid &&
                <div className='w-full rounded-lg'>

                    {

                        <div className='domainSection'>
                            <div className='domainEntry'>
                                <span>Domain Name</span>
                                <span className='text-xs'>{props.domainEntry.domainInfo.name}</span>
                            </div>
                            <div className='domainEntry'>
                                <span>Owner</span>
                                <span className='text-xs'>{props.domainEntry.domainInfo.owner}</span>
                            </div>


                            <Accordion className='w-full px-0' variant="splitted">
                                <AccordionItem key="manager" aria-label="Manager" title="Manager">
                                    <div className='w-full flex flex-col gap-2'>
                                        <Input variant='bordered' defaultValue={props.domainEntry.domainInfo.manager} size={"lg"} type="text" label="Manager" placeholder="0x..." />
                                        <Button color='default' className='w-full'>Save</Button>
                                    </div>
                                </AccordionItem>
                            </Accordion>

                            <div className='grid grid-cols-2 gap-2'>
                                <Card>
                                    <CardHeader>
                                        Registration Date
                                    </CardHeader>
                                    <CardBody>
                                        <span className='text-xs'>{unixTimeToDateTime(props.domainEntry.domainInfo.registrationDate)}</span>
                                    </CardBody>
                                </Card>
                                <Card>
                                    <CardHeader>Expiration Date</CardHeader>
                                    <CardBody>
                                        <span className='text-xs'>{unixTimeToDateTime(props.domainEntry.domainInfo.expirationDate)}</span>
                                    </CardBody>
                                </Card>
                            </div>

                            <Accordion className='w-full px-0' variant="splitted">
                                <AccordionItem key="avatar" aria-label="Avatar" title="Avatar">
                                    <div className='w-full flex flex-col gap-2'>
                                        <Input variant='bordered' defaultValue={props.domainEntry.domainInfo.avatar} size={"lg"} type="text" label="Avatar" placeholder="ipfs://hash..." />
                                        <Button color='default' className='w-full'>Save</Button>
                                    </div>
                                </AccordionItem>
                            </Accordion>

                            <Accordion className='w-full px-0' variant="splitted">
                                <AccordionItem key="bio" aria-label="Bio" title="Bio">
                                    <div className='w-full flex flex-col items-start justify-center gap-2'>
                                        <Textarea
                                            variant='bordered'
                                            label="Bio"
                                            placeholder="Enter your bio..."
                                            className="w-full"
                                            defaultValue={props.domainEntry.domainInfo.description}
                                        />
                                        <Button color='default' className='w-full'>Save</Button>
                                    </div>
                                </AccordionItem>
                            </Accordion>

                            <Accordion className='w-full px-0' variant="splitted">
                                <AccordionItem key="records" aria-label="Records" title="Records">
                                    <div className='w-full flex flex-col items-start justify-center gap-2'>


                                        <Select
                                            size={"lg"}
                                            variant='bordered'
                                            label="Record Type"
                                            placeholder="Select record type"
                                            className="w-full"
                                        >
                                            <SelectItem key={"recA"} value={"A"}>A</SelectItem>
                                            <SelectItem key={"recAAAA"} value={"AAAA"}>AAAA</SelectItem>
                                            <SelectItem key={"recCNAME"} value={"CNAME"}>CNAME</SelectItem>
                                            <SelectItem key={"recMX"} value={"MX"}>MX</SelectItem>
                                            <SelectItem key={"recNS"} value={"NS"}>NS</SelectItem>
                                            <SelectItem key={"recTXT"} value={"TXT"}>TXT</SelectItem>
                                        </Select>

                                        <Input type="text" variant={"bordered"} label="Name" placeholder="@" />

                                        <Input type="text" variant={"bordered"} label="IP Address" placeholder="127.0.0.1" />

                                        <Button color='default' className='w-full'>Save</Button>
                                    </div>
                                </AccordionItem>
                            </Accordion>



                            <Accordion className='w-full px-0' variant="splitted">
                                <AccordionItem key="adresses" aria-label="Addresses" title="Addresses">
                                    <div className='w-full flex flex-col items-start justify-center gap-2'>


                                        <Select
                                            size={"lg"}
                                            variant='bordered'
                                            label="Coin Type"
                                            placeholder="Select address type"
                                            className="w-full"
                                        >
                                            <SelectItem key={"recBTC"} value={"BTC"}>BTC</SelectItem>
                                            <SelectItem key={"recTRON"} value={"TRON"}>TRON</SelectItem>
                                            <SelectItem key={"recXRP"} value={"XRP"}>XRP</SelectItem>
                                            <SelectItem key={"recXLM"} value={"XLM"}>XLM</SelectItem>
                                        </Select>

                                        <Input type="text" variant={"bordered"} label="Address" placeholder="" />

                                        <Button color='default' className='w-full'>Save</Button>


                                        <Table aria-label="Address List">
                                            <TableHeader>
                                                <TableColumn>Asset</TableColumn>
                                                <TableColumn>Address</TableColumn>
                                                <TableColumn>Status</TableColumn>
                                            </TableHeader>
                                            <TableBody emptyContent={"No rows to display."}>

                                            </TableBody>
                                        </Table>
                                    </div>
                                </AccordionItem>
                            </Accordion>

                            <div className='domainEntry'>
                                <span>Sub Domain Count</span>
                                <span className='text-xs'>{props.domainEntry.domainInfo.subdomains.length}</span>
                            </div>

                            <Accordion className='w-full px-0' variant="splitted">
                                <AccordionItem startContent={
                                    <div className='w-full flex flex-col items-start justify-center gap-2'>
                                        <span>Colors</span>
                                        <div className='grid grid-cols-4 gap-2'>
                                            <div style={{ backgroundColor: `#${props.domainEntry.domainInfo.colors.color0}` }} className={`rounded-lg w-5 h-5 bg-[#${props.domainEntry.domainInfo.colors.color0}]`}>

                                            </div>
                                            <div style={{ backgroundColor: `#${props.domainEntry.domainInfo.colors.color1}` }} className={`rounded-lg w-5 h-5 bg-[#${props.domainEntry.domainInfo.colors.color0}]`}>

                                            </div>
                                            <div style={{ backgroundColor: `#${props.domainEntry.domainInfo.colors.color2}` }} className={`rounded-lg w-5 h-5 bg-[#${props.domainEntry.domainInfo.colors.color0}]`}>

                                            </div>
                                            <div style={{ backgroundColor: `#${props.domainEntry.domainInfo.colors.color3}` }} className={`rounded-lg w-5 h-5 bg-[#${props.domainEntry.domainInfo.colors.color0}]`}>

                                            </div>
                                        </div>

                                    </div>

                                } key="colors" aria-label="Colors">
                                    <div className='w-full flex flex-col gap-2'>
                                        <Chrome color={hsva} onChange={(color) => setHsva({ ...hsva, ...color.hsva })} />


                                        <Button color='default' className='w-full'>Save</Button>
                                    </div>
                                </AccordionItem>
                            </Accordion>


                            <div className='w-full'>
                                <Button size={"lg"} color={"default"} onClick={() => {
                                    handleSetAsPrimaryName();
                                }} className=''>
                                    Set as primary name
                                </Button>
                            </div>
                        </div>
                    }

                </div>

            }
        </>
    );
}
export const DomainItem = memo(_DomainItem)

