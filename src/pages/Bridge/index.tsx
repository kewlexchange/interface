import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import Identicon from "../../Components/Identicon";
import { Route, Routes, useLocation } from "react-router-dom";
import { SWAP_TAB } from "../../Components/SwapComponents/Swap";
import { POOL_TAB } from "../../Components/SwapComponents/Pools";
import { SETTINGS_TAB } from "../../Components/SwapComponents/Settings";
import { STAKE_TAB } from "../../Components/StakeTabs/Stake";
import { UNSTAKE_TAB } from "../../Components/StakeTabs/Unstake";
import { useWeb3React } from "@web3-react/core";
import { BRIDGE_TAB } from "../../Components/BridgeTabs/Bridge";
import { BRIDGE_STATUS_TAB } from "../../Components/BridgeTabs/Status";


const BridgePage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, account, chainId]);


    return (

        <>



<div className={"w-full px-2 py-5 swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>



                    <Card shadow="sm" className={" flex gap-2 flex-col rounded-xl p-2 w-full"}>

                        <div className="w-full max-w-full">

                            <Tabs color={"default"} aria-label="Bridge Page">

                                <Tab key="bridge" title="Bridge">
                                    <BRIDGE_TAB/>
                           
                                </Tab>
                                <Tab key="status" title="Status">
                                    <BRIDGE_STATUS_TAB/>
                           
                                </Tab>

                                
                               
                            </Tabs>

                        </div>
                    </Card>

    
            </div>
            </div>
        </>
    )
}


export default BridgePage;
