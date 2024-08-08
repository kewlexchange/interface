import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink, useNavigate } from 'react-router-dom';
import { CHAIN_IDS_TO_NAMES, ChainId, isSupportedChain } from '../../../constants/chains';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useStakeContract, useDomainContract, useBridgeContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { generateExplorerURLByChain, getAssetIconByChainIdFromTokenList, getIconByChainId, getNativeCurrencyByChainId, getShordAccount, parseFloatWithDefault, unixTimeToDateTime } from '../../../utils';
import { Accordion, AccordionItem, Avatar, Image,Button, Card, Select, SelectItem, User, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Spinner, Tooltip } from '@nextui-org/react';
import { formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { WETH9 } from '../../../entities';
import { getChainInfo } from '../../../constants/chainInfo';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import { generateTxLink } from '../../../utils/web3Provider';

const _BRIDGE_STATUS_TAB = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const IMON_BRIDGE_CONTRACT = useBridgeContract(chainId, true);

    const ERC20Contract = useERC20Contract()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [allowanceAmount, setAllowanceAmount] = useState(parseEther("0"))
    const [baseAsset, setBaseAsset] = useState(null)
    const [quoteAsset, setQuoteAsset] = useState(null)
    const [baseInputValue, setBaseInputValue] = useState("")
    const [isLoaded,setIsLoaded] = useState(false)

    const [bridgeTransfers,setBridgeTransfers] = useState([])
    const navigate = useNavigate();

    useFetchAllTokenList(chainId, account)



    const initDefaults = async () => {
        setIsLoaded(false)
        const _transfers = await IMON_BRIDGE_CONTRACT.getTransfers();
        setBridgeTransfers(_transfers.slice().reverse());
        console.log(_transfers)
        setIsLoaded(true)
    }



    useEffect(() => {
        if(!chainId){
            return 
        }
        if(!account){
            return
        }
        initDefaults();
    }, [chainId,account])







    
    return (
        <>
            {

                <div className="w-full rounded-xl">
             <Table 
                onRowAction={(key : any) => {
                    let transaction = JSON.parse(key);
                    let explorerURL = generateTxLink(BigNumber.from(transaction.chainId).toNumber(),transaction.hash)
                    window.open(explorerURL, "_blank");
                }}
                 isHeaderSticky
                 color={"danger"}
                 disallowEmptySelection
                 selectionMode="single"
             removeWrapper aria-label="Example static collection table">
      <TableHeader>
        <TableColumn>IMONLINE</TableColumn>
        <TableColumn>PROVIDER</TableColumn>
        <TableColumn>ASSET</TableColumn>
        <TableColumn>STATUS</TableColumn>

      </TableHeader>
      <TableBody 
                  items={bridgeTransfers}
                  loadingContent={<Spinner color="danger" />}
                  className="flex flex-col gap-2"

           emptyContent={isLoaded ? "No Transactions Found!" : "Loading... Please Wait!"}
           isLoading={!isLoaded}>
  

  {(collection) => (
            
            <TableRow key={ JSON.stringify({chainId:collection.toChainId,hash:collection.txHash}) }>
                <TableCell>
                    <DoubleCurrencyIcon baseIcon={getIconByChainId(collection.fromChainId)} quoteIcon={getIconByChainId(collection.toChainId)}/> 
                </TableCell>
                <TableCell>
                    <Tooltip content={collection.creatorAddress}>
                        <span>{getShordAccount(collection.creatorAddress)}</span>
                    </Tooltip>
               
                    </TableCell>
                <TableCell>{ethers.utils.formatUnits(collection.amount,collection.assetInfo.asset.decimals)} {collection.assetInfo.asset.symbol}</TableCell>
                <TableCell>{collection.isProcessed ? 
                
                <div className='w-full p-2 rounded-lg bg-green-500/10 text-green-500 flex flex-row gap-2 p-2 items-center justify-start'>
                <span>Success</span>
                </div>
                : 
                
                <div className='w-full p-2 rounded-lg bg-danger-500/10 text-danger-500 flex flex-row gap-2 p-2 items-center justify-start'>
                <Spinner size='sm' color="danger" />
                <span>Processing...</span>
                </div>}</TableCell>

            </TableRow>
        )}


      </TableBody>
    </Table>
                </div>
            }

        </>
    );
}
export const BRIDGE_STATUS_TAB = memo(_BRIDGE_STATUS_TAB)

