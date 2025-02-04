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
                            key={`tokenItem${index}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.1,
                                ease: "easeOut"
                            }}
                            className="
                                flex flex-row items-center justify-between
                                p-5 rounded-2xl cursor-pointer
                                bg-violet-950/80
                                backdrop-blur-xl border border-violet-800/30
                                shadow-[0_8px_16px_-6px] shadow-violet-950/50
                                transition-all duration-300 ease-in-out
                                overflow-hidden relative
                                group hover:bg-violet-900/80 hover:border-violet-600/30
                                hover:shadow-[0_12px_24px_-8px] hover:shadow-violet-900/50
                                hover:-translate-y-0.5
                            "
                        >
                            {/* Glass effect overlay */}
                            <div className="
                                absolute inset-0 
                                bg-gradient-to-br from-violet-300/5 via-violet-500/5 to-violet-900/5
                                opacity-0 group-hover:opacity-100 
                                transition-opacity duration-500 ease-in-out
                            " />
                            
                            {/* Enhanced shine effect */}
                            <div className="
                                absolute inset-0 
                                bg-gradient-to-r from-transparent via-violet-50/10 to-transparent
                                translate-x-[-200%] group-hover:translate-x-[200%]
                                transition-transform duration-1000 ease-out
                                skew-x-12
                            " />
                            
                            <User   
                                name={tokenItem.symbol}
                                description={tokenItem.name}
                                avatarProps={{
                                    src: tokenItem.logoURI,
                                    className: " ring-2 ring-violet-500/20  shadow-lg shadow-violet-950/50 transform group-hover:scale-110  transition-all duration-300 ease-out p-0.5 bg-gradient-to-br from-violet-400/20 to-violet-800/20"
                                }}
                                classNames={{
                                    name: "text-violet-50 font-bold text-base tracking-wide group-hover:text-white transition-colors duration-300",
                                    description: "text-violet-300/50 text-xs font-medium"
                                }}
                            />
                      
                            <div className="
                                px-5 py-1.5 
                                text-base font-bold
                                bg-violet-900/40
                                border border-violet-700/30
                                rounded-xl
                                text-violet-100
                                transition-all duration-300
                                group-hover:bg-violet-800/40
                                group-hover:text-white
                                group-hover:border-violet-600/30
                                flex items-center justify-center
                                min-w-[100px]
                                backdrop-blur-sm
                            ">
                                {tokenItem.balance}
                            </div>
                        </motion.div>
                    )
                })
            }
        </div>
    );
}
