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
import { FARM_TAB } from "../../Components/StakeTabs/Farm";
import { DAO_TAB } from "../../Components/StakeTabs/DAO";
import { CREATE_STAKE_POOL_TAB } from "../../Components/EarnTabs/Create";
import { STAKE_POOLS_TAB } from "../../Components/EarnTabs/Stake";
import { EARN_TAB } from "../../Components/EarnTabs/Earn";


const StakePage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, account, chainId]);


    return (

        <>
            <div className={"w-full px-2 py-5 swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>

                    <Card className={" flex gap-2 flex-col rounded-xl p-2 w-full"}>

                        <div className="w-full max-w-full">

                            <Tabs color={"default"} aria-label="Stake Tabs">
                                <Tab  key="farm" title="Farming">
                                <FARM_TAB /> 
                               
                                </Tab>
                                <Tab key="unstake" title="Unstake">
                                <UNSTAKE_TAB/>
                                </Tab>
                                <Tab key="trade" title="Trading Rewards">
                                    <EARN_TAB/>
                                </Tab>

                            </Tabs>

                        </div>
                    </Card>

                </div>
            </div>

        </>
    )
}


export default StakePage;
