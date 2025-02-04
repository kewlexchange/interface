import React, { useEffect, useState, useRef } from 'react';
import { useWeb3React } from "@web3-react/core";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { Card, User } from '@nextui-org/react';
import { motion } from 'framer-motion';

export const TokenBalances = (props: {account})=> {
    const { connector, account, provider, chainId } = useWeb3React()
    const dispatch = useAppDispatch()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])

    return (
        <div className="w-full flex gap-3 flex-col p-2">
            {
                defaultAssets && defaultAssets.map((tokenItem, index) => {
                    return (
                        <motion.div
                            key={`token${index}`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="group relative backdrop-blur-xl rounded-2xl overflow-hidden p-4
                                bg-gradient-to-br from-violet-950/40 to-violet-900/40
                                border border-violet-700/20
                                transition-all duration-300 ease-out
                                cursor-pointer hover:shadow-lg hover:shadow-purple-500/20
                                hover:border-violet-600/30"
                        >
                            {/* Glass effect overlay */}
                            <div className="
                                absolute inset-0 
                                bg-gradient-to-br from-violet-300/5 via-violet-500/5 to-violet-900/5
                                opacity-0 group-hover:opacity-100 
                                transition-opacity duration-500 ease-in-out
                            " />
                            
                            <div className="flex items-center justify-between gap-4">
                                <User   
                                    name={tokenItem.symbol}
                                    description={tokenItem.name}
                                    avatarProps={{
                                        src: tokenItem.logoURI,
                                        className: "ring-2 ring-violet-500/20 shadow-lg shadow-violet-950/50  transform group-hover:scale-105 transition-all duration-300 ease-out  p-0.5 bg-gradient-to-br from-violet-400/20 to-violet-800/20"
                                    }}
                                    classNames={{
                                        name: "text-violet-50 font-bold text-base tracking-wide group-hover:text-white transition-colors duration-300",
                                        description: "text-violet-300/50 text-xs font-medium"
                                    }}
                                />
                          
                                <div className="
                                    px-4 py-2
                                    text-base font-medium
                                    bg-violet-800/30
                                    border border-violet-700/20
                                    rounded-xl
                                    text-violet-100
                                    transition-all duration-300
                                    group-hover:bg-violet-700/30
                                    group-hover:text-white
                                    min-w-[120px]
                                    text-center
                                    backdrop-blur-sm
                                ">
                                    {tokenItem.balance}
                                </div>
                            </div>
                        </motion.div>
                    )
                })
            }
        </div>
    );
}
