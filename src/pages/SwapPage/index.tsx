import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tabs, Tab, Card, CardBody, CardFooter, Button, Link } from "@nextui-org/react";
import Identicon from "../../Components/Identicon";
import { Route, Routes, useLocation } from "react-router-dom";
import { SWAP_TAB } from "../../Components/SwapComponents/Swap";
import { POOL_TAB } from "../../Components/SwapComponents/Pools";
import { SETTINGS_TAB } from "../../Components/SwapComponents/Settings";
import { useWeb3React } from "@web3-react/core";
import { MORPH_TAB } from "../../Components/MetamorphTabs/MorphTab";
import { BURN_TAB } from "../../Components/MetamorphTabs/BurnTab";
import { WRAP_TAB } from "../../Components/SwapComponents/Wrap";
import { TRADE_TAB } from "../../Components/SwapComponents/Trade";
import { ARBITRAGE_TAB } from "../../Components/SwapComponents/Arbitrage";
import { useSocket } from "../../hooks/useSocketProvider";
import { generateTxLink } from "../../utils/web3Provider";
import { Ghost, Radar, ReplaceAll, Settings } from "lucide-react";
import { REFLECTOR_TAB } from "@/Components/SwapComponents/Reflector";


const SwapPage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()
    const { socket } = useSocket();

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, chainId, account]);

   
    const TradeHistory = () => {
        const [trade, setTrade] = useState(null)
        const initChatSocket = () => {
            if (!socket) {
                return
            }
            socket.on("trade", (data: any) => {
                //setMessages(messages => [...messages, JSON.parse(data)]);
                const parsedData = JSON.parse(data);
                setTrade(parsedData)
                console.log("data,",parsedData)
    
            });
        }
        useEffect(() => {
            if (socket) {
                initChatSocket()
            }
        }, [socket])

        return <div className="w-full">
            <div className="w-full">Latest Trade Info</div>
            <div className="w-full grid grid-cols-2">
                <span>DEX</span>
                <span>{trade?.DEX}</span>
            </div>
            <div className="w-full grid grid-cols-2">
                <span>Pair</span>
                <span>{trade?.baseTokenSymbol} {trade ? "x" : ""} {trade?.quoteTokenSymbol}</span>
            </div>
            <div className="w-full grid grid-cols-2">
                <span>Input</span>
                <span>{trade?.baseAmount} {trade?.baseTokenSymbol}</span>
            </div>
            <div className="w-full grid grid-cols-2">
                <span>Output</span>
                <span>{trade?.quoteAmount} {trade?.quoteTokenSymbol}</span>
            </div>
            <div className="w-full grid grid-cols-2">
                <span>Price</span>
                <span>{trade ? parseFloat(trade?.price).toFixed(4) : ""} {trade?.baseTokenSymbol}</span>
            </div>
            <div className="w-full grid grid-cols-2">
                <span>Proof</span>
                <span> {trade ? <Button target="_blank" size="sm" href={generateTxLink(trade?.chainId, trade?.txHash)} as={Link} >View on Explorer</Button> : ""}</span>
            </div>
        </div>
    }

    return (

        <>
            <div className={"w-full swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5"}>
                    <Card fullWidth shadow="none" className='bg-transparent flex gap-2 flex-col w-full'>
                        <CardBody>
                            <div className="w-full max-w-full">
                                <Tabs 
                                    disableAnimation
                                    radius="lg" 
                                    fullWidth 
                                    classNames={{
                                        base: "w-full",
                                        tabList: [
                                            "relative",
                                            "bg-white/[0.01] dark:bg-black/[0.01]",
                                            "backdrop-blur-xl",
                                            "border border-violet-500/10",
                                            "p-1",
                                            "rounded-2xl",
                                            "flex",
                                            "gap-1"
                                        ].join(" "),
                                        cursor: "hidden",
                                        tab: [
                                            "flex-1",
                                            "h-9",
                                            "px-4",
                                            "rounded-xl",
                                            "flex items-center justify-center",
                                            "gap-2",
                                            "text-xs font-medium",
                                            "text-violet-600/50 dark:text-violet-400/50",
                                            "group",
                                            "relative",
                                            "overflow-hidden",
                                            "transition-all duration-200",
                                            "data-[selected=true]:bg-violet-500/[0.02] dark:data-[selected=true]:bg-violet-400/[0.02]",
                                            "data-[selected=true]:backdrop-blur-xl",
                                            "data-[selected=true]:text-violet-500 dark:data-[selected=true]:text-violet-400",
                                            "before:absolute",
                                            "before:inset-0",
                                            "before:rounded-xl",
                                            "before:opacity-0",
                                            "before:pointer-events-none",
                                            "before:z-[-1]",
                                            "data-[selected=true]:before:opacity-100",
                                            "before:bg-gradient-to-r",
                                            "before:from-violet-500/0",
                                            "before:via-violet-500/[0.07]",
                                            "before:to-violet-500/0",
                                            "before:transition-opacity",
                                            "data-[selected=true]:before:animate-shimmer",
                                            "before:bg-[length:200%_100%]",
                                            "hover:bg-violet-500/[0.01] dark:hover:bg-violet-400/[0.01]",
                                            "hover:text-violet-500/70"
                                        ].join(" "),
                                        tabContent: "relative z-10",
                                        panel: "pt-4"
                                    }}
                                    aria-label="Swap Tabs"
                                >
                                    <Tab 
                                        key={"trade"} 
                                        title={
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg">
                                                    <Radar className="w-4 h-4" />
                                                </div>
                                                <span>Fusion</span>
                                            </div>
                                        }
                                    >
                                        <TRADE_TAB />
                                    </Tab>

                                    <Tab 
                                        key="swap"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg">
                                                    <ReplaceAll className="w-4 h-4" />
                                                </div>
                                                <span>Swap</span>
                                            </div>
                                        }
                                    >
                                        <SWAP_TAB />
                                    </Tab>

                                    <Tab 
                                        key="pools"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg">
                                                    <span translate="no" className="material-symbols-outlined text-[18px]">waves</span>
                                                </div>
                                                <span>Pools</span>
                                            </div>
                                        }
                                    >
                                        <POOL_TAB />
                                    </Tab>

                                    <Tab 
                                        key="settings"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg">
                                                    <Settings className="w-4 h-4" />
                                                </div>
                                                <span>Config</span>
                                            </div>
                                        }
                                    >
                                        <SETTINGS_TAB />
                                    </Tab>
                                </Tabs>
                            </div>
                        </CardBody>
                        <CardFooter>
                         
                        </CardFooter>
                   
                    </Card>
                </div>
            </div>
        </>
    )
}


export default SwapPage;

<style jsx global>{`
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .animate-shimmer {
    animation: shimmer 2.5s infinite linear;
  }
`}</style>
