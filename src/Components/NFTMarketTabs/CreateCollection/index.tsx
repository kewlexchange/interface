import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useIMONMarketContract, useDomainContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, getShordAccount, getShordAccountForMobile, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { updateUserDeadline, updateUserSlippageTolerance } from '../../../state/user/reducer';
import { Accordion, AccordionItem, Badge, Button, ButtonGroup, Card, CardBody, CardFooter, Input, Radio, RadioGroup, Select, SelectItem, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea } from '@nextui-org/react';
import { MORALIS_API_KEY } from '../../../constants/ai';
import useBlockNumber from '../../../hooks/useBlockNumber';
import { formatEther, hexZeroPad, parseEther } from 'ethers/lib/utils';
import { MarketNFTItem } from '../../MarketNFTItem';
import { group } from 'console';
import Identicon from '../../Identicon';
import { useFieldArray, useForm } from 'react-hook-form';
import useFilePreview from '../../../hooks/useFilePreview';



const _NFT_MARKET_CREATE_COLLECTION_TAB = () => {
    const blockNumber = useBlockNumber()
    const { register, control, unregister, setValue, watch, handleSubmit, getValues, formState } = useForm();

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const ERC20Contract = useERC20Contract()
    const NFTMARKETPLACE = useIMONMarketContract(chainId, true);
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()
    const [transactions, setTransactions]: any = useState([])
    const [isLoaded, setLoaded] = useState(false)
    const DOMAINS = useDomainContract(chainId, true)

    const { fields, append, remove } = useFieldArray({
        control,
        name: "attributes"
    });
    const selectedFile = watch('file');
    const [filePreview] = useFilePreview(selectedFile);

    const [formValues, setFormValues] = useState(null)

    const selectedCollectionInfo = watch("collection", ethers.constants.AddressZero);
    const [nextTokenId, setNextTokenId] = useState(0);
    const [statusText, setStatusText] = useState("Waiting for confirmation...")

    const [userCollections, setUserCollections] = useState([])
    const [is1155, setIs1155] = useState(false)
    const [royaltiesRatio, setRoyaltiesRatio] = useState(0)




    useEffect(() => {
        const selectedCollectionIndex = userCollections.findIndex(tokenItem => tokenItem.collection === selectedCollectionInfo);
        let _name = "";
        let _symbol = "";



        if (selectedCollectionIndex > -1) {
            _name = userCollections[selectedCollectionIndex].name;
            _symbol = userCollections[selectedCollectionIndex].symbol;
            setNextTokenId(userCollections[selectedCollectionIndex].nextTokenId);

            if (userCollections[selectedCollectionIndex].assetType == 2) {
                setIs1155(false);
                setValue("mint_amount", 1);
            } else if (userCollections[selectedCollectionIndex].assetType == 3) {
                setIs1155(true);
                setValue("mint_amount", 1000);
            }

        }

        setValue("collection_name", _name);
        setValue("collection_symbol", _symbol);
        setValue("royalties_receiver", account)



    }, [selectedCollectionInfo])

    const initMoralis = async () => {
        await Moralis.start({
            apiKey: "6DKLfH7o0otqHcAM94VuQQLU5WfJEYZK5VfbibFwYB7EMs5qX89Pb3LA61dwQfmV",
        });
        //Gn0fMLNMj5Vszyr85kz5ypRR7bZcnzzzmHWJcx84TCy9zAiMLm8xfCCevxdNpZHU
        console.log("Moralis Initialized")
    }
    useEffect(() => {
        initMoralis();
    }, [])

    const initDefaults = async () => {
        if (!account) { return; }
        try {
            const _userCollections = await IMONDIAMOND.getUserCollections(account);
            setUserCollections(_userCollections);
        } catch (ex) {

        }

        setValue("royalties_receiver", account)

        if (["0xd37af52c1d214027582EAC330AB9854D9F62f8cB"].includes(account)) {
            let description = `Ersan Yakıt, born on December 5th, 1989, is a blockchain developer who has a passion for colors. Known for his creative mind and love for technology, Ersan is constantly pushing boundaries and bringing unique projects to life in the world of computers.\n\n
        Ersan's interest in technology started during his childhood and gradually turned into a passion. He dedicated himself to continuous learning and focused on blockchain technology and cryptocurrencies. With his knowledge and experience in the field, Ersan showcases his ability to generate innovative solutions.\n\n
        Ersan has contributed to numerous projects in the blockchain world and has successfully worked on different platforms. He tirelessly strives to optimize systems, ensure security, and enhance user experiences.\n\n 
        However, Ersan's interests go beyond the technological realm. His affinity for colors adds an artistic vision to his work. By infusing warmth and vibrancy into the often cold world of technology, he manages to bring a unique aesthetic and creativity to his projects.\n\n
        Ersan Yakıt is determined to achieve even greater success by utilizing his knowledge and skills in the blockchain domain. He aims to explore the depths of the technology world while leaving a mark in a colorful and vibrant universe.\n\n
        When Ersan's story combines his passion for technology, creativity, and connection with colors, it forms a biography that pushes boundaries and leaves a remarkable impact.`

            setValue("description", description)
            setValue("collection_name", "IMON DEVELOPERS")
            setValue("collection_symbol", "IMONDEV")
            setValue("name", "ERSAN YAKIT")
            setValue("external_url", "https://kewl.exchange")
            remove();
            const newItems = [
                {
                    trait_type: "Engine",
                    display_type: "string",
                    value: "IMON",
                    max_value: ""
                }, {
                    trait_type: "WEB",
                    display_type: "string",
                    value: "https://kewl.exchange",
                    max_value: ""
                }, {
                    trait_type: "BLOCKCHAIN",
                    display_type: "string",
                    value: "CHILIZ",
                    max_value: ""
                }, {
                    trait_type: "RARITY",
                    display_type: "boost_percentage",
                    value: "1",
                    max_value: "8000000000"
                },
                {
                    trait_type: "NAME",
                    display_type: "string",
                    value: "ERSAN YAKIT",
                    max_value: ""
                }, {
                    trait_type: "BIRTHDAY",
                    display_type: "birthday",
                    value: "628884552",
                    max_value: ""
                },
                {
                    trait_type: "OCCUPATION",
                    display_type: "string",
                    value: "CODER",
                    max_value: ""
                },
                {
                    trait_type: "MARRIED",
                    display_type: "string",
                    value: "NO",
                    max_value: ""
                }, {
                    trait_type: "MILITARY STATUS",
                    display_type: "string",
                    value: "PINK CERTIFICATE",
                    max_value: ""
                },
                {
                    trait_type: "RELIGION",
                    display_type: "string",
                    value: "NONE",
                    max_value: ""
                },
                {
                    trait_type: "VIRGINITY",
                    display_type: "string",
                    value: "NO",
                    max_value: ""
                },
                {
                    trait_type: "NATIONALITY",
                    display_type: "string",
                    value: "UNIVERSE",
                    max_value: ""
                },
                {
                    trait_type: "BODY",
                    display_type: "string",
                    value: "SEXY",
                    max_value: ""
                },
                {
                    trait_type: "EYE COLOR",
                    display_type: "string",
                    value: "BROWN",
                    max_value: ""
                },
                {
                    trait_type: "EYEBROW COLOR",
                    display_type: "string",
                    value: "BLACK",
                    max_value: ""
                },
                {
                    trait_type: "SKIN COLOR",
                    display_type: "string",
                    value: "WHITE",
                    max_value: ""
                },
                {
                    trait_type: "HAIR COLOR",
                    display_type: "string",
                    value: "BLACK & WHITE",
                    max_value: ""
                },
                {
                    trait_type: "HEAD SHAPE",
                    display_type: "string",
                    value: "ROUND",
                    max_value: ""
                },
                {
                    trait_type: "BODY TYPE",
                    display_type: "string",
                    value: "ELEGANT, SLIM and SEXY",
                    max_value: ""
                },
                {
                    trait_type: "HEIGHT",
                    display_type: "string",
                    value: "AVERAGE HEIGHT",
                    max_value: ""
                },
                {
                    trait_type: "EYE SHAPE",
                    display_type: "string",
                    value: "OVAL",
                    max_value: ""
                },
                {
                    trait_type: "LIP SHAPE",
                    display_type: "string",
                    value: "THIN BOW-SHAPED",
                    max_value: ""
                },
                {
                    trait_type: "NOSE SHAPE",
                    display_type: "string",
                    value: "CURVED",
                    max_value: ""
                },
                {
                    trait_type: "HAND TYPE",
                    display_type: "string",
                    value: "SEXY and LONG-FINGERED",
                    max_value: ""
                },
                {
                    trait_type: "FASHION STYLE",
                    display_type: "string",
                    value: "ELEGANT and CASUAL",
                    max_value: ""
                },
                {
                    trait_type: "ACCESSORIES",
                    display_type: "string",
                    value: "GLAESSES, HAT, NECKLARE, WATCH",
                    max_value: ""
                },
                {
                    trait_type: "PERSONALITY TRAITS",
                    display_type: "string",
                    value: "SYMPATHETIC and POLITE",
                    max_value: ""
                },
                {
                    trait_type: "PASSIONATE",
                    display_type: "boost_percentage",
                    value: "10",
                    max_value: "10"
                },
                {
                    trait_type: "ALCOHOL USE",
                    display_type: "string",
                    value: "YES",
                    max_value: ""
                },
                {
                    trait_type: "SMOKING",
                    display_type: "string",
                    value: "YES",
                    max_value: ""
                },
            ];
            append(newItems);


        } else {
            remove();
            const newItems = [
                {
                    trait_type: "Engine",
                    display_type: "string",
                    value: "KEWL",
                    max_value: ""
                }, {
                    trait_type: "WEB",
                    display_type: "string",
                    value: "https://kewl.exchange",
                    max_value: ""
                }, {
                    trait_type: "BLOCKCHAIN",
                    display_type: "string",
                    value: "CHILIZ",
                    max_value: ""
                }, {
                    trait_type: "RARITY",
                    display_type: "boost_percentage",
                    value: "1",
                    max_value: "100"
                }
            ];
            append(newItems);
        }
    }

    const uploadFile = async (index, fileData, extension) => {
        const abi = [{
            "path": `${(index).toString()}.${extension}`,
            "content": fileData
        }];
        const response = await Moralis.EvmApi.ipfs.uploadFolder({ abi });
        return response.toJSON();
    }


    const handleCreateCollection = async () => {
        const metadataValues = getValues();
        delete metadataValues?.file;
        delete metadataValues?.collection;

        let hasError = false;
        let errorMessage = ""
        if (metadataValues?.collection_name === "") {
            hasError = true
            errorMessage = "Collection Name cannot be empty!"
        } else if (metadataValues?.collection_symbol === "") {
            hasError = true
            errorMessage = "Collection Symbol cannot be empty!"
        } else if (metadataValues?.description === "") {
            hasError = true
            errorMessage = "Collection Description cannot be empty!"
        } else if (metadataValues?.name === "") {
            hasError = true
            errorMessage = "Character Name cannot be empty!"
        } else if (metadataValues?.external_url === "") {
            hasError = true
            errorMessage = "External URL cannot be empty!"
        }


        let metadataList = [];
        if (fields.length > 0) {
            fields.map((item, value) => {
                if (item?.trait_type != "") {
                    metadataList.push({
                        trait_type: item?.trait_type,
                        display_type: item?.display_type,
                        value: item?.value,
                        max_value: item?.max_value
                    })
                }
            })
        }
        metadataValues.attributes = metadataList;

        if (hasError) {
            setTransaction({ hash: '', summary: '', error: { message: errorMessage } });
            toggleError();
            return;
        }


        if (selectedFile.length === 0) {
            setTransaction({ hash: '', summary: '', error: { message: "Please select image!" } });
            toggleError();
            return;
        }
        toggleLoading();
        setStatusText("Reading image...");
        const encodedImageFile = await convertToBase64(selectedFile[0]);
        const base64WithoutPrefix = `${encodedImageFile}`.replace(/^data:image\/[a-z]+;base64,/, "");
        const fileName = selectedFile[0].name;
        const fileExtension = fileName.split('.').pop();
        setStatusText("Uploading image to IPFS...");
        const uploadedImage = await uploadFile(nextTokenId, base64WithoutPrefix, fileExtension)
        if (uploadedImage.length === 0) {
            setTransaction({ hash: '', summary: '', error: { message: "Upload failed!" } });
            toggleError();
            toggleLoading();
            return;
        }

        const uploadedImagePath = convertURLToIPFS(uploadedImage[0].path);
        setStatusText("Creating metadata...");
        metadataValues["image"] = uploadedImagePath;
        metadataValues["image_url"] = uploadedImagePath;
        let encodedContent = utf8ToBase64((JSON.stringify(metadataValues)))
        setStatusText("Uploading metadata to IPFS...");

        const uploadMetadataResponse = await uploadFile(nextTokenId, encodedContent, "json")
        if (uploadMetadataResponse.length === 0) {
            setTransaction({ hash: '', summary: '', error: { message: "Metadata upload failed!" } });
            toggleError();
            toggleLoading();
            return;
        }
        const metadataPath = convertURLToIPFS(uploadMetadataResponse[0].path);
        setStatusText("Metadata has been uploaded successfuly.");

        const royaltiesReceiver = ethers.utils.isAddress(getValues("royalties_receiver")) ? getValues("royalties_receiver") : ethers.constants.AddressZero;
        const mintUserNFTParams = {
            assetType: is1155 ? 3 : 2,
            amount: getValues("mint_amount"),
            collection: selectedCollectionInfo,
            owner: account,
            royaltyFraction: 750,
            royaltiesReceiver: royaltiesReceiver,
            name: getValues("collection_name"),
            symbol: getValues("collection_symbol"),
            ipfsHash: metadataPath
        };

        const mintUserNFTOverrides = {
            value: 0
        }
        setStatusText("Creating transaction... Please wait!");

        await IMONDIAMOND.mintUserNFT(mintUserNFTParams, mintUserNFTOverrides).then(async (tx) => {
            await tx.wait();
            const summary = `Creating NFT: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            initDefaults();
            toggleLoading();
        });


    }

    useEffect(() => {
        initDefaults()
    }, [chainId, account])





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

            <div className={"container mx-auto w-full"}>

                <form className={"flex flex-col gap-2 p-2"} onSubmit={handleSubmit((obj) => {
                    console.log("Submit even pressed", obj);
                })}>

                    <Card className={"w-full"}>
                        <CardBody>

                            <Accordion variant='splitted'>
                                <AccordionItem key="1" aria-label="Accordion 1" subtitle="Please select the image you want to create NFT" title="Image">
                                    <div className={"w-full min-h-[300px] rounded-lg border border-default p-4 items-start justify-start gap-2 flex flex-col"}>
                                        <Input size='lg' variant='flat' type="file" accept="image/jpeg, image/png, image/jpg, image/webp" name="image"  {...register('file')} />
                                        {filePreview && <img src={filePreview} className={"w-full h-full min-h-[500px] max-h-[600px] object-cover rounded-lg"} alt="Intelligent Monsters" />}

                                    </div>
                                </AccordionItem>
                                <AccordionItem
                                    key="2"
                                    aria-label="Accordion 2"
                                    subtitle={
                                        <span>
                                            Comprehensive Information About Your NFT Collection
                                        </span>
                                    }
                                    title="Collection Settings"
                                >
                                    <div className={"w-full gap-2"}>

                                        <div className={"w-full flex flex-col gap-2 p-2 rounded-lg"}>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Collection</span>
                                                <Select
                                                    size='lg'
                                                    {...register('collection')}
                                                    name={"collection"}
                                                >
                                                    <SelectItem value={ETHER_ADDRESS}>IMON Community Collection</SelectItem>
                                                    <SelectItem value={ethers.constants.AddressZero}>Create New Collection</SelectItem>
                                                    {
                                                        userCollections.length > 0 && userCollections.map((collectionItem, collectionIndex) => {
                                                            return <SelectItem key={`userCollection${collectionIndex}`} value={collectionItem.collection}>{collectionItem.name} - {collectionItem.symbol}</SelectItem>
                                                        })
                                                    }
                                                </Select>
                                            </div>

                                            <div className={"flex flex-col gap-2 w-full"}>
                                                <Input labelPlacement='inside' placeholder='IMON Community Collection' label={"Collection Name"} size='lg' color='default' name={`collection_name`} {...register('collection_name', { required: true })} />
                                                <Input labelPlacement='inside' placeholder='IMONCC' label={"Collection Symbol"} size='lg' color='default' name={`collection_symbol`} {...register('collection_symbol', { required: true })} />

                                            </div>

                                            <div className={"grid  sm:grid-cols-2 gap-2 grid-cols-1"}>
                                                <div className={"flex flex-col w-full"}>
                                                    <span>NFT Standard</span>
                                                    <div className={"w-full  gap-2"}>
                                                    <ButtonGroup size='sm'>

                                                        <Button variant='solid'  onClick={(e) => {
                                                            setIs1155(false);
                                                            setValue("mint_amount", 1);
                                                        }} color={(!is1155 ? "danger" : "default")}>
                                                            ERC-721
                                                        </Button>
                                                        <Button variant='solid' onClick={(e) => {
                                                            setIs1155(true);
                                                            setValue("mint_amount", 1000)
                                                        }} color={(is1155 ? "danger" : "default")}>
                                                            ERC-1155
                                                        </Button>
                                                        </ButtonGroup>

                                                    </div>
                                                </div>
                                                <div className={"flex flex-col w-full"}>
                                                    <Input  isDisabled={!is1155} type={"number"} min={1} labelPlacement='inside' placeholder='1' label={"Mint Amount"} size='lg' color='default' name={`mint_amount`} {...register('mint_amount', { required: true })} />
                                                </div>
                                            </div>


                                            <div className={"flex flex-col w-full"}>
                                                <Input type={"text"} name={`name`} labelPlacement='inside' placeholder='Enter character name' label={"Character Name"} size='lg' color='default'   {...register('name', { required: true })} />
                                            </div>
                                            <div className={"flex flex-col w-full"}>




                                                <Textarea

                                                    size='lg'
                                                    isMultiline={true}
                                         
                                                    fullWidth={true}
                                                    labelPlacement="inside"

                                                    variant="flat"
                                                    label="Description"
                                                    placeholder={"Join the fully community-driven revolution of decentralized finance on the blockchain with the power of revolutionary technology."}
                                                    name={`description`}
                                                    {...register('description', { required: true })} />
                                            </div>

                                            <div className={"flex flex-col w-full"}>
                                                <Input size='lg' labelPlacement='inside' label="External URL"
                                                    name={`external_url`}
                                                    placeholder={"https://kewl.exchange"}
                                                    {...register('external_url', { required: true })} />
                                            </div>

                                            <div className={"grid  grid-cols- gap-2 sm:grid-cols-1"}>
                                                <div className={"flex flex-col w-full items-start justify-center"}>
                                                    <span>Royalties [Max:0.075]</span>


                                              
                                                    <ButtonGroup size='sm'>

                                                        <Button variant={"solid"} onClick={(e) => {
                                                            e.preventDefault()
                                                            setRoyaltiesRatio(0);
                                                        }} color={(royaltiesRatio == 0 ? "danger" : "default")}>
                                                            NONE
                                                        </Button>
                                                        <Button variant={"solid"} onClick={(e) => {
                                                            e.preventDefault()
                                                            setRoyaltiesRatio(1);
                                                        }} color={(royaltiesRatio == 1 ? "danger" : "default")}>
                                                            25%
                                                        </Button>
                                                        <Button variant={"solid"} onClick={(e) => {
                                                            e.preventDefault()
                                                            setRoyaltiesRatio(2);
                                                        }} color={(royaltiesRatio == 2 ? "danger" : "default")}>
                                                            50%
                                                        </Button>
                                                        <Button variant={"solid"} onClick={(e) => {
                                                            e.preventDefault()
                                                            setRoyaltiesRatio(3);
                                                        }} color={(royaltiesRatio == 3 ? "danger" : "default")}>
                                                            75%
                                                        </Button>
                                                        <Button variant={"solid"} onClick={(e) => {
                                                            e.preventDefault()
                                                            setRoyaltiesRatio(4);
                                                        }} color={(royaltiesRatio == 4 ? "danger" : "default")}>
                                                            100%
                                                        </Button>
                                                        </ButtonGroup>

                                                 
                                                </div>
                                                <div className={"flex flex-col w-full"}>
                                                    <span></span>
                                                    <Input  label={"Royalties Receiver"} labelPlacement='inside' color='default' variant='flat' size='lg'
                                                        type="text"
                                                        name={"royalties_receiver"}
                                                        defaultValue={account}
                                                        {...register('royalties_receiver', { required: true })} />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </AccordionItem>
                                <AccordionItem key="3" aria-label="Accordion 3" subtitle="Please set the characteristics of your NFT" title="Attributes">
                                    <div className={"w-full flex flex-col gap-2 p-2 rounded-lg"}>
                                        <div className={"w-full  flex flex-row justify-between items-center"}>
                                            <span>Attributes</span>
                                            <Button startContent={
                                                <span translate={"no"} className="material-symbols-outlined">
                                                    add
                                                </span>
                                            } color="success" onClick={() => append(
                                                {
                                                    trait_type: "",
                                                    display_type: "string",
                                                    value: "",
                                                    max_value: ""
                                                }
                                            )}>

                                                Append
                                            </Button>
                                        </div>

                                    </div>
                                    <div className='flex flex-col gap-2 p-2'>
                                        <div className={"w-full border border-default  rounded-lg p-2"}>
                                            <span className="text-xs">Providing asset metadata allows applications like OpenSea to pull in rich data for digital assets and easily display them in-app. Digital assets on a given smart contract are typically represented solely by a unique identifier (e.g., the token_id in ERC721), so metadata allows these assets to have additional properties, such as a name, description, and image.</span>
                                        </div>

                                        {fields.map((fieldItem, index) => {
                                            return (
                                                <div className="grid sm:grid-cols-5 grid-cols-1 gap-2 p-2 border items-center justify-center border-default rounded-lg" key={fieldItem.id}>
                                                    <Input name='trait_type' defaultValue={fieldItem.trait_type} size={"lg"} type="text" label="Trait Type"  {...register(`attributes[${fieldItem.id}].trait_type`, { required: true })} />


                                                    <Select
                                                        size='lg'
                                                        label="Display Type"
                                                        placeholder="Please Select"
                                                        {...register(`attributes[${fieldItem.id}].display_type`, { required: true })}
                                                        name={`display_type`}
                                                        defaultSelectedKeys={[fieldItem.display_type]}


                                                    >

                                                        <SelectItem value="string">String</SelectItem>
                                                        <SelectItem value="string">Number</SelectItem>
                                                        <SelectItem value="birthday">Birthday</SelectItem>
                                                        <SelectItem value="boost_percentage">Boost Percentage</SelectItem>
                                                        <SelectItem value="boost_number">Boost Number</SelectItem>
                                                    </Select>



                                                    <Input name='value' size={"lg"} defaultValue={fieldItem.value} type="text" label="Value"   {...register(`attributes[${index}].value`, { required: true })} />


                                                    <Input name='max_value' defaultValue={fieldItem.max_value} size={"lg"} type="number" label="Max Value" {...register(`attributes[${fieldItem.id}].max_value`, { required: fieldItem.display_type == "boost_percentage" })} />


                                                    <Button size="lg" color="warning" onClick={() => remove(index)}>
                                                        Remove
                                                    </Button>


                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionItem>
                            </Accordion>


                        </CardBody>

                        <CardFooter>
                            <div className="w-full flex items-center justify-center">
                                <Button size='lg' color='danger' onClick={(e) => {
                                    e.preventDefault();
                                    handleCreateCollection();
                                }} type="submit">Create NFT</Button>
                            </div>
                        </CardFooter>

                    </Card>



                </form>

            </div>
        </>
    );
}
export const NFT_MARKET_CREATECOLLECTION_TAB = memo(_NFT_MARKET_CREATE_COLLECTION_TAB)

