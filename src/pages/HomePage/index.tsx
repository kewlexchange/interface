import IPage from "../../interfaces/page";
import React, { useEffect } from "react";



const HomePage: React.FunctionComponent<IPage> = props => {
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);

    return (
        <>
        <div className="absolute left-0 top-0 w-screen h-screen  flex flex-col gap-2 items-center justify-center">
            <div className="w-full ">
            </div>
            </div>
            </>   
     
    )
}


export default HomePage;
