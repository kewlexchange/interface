import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tabs, Tab, Card, CardBody, CardFooter, Button } from "@nextui-org/react";
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


const SwapPage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, chainId, account]);


    return (

        <>
            <div className={"w-full swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5"}>
                    <Card fullWidth  shadow="sm" className={" flex gap-2 flex-col w-full"}>
                        <CardBody>
                            <div className="w-full max-w-full">
                                <Tabs fullWidth classNames={{
                                    tabContent:'h-full',
                                    tab:"h-[50px] "
                                }} variant="solid" color={"default"} aria-label="Swap Tabs">


                                 <Tab key={"trade"} title={
                                        <div className="w-full flex flex-col items-center justify-center">
                                        <span translate="no" className="material-symbols-outlined">rocket_launch</span>
                                        <span className="text-xs">Fushion</span>
                                    </div>  
                                    }>
                                        <TRADE_TAB />
                                </Tab>{/*
                                    
                                     <Tab key={"arbitrage"} title={"Arbitrage"}>
                                    <ARBITRAGE_TAB/>
                                </Tab>  */}
                                 
                                    <Tab key="swap" title={
                                          <div className="w-full flex flex-col items-center justify-center">
                                          <span translate="no" className="material-symbols-outlined">swap_horizontal_circle</span>
                                          <span className="text-xs">Swap</span>
                                      </div>
                                    }>
                                        <SWAP_TAB />
                                    </Tab>

                                    <Tab key="pools" title=
                                    {
                                        <div className="w-full flex flex-col items-center justify-center">
                                            <span translate="no" className="material-symbols-outlined">waves</span>
                                            <span className="text-xs">Pools</span>
                                        </div>
                                    }>
                                        <POOL_TAB />
                                    </Tab>

                                    <Tab key={"wrap"} title={
                                        <div className="w-full flex flex-col items-center justify-center">
                                            <span translate="no" className="material-symbols-outlined">handyman</span>
                                            <span className="text-xs">Tools</span>
                                        </div>
                                    }>
                                        <Tabs>
                                            <Tab title="WRAP">
                                                <WRAP_TAB />
                                            </Tab>
                                            <Tab title="MORPH">
                                                <div className={"flex flex-col gap-2"}>
                                                    <MORPH_TAB />
                                                    <div className={"flex flex-col gap-2 p-2 rounded-lg border border-default-100"}>
                                                        <span>Demorph</span>
                                                        <BURN_TAB />
                                                    </div>
                                                </div>
                                            </Tab>

                                        </Tabs>
                                    </Tab>
                                    <Tab key="settings" title={
                                        <div className="w-full flex flex-col items-center justify-center">
                                            <span translate="no" className="material-symbols-outlined">
                                                settings
                                            </span>
                                            <span className="text-xs">Config</span>
                                        </div>
                                    }>
                                        <SETTINGS_TAB />
                                    </Tab>
                                </Tabs>
                            </div>
                        </CardBody>
                   
                    </Card>
                </div>
            </div>
        </>
    )
}


export default SwapPage;
