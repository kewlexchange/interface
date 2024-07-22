import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector } from '../../state/hooks';
import { fetchAllTokenList } from '../../state/user/hooks';
import { useWeb3React } from '@web3-react/core';

export const LandingBG = ()=> {
    const { connector, account, provider, chainId } = useWeb3React()
    const [filteredList,setFilteredList]  : any = useState(null)
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    fetchAllTokenList(chainId, account)

    useEffect(()=>{
        let _filteredList = defaultAssets && defaultAssets.slice(0,10)
        console.log(_filteredList)
        setFilteredList(_filteredList);
    },[defaultAssets])

     

    return (
        <>
      <div className="landing-wrapper fixed">
                { filteredList && filteredList.map((item,i) =>(
                <div key={`circle${i}`} className="circle-container">
                    <div className="circle">
                        <img src={item.logoURI} />
                    </div>
                </div>))}

                <div className="hero">
                    <div className="bg-balls">
                    { filteredList && filteredList.map((item,i) =>(

                        <img className='rounded-full' src={item.logoURI} />
                        ))}
                    </div>

                </div>

            </div>
        </>

    );
}
