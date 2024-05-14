import { createAction } from '@reduxjs/toolkit'

export const updateChainId = createAction<{ chainId: number | null }>(
    'application/updateChainId'
)

export const updateBlockNumber = createAction<{
    chainId: number
    blockNumber: number
}>('application/updateBlockNumber')

export const updateNetworkMode = createAction<{
    networkMode: boolean
}>('application/updateNetworkMode')
