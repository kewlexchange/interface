import { Card, CardHeader } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect } from "react";
import { TRADE_TAB } from "@/Components/SwapComponents/Trade";
import { LandingBG } from "@/Components/Landing";



const HomePage: React.FunctionComponent<IPage> = props => {
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);

    return (
        <div className="relative">
            <div className="absolute left-0 top-0 w-full h-full  flex flex-col gap-2 items-center justify-center">
                <div className="w-full ">
                </div>
                <div className="absolute top-[10px] min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 flex flex-col  items-center justify-center">
                <TRADE_TAB/>
            </div>
            </div>
       

            </div>   
     
    )
}


export default HomePage;
