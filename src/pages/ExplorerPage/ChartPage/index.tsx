import { Slider, Image, Badge, Card, CardBody, Tab, Tabs, Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { useAppSelector } from "../../../state/hooks";
import { ChartView } from "../../../Components/ChartView";
import { useFetchAllTokenList } from "../../../state/user/hooks";
import IPage from "../../../interfaces/page";
import { NavLink, useParams } from "react-router-dom";
import { isAddress } from "@ethersproject/address";
import { TransactionsTAB } from "../../../Components/PairExplorerTabs/Transactions";

const ChartPage: React.FunctionComponent<IPage> = props => {
    const [amount, setAmount] = useState(1);
    const { connector, account, provider, chainId } = useWeb3React()
    const [pairAddress, setPairAddress]: any = useState(null)
    const { pair } = useParams();

    useFetchAllTokenList(chainId, account)
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";



    }, []);

    useEffect(() => {
        if (isAddress(pair)) {
            setPairAddress(pair)
            console.log(pair)
        }
    }, [pair,chainId,account])


    return (

        <>
            <div className={" p-2 w-full flex flex-col gap-2 items-start justify-start"}>
                <Breadcrumbs radius={"lg"} size="lg" variant="solid">
                    <BreadcrumbItem as={NavLink} href="/explorer">Pair Explorer</BreadcrumbItem>
                    <BreadcrumbItem>{pair ? pair : ""}</BreadcrumbItem>

                </Breadcrumbs>
                <Card className="w-full p-2 flex flex-col gap-2">

                  
                    <Tabs color={"default"} aria-label="Options">
                        <Tab key="chart" title="Chart">
                        
                                {
                        pairAddress && <ChartView pair={pairAddress} />
                    }
                           
                        </Tab>
                        <Tab key="transactions" title="Transactions">
                        <TransactionsTAB pair={pairAddress}/>                                 

                        </Tab>
                
                    </Tabs>

                </Card>





            </div>
        </>
    )
}


export default ChartPage;
