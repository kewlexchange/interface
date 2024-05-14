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
import {MORPH_TAB} from "../../Components/MetamorphTabs/MorphTab";
import {BURN_TAB} from "../../Components/MetamorphTabs/BurnTab";


const SwapPage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, chainId, account]);


    return (

        <>
            <div className={"w-full px-2 py-5 swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <Card  className={" flex gap-2 flex-col w-full"}>
                        <CardBody>
                        <div className="w-full max-w-full">
                            <Tabs color={"danger"} aria-label="Swap Tabs">
                                <Tab key="swap" title="Swap">
                                    <SWAP_TAB />
                                </Tab>
                                <Tab key="pools" title="Pools">
                                    <POOL_TAB />

                                </Tab>
                                <Tab key="morph" title="Morph">
                                    <div className={"flex flex-col gap-2"}>
                                    <MORPH_TAB />
                                        <div className={"flex flex-col gap-2 p-2 rounded-lg border border-default-100"}>
                                     <span>Demorph</span>
                                    <BURN_TAB/>
                                        </div>
                                    </div>

                                </Tab>
                                <Tab key="settings" title="Settings">
                                    <SETTINGS_TAB />
                                </Tab>
                            </Tabs>
                        </div>
                        </CardBody>
                        <CardFooter>
                            <Button fullWidth color="danger" variant="flat" as={NavLink} to={"/listing"}>Apply for Listing</Button>

                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    )
}


export default SwapPage;
