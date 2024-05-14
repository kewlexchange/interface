import React, { useEffect, useState, useRef } from 'react';
import { useWeb3React } from "@web3-react/core";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { Card, User } from '@nextui-org/react';

export const TokenBalances = (props: {account})=> {
    const { connector, account, provider, chainId } = useWeb3React()
    const dispatch = useAppDispatch()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])

    return (
        <div className={"w-full flex gap-2 flex-col"}>
            {
                defaultAssets && defaultAssets.map((tokenItem, index) => {
                    return (

                        <Card key={`tokenItem${index}`} className="flex flex-row hover:shadow gap-2 items-center justify-between rounded-lg cursor-pointer p-2">

                            <User   
                                name={tokenItem.symbol}
                                description={tokenItem.name}
                                avatarProps={{
                                    src:tokenItem.logoURI
                                }}/>
                      
                            <div className="px-6">{tokenItem.balance}</div>
                        </Card>

                    )
                })
            }
        </div>
    );
}
