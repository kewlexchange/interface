import { Slider, Image, Badge, Spinner } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import TokenInfoComponent from "../../Components/TokenInfoComponent";

const TokenInfo: React.FunctionComponent<IPage> = props => {


    return (
        <>
            <div className={"w-full px-2 py-5"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <TokenInfoComponent/>
                </div>
            </div>


        </>
    )
}


export default TokenInfo;
