import IPage from "../../interfaces/page";
import React, { useEffect } from "react";


const AirdropPage: React.FunctionComponent<IPage> = props => {

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
            <div className={"container gap-2 mt-[20px] w-2/4 mx-auto sm:w-full mdx:w-2/3 md:w-5/6 md2:w-4/5 2xl:w-3/4 sm:mt-2"}>

                <iframe className={"google-frame transparent-bg rounded-lg"}
                        src="https://docs.google.com/forms/d/e/1FAIpQLSeJuqPTovyWL8sEeOAIlFFjrQ52x0Mc9_s2Be4_zhrqC-h8hQ/viewform"
                        width="100%" height="1000">Loading…
                </iframe>
            </div>
        </>
    )
}


export default AirdropPage;
