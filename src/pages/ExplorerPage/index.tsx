import { Slider, Image, Badge, Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { PairTAB } from "../../Components/ExplorerTabs/PairsTab";
import { useFetchAllTokenList } from "../../state/user/hooks";
import { useWeb3React } from "@web3-react/core";
import { useAppSelector } from "../../state/hooks";
import { PricesTAB } from "../../Components/ExplorerTabs/PricesTab";

const ExplorerPage: React.FunctionComponent<IPage> = props => {
    const [amount, setAmount] = useState(1);
    const { connector, account, provider, chainId } = useWeb3React()

    useFetchAllTokenList(chainId, account)
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [chainId, account]);
    return (

        <>
            <div className={" p-2  w-full"}>
            <Tabs color="danger" aria-label="Options">
                        <Tab key={"prices"} title={"RADAR"}>
                            <PricesTAB tokens={defaultAssets}/>
                        </Tab>
                        <Tab key="kewl" title="KEWL">
                            <PairTAB tokens={defaultAssets} exchange="IMON" />
                        </Tab>
                        <Tab key="kayen" title="KAYEN">
                            <PairTAB tokens={defaultAssets} exchange="JALA" />
                        </Tab>
                        <Tab key="chiliz" title="CHILIZSWAP">
                            <PairTAB tokens={defaultAssets} exchange="CHILIZSWAP" />
                        </Tab>
                        <Tab key="diviswap" title="DIVISWAP">
                            <PairTAB tokens={defaultAssets} exchange="DIVISWAP" />
                        </Tab>
                        <Tab key="all" title="ALL PAIRS">
                            <PairTAB tokens={defaultAssets} exchange="ALL" />
                        </Tab>
                    </Tabs>





            </div>
        </>
    )
}


export default ExplorerPage;
