import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import Identicon from "../../Components/Identicon";
import { Route, Routes, useLocation } from "react-router-dom";
import { SWAP_TAB } from "../../Components/SwapComponents/Swap";
import { POOL_TAB } from "../../Components/SwapComponents/Pools";
import { SETTINGS_TAB } from "../../Components/SwapComponents/Settings";
import { useWeb3React } from "@web3-react/core";
import {MORPH_TAB} from "../../Components/MetamorphTabs/MorphTab";
import {BURN_TAB} from "../../Components/MetamorphTabs/BurnTab";
import { OLD_POOL_TAB } from "../../Components/SwapComponents/OldPools";


const OldSwapPage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, chainId, account]);


    return (

        <>
            <div className={"w-full px-2 py-5 swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <Card  className={" flex gap-2 flex-col p-2 w-full"}>
                        <div className="w-full max-w-full">
                            <Tabs color={"default"} aria-label="Swap Tabs">
                           
                                <Tab key="pools" title="Pools">
                                    <OLD_POOL_TAB />
                                </Tab>
            
                            </Tabs>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    )
}


export default OldSwapPage;
