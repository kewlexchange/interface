import { Slider, Image, Badge, Tabs, Card, Tab, CardBody, CardHeader, CardFooter } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { title } from "../../Components/Primitives";

const PlatformEarningsPage: React.FunctionComponent<IPage> = props => {
    const [amount, setAmount] = useState(1);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>

            <div className={"min-w-xl max-w-2xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5 swap"}>
                <Card shadow="sm" className={" flex gap-2 flex-col rounded-xl p-2 w-full"}>
                    <CardHeader>
                        <h1 className={title({ size: "sm", "color": "red" })}>KEWL Platform Revenues</h1>

                    </CardHeader>

                    <CardBody>
                        <div className="w-full max-w-full">

                            <Tabs color={"default"} aria-label="Platform Earnings">
                                <Tab key="swap" title="Swap">
                                    <p>Under Development</p>
                                </Tab>
                                <Tab key="domain" title="Domain">
                                    <p>Under Development</p>
                                </Tab>
                                <Tab key="bridge" title="Bridge">
                                    <p>Under Development</p>
                                </Tab>
                                <Tab key="rewards" title="Reward Pools">
                                    <p>Under Development</p>
                                </Tab>
                                <Tab key="nft" title="NFTMarket">
                                    <p>Under Development</p>
                                </Tab>
                                <Tab key="launchpad" title="Launchpad">
                                    <p>Under Development</p>
                                </Tab>
                            </Tabs>
                        </div>
                    </CardBody>

                    <CardFooter className={"flex flex-col gap-2 p-2 w-full"}>
                        <p className="bg-danger-500/10 text-danger-500 rounded-lg p-2 w-full">30% of IMON revenues will be distributed to our users.</p>
                        <p className="bg-danger-500/10 text-danger-500 rounded-lg p-2 w-full">70% of IMON revenues will be allocated for developments.</p>
                    </CardFooter>



                </Card>
            </div>
        </>
    )
}


export default PlatformEarningsPage;
