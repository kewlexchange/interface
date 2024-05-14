import { createSlice } from '@reduxjs/toolkit'
import {ConnectionType} from "../../connection/types";
import {DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE} from "../../constants/misc";
import {updateVersion} from "../global/actions";
import {ChainId, isSupportedChain} from "../../constants/chains";

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  selectedWallet?: ConnectionType
  // deadline set by user in minutes, used in all txns
  userDeadline: number
  userSlippageTolerance: number

  // active Tab
  userBalance : string
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number
  // showGreenCards
  userTax:boolean
  timestamp: number
  tokenList: {[chainId: number]: any[]}
  customTokenList: {[chainId: number]: any[]}
  stakingItems: {
    [index: number]: {
      [key: string]: boolean
    }
  }
}

export const initialState: UserState = {
  selectedWallet: undefined,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  userTax:false,
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  tokenList : {},
  customTokenList:{},
  userBalance : "0",
  timestamp: currentTimestamp(),

  stakingItems:[]
}

const userSlice = createSlice({
  name: 'userConfiguration',
  initialState,
  reducers: {
    updateTokenList(state,{payload:{chainId,tokens}}){
      if(!chainId){return;}
      if (!state.tokenList) {
        state.tokenList = {}; // Initialize tokenList as an empty object if it is undefined
      }
      if(isSupportedChain(chainId)){
        state.tokenList[chainId] = tokens;
      }else{
        state.tokenList[chainId] = undefined;
      }
    },
    updateCustomTokenList(state,{payload:{chainId,tokens}}){
      if(!chainId){return;}
      if (!state.customTokenList) {
        state.customTokenList = {}; // Initialize tokenList as an empty object if it is undefined
      }
      if(isSupportedChain(chainId)){
        state.customTokenList[chainId] = tokens;
      }else{
        state.customTokenList[chainId] = undefined;
      }
    },
    updateUserBalance(state,{payload:{balance}}){
      state.userBalance = balance;
    },
    updateSelectedWallet(state, { payload: { wallet } }) {
      state.selectedWallet = wallet
    },

    updateUserDeadline(state, action) {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    },
    updateTax(state, action) {
      state.userTax = action.payload.userTax
      state.timestamp = currentTimestamp()
    },
    
    updateUserSlippageTolerance (state, action) {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    },
    updateStakingItemIsExpanded(state,{payload:{index,expanded}}){
      if (!state.stakingItems) {
        state.stakingItems = []
      }
      state.stakingItems[index] = state.stakingItems[index] || {}
      state.stakingItems[index]["expanded"] = expanded;
    },

  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      if (
        typeof state.userDeadline !== 'number' ||
        !Number.isInteger(state.userDeadline) ||
        state.userDeadline < 60 ||
        state.userDeadline > 180 * 60
      ) {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }

      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
  },
})

export const {
  updateUserBalance,
  updateTokenList,
  updateSelectedWallet,
  updateStakingItemIsExpanded,
  updateUserDeadline,
  updateTax,
  updateUserSlippageTolerance,
  updateCustomTokenList,

} = userSlice.actions
export default userSlice.reducer
