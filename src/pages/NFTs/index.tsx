import IPage from "../../interfaces/page";
import React, { useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { Button, Card, Link, Image,Tabs, Tab } from "@nextui-org/react";
import { NFT_MARKET_COLLECTION_TAB } from "../../Components/NFTMarketTabs/Collections";
import { NFT_MARKET_LEADERBOARD_TAB } from "../../Components/NFTMarketTabs/Leaderboard";

const NFTs: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, chainId, account]);
    return (

        <>
     <div className={"w-full px-2 py-5 swap"}>
     <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                    <div className="flex flex-col items-center justify-center px-4 pt-16 text-center lg:items-start lg:py-24 lg:text-left">
                        <h1 className="text-4xl font-bold tracking-tight lg:text-7xl lg:leading-[1.2em]">Discover exclusive NFTs on KEWL NFT Marketplace.</h1>
                        <span className="mt-6 text-zinc-300 lg:max-w-lg lg:text-xl lg:leading-8">Mint and trade NFTs on the fastest community-owned Chiliz chain, secured and governed by <strong>$KWL</strong>.</span>
                    </div>
                    <div className="my-20 flex items-center justify-center p-10 lg:my-0 lg:justify-end lg:px-0">
                        <Image isZoomed isBlurred shadow={"lg"} src={"https://ipfs.kewl.exchange/ipfs/QmTDz8e4g4XtaH18y482P7YwE4kJ6hko6s8JZBvYwtKGEX/11000000000000000000.png"} />

                    </div>
                </div>
            </div>

            <div className="mx-auto w-full sm:max-w-6xl">

                <Card className={" flex gap-2 flex-col p-2 w-full"}>
                    <div className="w-full max-w-full">
                        <Tabs color={"default"} aria-label="NFT Market Tabs">
                            <Tab key="collections" title="Collections">
                                <NFT_MARKET_COLLECTION_TAB/>
                            </Tab>
                            <Tab key="leaderboard" title="Leaderboard">
                                <NFT_MARKET_LEADERBOARD_TAB/>
                            </Tab>
                        </Tabs>
                    </div>
                </Card>


            </div>


        </>
    )
}


export default NFTs;
