import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useIMONMarketContract, useDomainContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, getShordAccount, getShordAccountForMobile, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { updateUserDeadline, updateUserSlippageTolerance } from '../../../state/user/reducer';
import { Badge, Button, Card, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { MORALIS_API_KEY } from '../../../constants/ai';
import useBlockNumber from '../../../hooks/useBlockNumber';
import { formatEther, hexZeroPad, parseEther } from 'ethers/lib/utils';
import { MarketNFTItem } from '../../MarketNFTItem';
import { group } from 'console';
import Identicon from '../../Identicon';



const _NFT_MARKET_LEADERBOARD_TAB = () => {
    const blockNumber = useBlockNumber()

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const ERC20Contract = useERC20Contract()
    const NFTMARKETPLACE = useIMONMarketContract(chainId,true);
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()
    const [transactions,setTransactions] : any = useState([])
    const [isLoaded,setLoaded] = useState(false)
    const DOMAINS = useDomainContract(chainId, true)



    useEffect(()=>{
        fetchTransactions()
    },[])

    const fetchTransactions = async ()=>{
        setLoaded(false)
        let nftMarketContract = "0x955ed1460Ec2C9fCF485eaf36392e16ac4c40596"

        const logs = await provider.getLogs({
            fromBlock: 0,
            toBlock: blockNumber,
            address: nftMarketContract,
            topics: [[
                ethers.utils.id("BuyItem(uint256 _collectionId, uint256 _itemId, address _contract, address _seller, address _buyer, uint256 _tokenId, uint256 _amount, uint256 _price)"),
                null,
                hexZeroPad(nftMarketContract, 32)]]
        })

        const groupedTransactions: { [buyer: string]: { price: any; amount: any,cns:"",trade:any } } = {};

        for await (const log of logs) {
            try {
                const parsedLog = NFTMARKETPLACE.interface.parseLog(log);
                if (parsedLog.name === "BuyItem") {
                    console.log(parsedLog)
                  //  let txInfo = {buyer:parsedLog.args._buyer,price:parsedLog.args._price,amount:parsedLog.args._amount}
                    const buyer = parsedLog.args._buyer;
                    const price = parsedLog.args._price;
                    const amount =  parsedLog.args._amount;

                    if (!groupedTransactions[buyer]) {
                        groupedTransactions[buyer] = { price: parseEther("0"), amount: parseEther("0"), cns:"",trade:parseEther("0")};
                    }

                    groupedTransactions[buyer].price = groupedTransactions[buyer].price.add(price)
                    groupedTransactions[buyer].amount = groupedTransactions[buyer].amount.add(amount)
                    groupedTransactions[buyer].trade = groupedTransactions[buyer].trade.add(1)
                }
            } catch (exception) {
            }
        }

        const sortedGroupedTransactions = Object.entries(groupedTransactions)
        .sort(([, a], [, b]) => b.price.sub( a.price))
        .map(([buyer, values]) => ({ buyer, ...values }));
      

        setTransactions(sortedGroupedTransactions)
        console.log(sortedGroupedTransactions);


        setLoaded(true)
    }

    const UserCard = (props: {userAccount: any }) => {
        const [userName, setUserName] = useState("")

        const resolveCNS = async (userAddress: any) => {
            let name = userAddress;
            try {
                let accountInfo = await DOMAINS.getDomainByAddress(userAddress);
                if (accountInfo.isValid) {
                    name = accountInfo.name;
                }else{
                    name = getShordAccount(name)
                }
            } catch (e) {
            }
            setUserName(name)
        }

        useEffect(() => {
            resolveCNS(props.userAccount)
        }, [props.userAccount])
        return (
            <>
                <div className='w-full flex flex-row items-center justify-start gap-2'>
                    

                    <Identicon size={32} account={props.userAccount} />
             
                    <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">{userName}</h4>
                        <h5 className="hidden sm:block text-small text-xs tracking-tight text-default-400">{props.userAccount}</h5>
                        
                        <h5 className="block sm:hidden text-small text-xs tracking-tight text-default-400">{getShordAccount(props.userAccount)}</h5>

                        

                    </div>
                </div>
            </>
        )
    }

    return (
        <>
        <Table
        removeWrapper
        isHeaderSticky
        color={"danger"}
        disallowEmptySelection
        selectionMode="single"
        aria-label="Example static collection table" >
        <TableHeader>
            <TableColumn>🐳 Whale</TableColumn>
            <TableColumn align='end'>Total Volume</TableColumn>
            <TableColumn align='end'>NFT Amount</TableColumn>
            <TableColumn align='end'>Total Trades</TableColumn>
        </TableHeader>
        <TableBody
            emptyContent={isLoaded ? "No Transactions Found!" : "Loading... Please Wait!"}
            isLoading={!isLoaded}
            items={transactions}
            loadingContent={<Spinner color="danger" />}
            className="flex flex-col gap-2">
            {(collection) => (
            
                <TableRow key={`/nfts/${collection.buyer}`}>
                    <TableCell>
                        <UserCard userAccount={collection.buyer}/>
                    </TableCell>
                    <TableCell>{formatEther(collection.price)} {getNativeCurrencyByChainId(chainId)}</TableCell>
                    <TableCell>{BigNumber.from(collection.amount).toNumber()} NFT</TableCell>
                    <TableCell>{BigNumber.from(collection.trade).toNumber()}</TableCell>
                </TableRow>
            )}

        </TableBody>
    </Table>

        </>
    );
}
export const NFT_MARKET_LEADERBOARD_TAB = memo(_NFT_MARKET_LEADERBOARD_TAB)

