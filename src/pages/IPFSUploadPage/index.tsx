import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { ethers } from "ethers";
import useFilePreview from "../../hooks/useFilePreview";
import { useWeb3React } from "@web3-react/core";
import {
    useDiamondContract,
    useNFT1155Contract,
    useNFT721Contract,
    useStandardNFT721Contract
} from "../../hooks/useContract";
import {convertToBase64,utf8ToBase64,uriToHttp,convertURLToIPFS} from "../../utils/index"
import useModal, {ModalError, ModalInfo, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import Moralis from "moralis";
import {EvmChain} from "@moralisweb3/common-evm-utils";
import { Button, Card } from "@nextui-org/react";

const IPFSUploadPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId,true);
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const { state: isInfoShowing, toggle: toggleInfo } = useModal()

    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [statusText,setStatusText] = useState("Waiting for confirmation...")

    const [userCollections,setUserCollections] = useState([])
    const [is1155, setIs1155] = useState(false)
    const [royaltiesRatio, setRoyaltiesRatio] = useState(0)
    const { register, control, unregister, setValue, watch, handleSubmit,getValues,formState } = useForm();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "attributes"
    });
    const selectedFile = watch('file');
    const [filePreview] = useFilePreview(selectedFile);

    const [formValues,setFormValues] = useState(null)

    const selectedCollectionInfo = watch("collection", ethers.constants.AddressZero);
    const [nextTokenId,setNextTokenId] = useState(0);

    useEffect(()=>{
        const selectedCollectionIndex = userCollections.findIndex(tokenItem=> tokenItem.collection === selectedCollectionInfo);
        let _name = "";
        let _symbol = "";
        


        if(selectedCollectionIndex > -1){
            _name = userCollections[selectedCollectionIndex].name;
            _symbol = userCollections[selectedCollectionIndex].symbol;
            setNextTokenId(userCollections[selectedCollectionIndex].nextTokenId);

            if(userCollections[selectedCollectionIndex].assetType == 2){
                setIs1155(false);
                setValue("mint_amount",1);
            }else if(userCollections[selectedCollectionIndex].assetType == 3){
                setIs1155(true);
                setValue("mint_amount",1000);
            }
            
        }

        setValue("collection_name",_name);
        setValue("collection_symbol",_symbol);
        setValue("royalties_receiver",account)



    },[selectedCollectionInfo])

    const initMoralis = async() => {
        await Moralis.start({
            apiKey: "6DKLfH7o0otqHcAM94VuQQLU5WfJEYZK5VfbibFwYB7EMs5qX89Pb3LA61dwQfmV",
        });
        //Gn0fMLNMj5Vszyr85kz5ypRR7bZcnzzzmHWJcx84TCy9zAiMLm8xfCCevxdNpZHU
        console.log("Moralis Initialized")
    }
    useEffect(()=>{
        initMoralis();
    },[])

    const initDefaults = async () => {
        if(!account){return;}
        try{
            const _userCollections = await IMONDIAMOND.getUserCollections(account);
            setUserCollections(_userCollections);
        }catch(ex){

        }
   
        setValue("royalties_receiver",account)

        if( ["0xd37af52c1d214027582EAC330AB9854D9F62f8cB"].includes(account)){
        let description = `Ersan Yakıt, born on December 5th, 1989, is a blockchain developer who has a passion for colors. Known for his creative mind and love for technology, Ersan is constantly pushing boundaries and bringing unique projects to life in the world of computers.\n\n
        Ersan's interest in technology started during his childhood and gradually turned into a passion. He dedicated himself to continuous learning and focused on blockchain technology and cryptocurrencies. With his knowledge and experience in the field, Ersan showcases his ability to generate innovative solutions.\n\n
        Ersan has contributed to numerous projects in the blockchain world and has successfully worked on different platforms. He tirelessly strives to optimize systems, ensure security, and enhance user experiences.\n\n 
        However, Ersan's interests go beyond the technological realm. His affinity for colors adds an artistic vision to his work. By infusing warmth and vibrancy into the often cold world of technology, he manages to bring a unique aesthetic and creativity to his projects.\n\n
        Ersan Yakıt is determined to achieve even greater success by utilizing his knowledge and skills in the blockchain domain. He aims to explore the depths of the technology world while leaving a mark in a colorful and vibrant universe.\n\n
        When Ersan's story combines his passion for technology, creativity, and connection with colors, it forms a biography that pushes boundaries and leaves a remarkable impact.`
        
        setValue("description",description)
        setValue("collection_name","IMON DEVELOPERS")
        setValue("collection_symbol","IMONDEV")
        setValue("name","ERSAN YAKIT")
        setValue("external_url","https://kewl.exchange")
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
    

        }else{
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

    const uploadFile = async (index, fileData,extension) => {
        const abi = [{
            "path": `${(index).toString()}.${extension}`,
            "content": fileData
        }];
        const response = await Moralis.EvmApi.ipfs.uploadFolder({abi});
        return response.toJSON();
    }
    

    const  handleCreateCollection = async () =>{
        const metadataValues = getValues();
        delete metadataValues?.file;
        delete metadataValues?.collection;

        let hasError = false;
        let errorMessage = ""
        if(metadataValues?.collection_name === ""){
            hasError = true
            errorMessage = "Collection Name cannot be empty!"
        } else if(metadataValues?.collection_symbol === ""){
            hasError = true
            errorMessage = "Collection Symbol cannot be empty!"
        } else if(metadataValues?.description === ""){
            hasError = true
            errorMessage = "Collection Description cannot be empty!"
        } else if(metadataValues?.name === ""){
            hasError = true
            errorMessage = "Character Name cannot be empty!"
        } else if(metadataValues?.external_url === ""){
            hasError = true
            errorMessage = "External URL cannot be empty!"
        }


        let metadataList = [];
        if(fields.length > 0){
            fields.map((item,value)=>{
                if(item?.trait_type != ""){                
                    metadataList.push( {
                        trait_type: item?.trait_type,
                        display_type: item?.display_type,
                        value: item?.value,
                        max_value: item?.max_value
                    })
                }
            })
        }
        metadataValues.attributes = metadataList;
        
        if(hasError){
            setTransaction({ hash: '', summary: '', error:{message:errorMessage} });
            toggleError();
            return;
        }
    

        if(selectedFile.length === 0){
            setTransaction({ hash: '', summary: '', error:{message:"Please select image!"} });
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
        const uploadedImage = await uploadFile(nextTokenId,base64WithoutPrefix,fileExtension)
        if(uploadedImage.length === 0){
            setTransaction({ hash: '', summary: '', error:{message:"Upload failed!"} });
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

        const uploadMetadataResponse = await uploadFile(nextTokenId,encodedContent,"json")
        if(uploadMetadataResponse.length === 0){
            setTransaction({ hash: '', summary: '', error:{message:"Metadata upload failed!"} });
            toggleError();
            toggleLoading();
            return;
        }
        const metadataPath = convertURLToIPFS(uploadMetadataResponse[0].path);        
        setStatusText("Metadata has been uploaded successfuly.");

        toggleLoading();
        setTransaction({ hash: '', summary: '', error:{message:`IPFS Hash : ${metadataPath}`} });
        toggleInfo();




    }

    useEffect(()=>{
        initDefaults()
    },[chainId,account])


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
            <ModalLoading  text={statusText} isClosable={true} hide={toggleLoading} isShowing={isShowLoading}/>
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess}/>
            <ModalInfo
                isShowing={isInfoShowing}
                hide={toggleInfo}
                error={transaction.error}
            />
            <div className={"container gap-2 mt-[20px] w-2/4 mx-auto sm:w-full mdx:w-2/3 md:w-5/6 md2:w-4/5 2xl:w-3/4 sm:mt-2"}>

                <form className={"flex flex-col gap-2 p-2"} onSubmit={handleSubmit((obj) => {
                    console.log("Submit even pressed", obj);
                })}>
                    <>
                        <Card className={"w-full rounded-lg flex flex-col p-2 gap-2"}>
                            <Card className={"w-full grid sm:grid-cols-2 gap-2 grid-cols-1"}>
                                <Card className={"w-full min-h-[60px] rounded-lg p-2 relative items-start justify-start flex flex-col"}>
                                    <input className={"absolute rounded-lg"} type="file" accept="image/jpeg, image/png, image/jpg, image/webp" name="image"  {...register('file')} />
                                    {filePreview && <img src={filePreview} className={"w-full h-full max-h-[600px] object-cover rounded-lg"} alt="Intelligent Monsters" />}

                                </Card>
                                <Card className={"w-full flex flex-col gap-2 p-2 rounded-lg"}>
                                    <div className={"flex flex-col w-full"}>
                                        <span>Collection</span>
                                        <select 
                                            className="rounded-lg p-2"
                                            {...register('collection')}
                                            name={"collection"}
                                        >
                                            <option value={ethers.constants.AddressZero}>Create New Collection</option>
                                            {
                                                userCollections.length > 0 && userCollections.map((collectionItem,collectionIndex)=>{
                                                    return <option key={`userCollection${collectionIndex}`} value={collectionItem.collection}>{collectionItem.name} - {collectionItem.symbol}</option>  
                                                })
                                            }
                                        </select>
                                    </div>

                                    <div className={"flex flex-col w-full"}>
                                        <span>Collection Name</span>
                                        <input className={"rounded-lg p-2"}
                                            name={`collection_name`}
                                            placeholder={"KEWL Collection"}
                                            {...register('collection_name', { required: true })} />
                                    </div>
                                    <div className={"flex flex-col w-full"}>
                                        <span>Collection Symbol</span>
                                        <input className={"rounded-lg p-2"}
                                            name={`collection_symbol`}
                                            placeholder={"KEWL"}
                                            {...register('collection_symbol', { required: true })} />
                                    </div>
                                    <div className={"grid  sm:grid-cols-2 gap-2 grid-cols-1"}>
                                        <div className={"flex flex-col w-full"}>
                                            <span>NFT Standard</span>
                                            <div className={"w-full grid grid-cols-2 gap-2"}>
                                                <button onPress={(e) => {
                                                    e.preventDefault()
                                                    setIs1155(false);
                                                    setValue("mint_amount", 1);
                                                }} className={(!is1155 ? "bg-white/30" : "") + " rounded-lg p-2 hover:bg-white/30"}>
                                                    ERC-721
                                                </button>
                                                <button onPress={(e) => {
                                                    e.preventDefault()
                                                    setIs1155(true);
                                                    setValue("mint_amount", 1000)
                                                }} className={(is1155 ? "bg-white/30" : "") + " rounded-lg p-2 hover:bg-white/30"}>
                                                    ERC-1155
                                                </button>

                                            </div>
                                        </div>
                                        <div className={"flex flex-col w-full"}>
                                            <span>Mint Amount</span>
                                            <input readOnly={!is1155} className={"rounded-lg p-2"}
                                                type={"number"}
                                                min={1}
                                                name={`mint_amount`}
                                                defaultValue={1}
                                                {...register('mint_amount', { required: true })} />
                                        </div>
                                    </div>


                                    <div className={"flex flex-col w-full"}>
                                        <span>Name</span>
                                        <input className={"rounded-lg p-2"}
                                            placeholder={"Character Name"}
                                            name={`name`}
                                            {...register('name', { required: true })} />
                                    </div>
                                    <div className={"flex flex-col w-full"}>
                                        <span>Description</span>
                                        <textarea className={"rounded-lg p-2"}
                                            placeholder={"Join the fully community-driven revolution of decentralized finance on the blockchain with the power of revolutionary technology."}
                                            name={`description`}
                                            {...register('description', { required: true })} />
                                    </div>

                                    <div className={"flex flex-col w-full"}>
                                        <span>External URL</span>
                                        <input className={"rounded-lg p-2"}
                                            name={`external_url`}
                                            placeholder={"https://kewl.exchange"}
                                            {...register('external_url', { required: true })} />
                                    </div>

                                    <div className={"grid  sm:grid-cols-1 gap-2 grid-cols-1"}>
                                        <div className={"flex flex-col w-full"}>
                                            <span>Royalties [Max:0.075]</span>
                                            <div className={"w-full grid grid-cols-5 gap-2"}>
                                                <button onPress={(e) => {
                                                    e.preventDefault()
                                                    setRoyaltiesRatio(0);
                                                }} className={(royaltiesRatio == 0 ? "bg-white/30" : "") + "  rounded-lg p-2 hover:bg-white/30"}>
                                                    NONE
                                                </button>
                                                <button onPress={(e) => {
                                                    e.preventDefault()
                                                    setRoyaltiesRatio(1);
                                                }} className={(royaltiesRatio == 1 ? "bg-white/30" : "") + "  rounded-lg p-2 hover:bg-white/30"}>
                                                    25%
                                                </button>
                                                <button onPress={(e) => {
                                                    e.preventDefault()
                                                    setRoyaltiesRatio(2);
                                                }} className={(royaltiesRatio == 2 ? "bg-white/30" : "") + "   rounded-lg p-2 hover:bg-white/30"}>
                                                    50%
                                                </button>
                                                <button onPress={(e) => {
                                                    e.preventDefault()
                                                    setRoyaltiesRatio(3);
                                                }} className={(royaltiesRatio == 3 ? "bg-white/30" : "") + "  rounded-lg p-2 hover:bg-white/30"}>
                                                    75%
                                                </button>
                                                <button onPress={(e) => {
                                                    e.preventDefault()
                                                    setRoyaltiesRatio(4);
                                                }} className={(royaltiesRatio == 4 ? "bg-white/30" : "") + "  rounded-lg p-2 hover:bg-white/30"}>
                                                    100%
                                                </button>
                                            </div>
                                        </div>
                                        <div className={"flex flex-col w-full"}>
                                            <span>Royalties Receiver</span>
                                            <input className={"rounded-lg p-2"}
                                                type="text"
                                                name={"royalties_receiver"}
                                                defaultValue={account}
                                                {...register('royalties_receiver', { required: true })} />
                                        </div>
                                    </div>

                                </Card>
                            </Card>
                            <Card className={"w-full flex flex-col gap-2 p-2 rounded-lg"}>
                                <div className={"w-full  flex flex-row justify-between items-center"}>
                                    <span>Attributes</span>
                                    <Button startContent={
                                        <span translate={"no"} className="material-symbols-outlined">
                                        add
                                    </span>
                                    } color="success"  onPress={() => append(
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
                                <Card className={"w-full rounded-lg p-2"}>
                                    <span className="text-xs">Providing asset metadata allows applications like OpenSea to pull in rich data for digital assets and easily display them in-app. Digital assets on a given smart contract are typically represented solely by a unique identifier (e.g., the token_id in ERC721), so metadata allows these assets to have additional properties, such as a name, description, and image.</span>
                                </Card>
                            </Card>
                            {fields.map((fieldItem, index) => {
                                return (
                                    <div className="grid sm:grid-cols-5 grid-cols-1 gap-2 p-2" key={fieldItem.id}>
                                        <div className="flex flex-col gap-2 rounded-lg  p-2">
                                            <span>Trait Type</span>
                                            <input className={"rounded-lg p-2"}
                                                name={`trait_type`}
                                                defaultValue={fieldItem.trait_type}
                                                {...register(`attributes[${fieldItem.id}].trait_type`, { required: true })} />
                                        </div>
                                        <div className="flex flex-col gap-2 rounded-lg p-2">
                                            <span>Display Type</span>
                                            <select
                                                className="rounded-lg p-2"
                                                {...register(`attributes[${fieldItem.id}].display_type`, { required: true })}
                                                name={`display_type`}
                                                defaultValue={fieldItem.display_type}>
                                                <option value="string">String</option>
                                                <option value="string">Number</option>
                                                <option value="birthday">Birthday</option>
                                                <option value="boost_percentage">Boost Percentage</option>
                                                <option value="boost_number">Boost Number</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2 rounded-lg  p-2">
                                            <span>Value</span>
                                            <input
                                                className="rounded-lg p-2"
                                                {...register(`attributes[${index}].value`, { required: true })}
                                                type="string"
                                                name={`value`}
                                                defaultValue={fieldItem.value}
                                                placeholder="Value"
                                            />
                                        </div>
                                        <div className={"flex flex-col gap-2 rounded-lg p-2"}>
                                            <div className={"w-full flex flex-col gap-2"}>
                                                <span>Max Value</span>
                                                <input
                                                    className="rounded-lg p-2"
                                                    {...register(`attributes[${fieldItem.id}].max_value`, { required: fieldItem.display_type == "boost_percentage" })}
                                                    type="number"
                                                    name={`max_value`}
                                                    defaultValue={fieldItem.max_value}
                                                    placeholder="Max Value"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 rounded-lg p-2">
                                            <span>Remove</span>
                                            <Button size="md" color="default" onPress={() => remove(index)}>
                                                Remove
                                            </Button>
                                        </div>

                                    </div>
                                );
                            })}

                        </Card>
                    </>

                    <div className="w-full flex items-center justify-center">
                        <button onPress={ (e)=>{
                            e.preventDefault();      
                            handleCreateCollection();   
                        }} className="btn btn-primary" type="submit">Upload to IPFS</button>
                    </div>
                </form>

            </div>
        </>
    )
}


export default IPFSUploadPage;

