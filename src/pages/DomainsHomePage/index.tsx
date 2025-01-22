import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import io from "socket.io-client";
import {useWeb3React} from "@web3-react/core";
import ICON_LOGO from '@/assets/images/platform/domains.svg';
import { useDiamondContract, useDomainContract} from "../../hooks/useContract";
import {BigNumber, ethers} from "ethers";
import { NFT } from "../../Components/NFT";
import { ChainId } from "../../constants/chains";
import { getNativeCurrencyByChainId } from "../../utils";
import { Button } from "@nextui-org/react";

const DomainsHomePage: React.FunctionComponent<IPage> = props => {
    const { chainId,account } = useWeb3React()
    const DOMAINS = useDomainContract(chainId, true)
    const [domainInfo,setDomainInfo] : any = useState(null)
    const [domainContract,setDomainContract] : any = useState("")
    const [tlds,setTDLS] : any = useState(null);
    const [currentTLD,setCurrentTLD] : any = useState(null)

    useEffect(() => {
        document.title = props.title + " - Decentralised naming for wallets, websites, & more";
    }, []);


    const initDefaults = async () => {
        if(!chainId){
            return;
        }
        if(!DOMAINS){
            return;
        }

        const [tldEntries,pricePerYear,domainContract] = await DOMAINS.getTLDS();
        setDomainContract(domainContract);
        setTDLS(tldEntries)
        if(tldEntries.length > 0){
            let symbol = tldEntries[0]
            setCurrentTLD(symbol);
        }
     
      

    }

    const fetchDomains = async () =>{
        const _domainInfo = await DOMAINS.getDomainInfo(currentTLD.name);
        setDomainInfo(_domainInfo);
    }
    useEffect(()=>{
        fetchDomains()
    },[currentTLD])

    const HomeNFT = (props:{tokenId : any}) => {
        return <div className="w-full">
                <NFT canView={true} reloadFunction={null} showMetadata={false} canSell={false} key={`nftItemIndex`} itemType={"ERC-721"} contractAddress={domainContract} tokenId={props.tokenId} />
        </div>
    }

    useEffect(()=>{
        initDefaults()

    },[chainId,account])
    return (

        <>
         
            <div className="container  mx-auto sm:ml-auto flex flex-col gap-2 p-2 items-center justify-center">
            <div className={"rounded-lg mx-auto sm:w-[38%] w-full"}>

                        <section className="w-full p-5 flex flex-col items-center sm:items-center text-center sm:justify-center justify-center overflow-hidden">
                            <img src={ICON_LOGO} className="w-20 h-20"/>
                            <div className="w-full text-2xl sm:text-2xl">Welcome to</div>
                            <div className="w-full text-5xl whitespace-nowrap sm:text-3xl homeshimmer">CHZ <span className={"font-bold"}>DOMAINS</span></div>
                            <div className="sm:w-full text-left sm:text-justify mt-5">Decentralised naming for wallets, websites, & more.</div>
                        
                        </section>

                        <div className="w-full grid grid-cols-3 gap-2 p-2">
                        {
                                                        tlds && tlds.map((domainItem, domainIndex) => {
                                                            return (<Button radius="full" onPress={() => {
                                                                setCurrentTLD(domainItem)

                                                            }} key={`domain${domainIndex}`} className={(currentTLD && currentTLD.name === domainItem.name ? "bg-gradient text-white" : "")}>
                                                                {domainItem.name}
                                                            </Button>)
                                                        })
                                                    }
                        </div>
                        
                   
                        <section className="w-full flex flex-col gap-2 p-3">

                            {

                                
                                    domainInfo && domainInfo.subdomains.slice(-10).reverse().map((domainItem,domainIndex)=>{
                                        return(
                                        <div key={`nftDomain${domainIndex}`} className="border-color border-default border-1  rounded-lg p-2 flex flex-col gap-2">
                                            <span>{domainItem.name}</span>
                                            <span className="text-xs">{BigNumber.from(domainItem.namehash).toHexString()}</span>
                                            <HomeNFT tokenId={BigNumber.from(domainItem.namehash).toString()} />
                                        </div>
                                        )
                                    })

                            }
                
                        

                        </section>

                        <div className="w-full mb-[100px] text-center bg-red-500 p-2 rounded-lg p-2">
                            Disclaimer: The CHZ Domain Services are independently developed by the community and are not officially associated, endorsed, or affiliated with the Chiliz ecosystem or its official entities in any capacity.
                            </div>

    
                        </div>
            </div>

        </>


    )
}


export default DomainsHomePage;
