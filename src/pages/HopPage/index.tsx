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


const HopPage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()
    const { socket } = useSocket();

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, chainId, account]);

 
    return (

        <>
            <div className={"w-full swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5"}>
                    <Card fullWidth   shadow="none"  className='bg-transparent flex gap-2 flex-col w-full'>
                        <REFLECTOR_TAB/>
                     
                   
                    </Card>
                </div>
            </div>
        </>
    )
}


export default HopPage;
