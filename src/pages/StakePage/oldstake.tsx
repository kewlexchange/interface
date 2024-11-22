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
import { UNSTAKE_ARBITRUM_TAB } from "../../Components/StakeTabs/UnstakeArbitrum";


const OldStakePage: React.FunctionComponent<IPage> = props => {
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

                            <Tabs color={"default"} aria-label="Swap Tabs">
                                <Tab key="farm" title="Farm">
                                     <FARM_TAB /> 
                                </Tab>
                          
                                <Tab key="boost" title="Boost">
                                     <DAO_TAB/> 
                                </Tab>
                               
                                <Tab key="unstake" title="Claim v2">
                                <p>Under Development</p>
                                </Tab>
                                <Tab key="unstake_legacy" title="Claim v1">
                                    <div className="rounded-lg p-2 w-full my-2 text-center bg-warning-500/10 text-warning-500">
                                        This pool have been deprecated as we're moving them to our V2 pool. Your KWL rewards will be distributed via airdrop.
                                    </div>
                                    <UNSTAKE_TAB />
                                </Tab>
                                <Tab key="unstake_legacy_arbitrum" title="Claim Arbitrum">
                                    <div className="rounded-lg p-2 w-full my-2 text-center bg-warning-500/10 text-warning-500">
                                        This pool have been deprecated as we're moving them to our V2 pool. Your KWL rewards will be distributed via airdrop.
                                    </div>
                                    <UNSTAKE_ARBITRUM_TAB />
                                </Tab>
                            </Tabs>

                        </div>
                    </Card>

                </div>
            </div>

        </>
    )
}


export default OldStakePage;
