import { Slider, Image, Badge, CardBody, Card, Tabs, Tab, CardFooter, TableRow, TableCell, TableColumn, TableHeader, TableBody, Table, Button, DatePicker, TimeInput } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import {Time} from "@internationalized/date";
import { VESTING_UNLOCK_TAB } from "../../Components/VestingTabs/UnlockTab";
import { VESTING_VESTINGS_TAB } from "../../Components/VestingTabs/Vestings";

const VestingPage: React.FunctionComponent<IPage> = props => {
    const [amount, setAmount] = useState(1);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
     <div className={"w-full px-2 py-5 swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <Card  className={" flex gap-2 flex-col w-full"}>
                        <CardBody>
                        <div className="w-full max-w-full">
                            <Tabs color={"danger"} aria-label="Swap Tabs">
                                <Tab key="vesting" title="Vestings">
                                    <VESTING_VESTINGS_TAB/>
                                </Tab>
                                <Tab key="create" title="Lock Tokens">
                                    <VESTING_UNLOCK_TAB/>
                                </Tab>
                           
                                
                            </Tabs>
                        </div>
                        </CardBody>
                        <CardFooter>

                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    )
}


export default VestingPage;
