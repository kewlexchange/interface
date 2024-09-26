import { Slider , Image, Badge} from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";

const TestPage: React.FunctionComponent<IPage> = props => {
    const [amount,setAmount] = useState(1);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
            <div className={"container mt-[20px] w-2/4 mx-auto sm:w-full mdx:w-2/3 md:w-5/6 md2:w-4/5 2xl:w-3/4 sm:mt-2"}>
                <div className="w-full">
                <Slider   
                        onChange={(e)=>{
                            setAmount(e)
                        }}
        size="lg"
        step={1}
        label={"Enter your mint amount"}
        color="default"
        showSteps={true} 
        maxValue={10000} 
        minValue={1} 
        defaultValue={1}
        className="w-full" 
      />
                </div>

                <div className="w-full grid grid-cols-6 gap-2">
                {Array.from({ length: amount }, (_, i) => (
                    <Badge   key={i}  content={i + 1} color="default" placement="top-right">
                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-xl">

                    <Image src={`https://ipfs.io/ipfs/QmfRFsQC4XqYr8kpyM3XnGDVzgiN6LVQaGHRJBV6i6HCdf/${i}.jpg`} />
                    <Image src={`https://cloudflare-ipfs.com/ipfs/QmfRFsQC4XqYr8kpyM3XnGDVzgiN6LVQaGHRJBV6i6HCdf/${i}.jpg`} />
                    <Image src={`https://gateway.moralisipfs.com/ipfs/QmfRFsQC4XqYr8kpyM3XnGDVzgiN6LVQaGHRJBV6i6HCdf/${i}.jpg`} />
                    <Image src={`https://ipfs.moralis.io:2053/ipfs/QmfRFsQC4XqYr8kpyM3XnGDVzgiN6LVQaGHRJBV6i6HCdf/${i}.jpg`} />
                    <Image src={`https://gateway.pinata.cloud/ipfs/QmfRFsQC4XqYr8kpyM3XnGDVzgiN6LVQaGHRJBV6i6HCdf/${i}.jpg`} />
                    <Image src={`https://ipfs.runfission.com/ipfs/QmfRFsQC4XqYr8kpyM3XnGDVzgiN6LVQaGHRJBV6i6HCdf/${i}.jpg`} />

                    </div>
                    </Badge>
                  
                ))}
            </div>

            </div>
        </>
    )
}


export default TestPage;
