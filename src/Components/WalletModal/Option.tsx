import React, { useEffect, useState, useRef } from 'react';
import {Connection} from "../../connection/types";
import {ActivationStatus, useActivationState} from "../../connection/activate";
import {useWeb3React} from "@web3-react/core";
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';


export default function Option({ connection }: { connection: Connection }) {
  const { activationState, tryActivation } = useActivationState()
  const { chainId } = useWeb3React()

  const closeDrawer  = () =>{
  }
  const activate = () => tryActivation(connection, closeDrawer, chainId)
  const isSomeOptionPending = activationState.status === ActivationStatus.PENDING
  const isCurrentOptionPending = isSomeOptionPending && activationState.connection.type === connection.type

  return (
    <button
      onClick={activate}
      disabled={isSomeOptionPending}
      className="w-full text-left focus:outline-none"
    >
      <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`group relative backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300
            ${isSomeOptionPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:shadow-purple-500/20'}`}
      >
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-[#C084FC]/5 to-[#E879F9]/10 border border-white/[0.05] rounded-2xl" />
          
          <div className="relative p-6 flex items-center gap-4">
              {/* Wallet Icon with Loading State */}
              <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/20 to-[#C084FC]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                  <div className={`relative w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.05] p-2 flex items-center justify-center
                    ${isCurrentOptionPending ? 'animate-pulse' : ''}`}>
                      <img
                          src={connection.getIcon?.(false)}
                          alt={connection.getName()}
                          width={32}
                          height={32}
                          className={`w-full rounded-full h-full object-contain transition-transform duration-300
                            ${isCurrentOptionPending ? 'animate-spin' : 'group-hover:scale-110'}`}
                      />
                  </div>
              </div>

              {/* Wallet Info */}
              <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-md font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                          {connection.getName()}
                      </h3>
                    
                  </div>
                  {/* Status Message */}
                  <p className="text-sm text-gray-400">
                      {isCurrentOptionPending ? 'Connecting...' : 'Click to connect'}
                  </p>
              </div>

              {/* Connection Status Indicator */}
              <div className={`w-2 h-2 rounded-full transition-all duration-300
                ${isCurrentOptionPending ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 group-hover:scale-125'}`} 
              />
          </div>

          {/* Enhanced Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/0 via-[#C084FC]/0 to-[#E879F9]/0 group-hover:from-[#7C3AED]/10 group-hover:via-[#C084FC]/10 group-hover:to-[#E879F9]/10 transition-all duration-500" />
      </motion.div>
    </button>
  )
}
