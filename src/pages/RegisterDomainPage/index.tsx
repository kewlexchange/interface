import IPage from "@/interfaces/page";
import React, { useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { DOMAIN_REGISTER_TAB } from "../../Components/DomainTabs/Register";
import { Card, Tab, Tabs } from "@nextui-org/react";
import { DOMAIN_MANAGE_TAB } from "../../Components/DomainTabs/Manage";
import { DOMAIN_MY_DOMAINS } from "../../Components/DomainTabs/View";

const RegisterDomainPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, chainId, account]);
    return (

        <>
            <div className={"w-full px-2 py-5"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>

                    <Card  className={" flex gap-2 flex-col rounded-xl p-2 w-full"}>

                        <div className="w-full">

                            <Tabs color={"default"} aria-label="Swap Tabs">
                                <Tab key="swap" title="Register">
                                    <DOMAIN_REGISTER_TAB />
                                </Tab>
                                <Tab key="pools" title="My Domains">
                                    <DOMAIN_MY_DOMAINS />

                                </Tab>
                                <Tab key="settings" title="Manage">
                                    <DOMAIN_MANAGE_TAB />
                                </Tab>
                            </Tabs>

                        </div>

                    </Card>
                </div>
            </div>

        </>
    )
}


export default RegisterDomainPage;
