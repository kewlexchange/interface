import React, { memo, useEffect, useMemo, useState } from 'react';
import { useWeb3React } from "@web3-react/core";
import { useDomainContract } from "../../hooks/useContract";
import { base64 } from "ethers/lib.esm/utils";
import { deriveUniconAttributeIndices } from "../Unicon/utils";


import Identicon from '../Identicon';
import { NavLink } from 'react-router-dom';
import { Button, Card } from '@nextui-org/react';

const _AccountItem = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [accountInfo, setAccountInfo]: any = useState(null)
    const DOMAINS = useDomainContract(chainId, true)


    const fetchDomainInfo = async () => {
        try{
            const userPrimaryName = await DOMAINS.getDomainByAddress(account);
            setAccountInfo(userPrimaryName)
        }catch(e){
            setAccountInfo(account)
        }
       }

    useEffect(() => {
        fetchDomainInfo();
    }, [account,chainId])
    // @ts-ignore
    return (
        <>
            {account && accountInfo && !accountInfo.isValid ? (
                <div className='flex flex-row gap-2'>
                <span className=" px-1 font-bold text-sm">
                        {account.substring(0, 6) + "..." + account.substring(account.length - 4)}
                    </span>
                    <Identicon account={account} size={22} />
                </div>
            ) : (
                <div className='flex flex-row gap-2'>
                    <span className=" px-1 font-bold text-sm">
                        {accountInfo && accountInfo.name}
                    </span>
                    <Identicon account={account} size={22} />
                </div>
            )}
        </>
    );

}
export const Account = memo(_AccountItem)

