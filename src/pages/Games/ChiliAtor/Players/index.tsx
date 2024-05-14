import React, { Fragment, memo, useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import {useWeb3React} from "@web3-react/core";

import {formatEther, parseEther} from "ethers/lib/utils";
import {title} from "../../../../Components/Primitives";
import {useChiliatorGameContract, useDomainContract} from "../../../../hooks/useContract";
import {Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {getNativeCurrencyByChainId, getShordAccount} from "../../../../utils";
import {BigNumber} from "ethers";
import Identicon from "../../../../Components/Identicon";

const _Players: React.FC = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [isLoaded,setLoaded] = useState(false)
    const [tableItems,setTableItems] = useState([])
    const ChiliatorGameContract = useChiliatorGameContract(chainId, true);
    const DOMAINS = useDomainContract(chainId, true)

    const initDefaults = async () => {
        setLoaded(false)
        const _gameInfo = await ChiliatorGameContract.getStats();
        console.log("_gameInfo",_gameInfo)
        const _players = await ChiliatorGameContract.getPlayers(_gameInfo.currentGameId);
        console.log("players",_players)
        setTableItems(_players)
        setLoaded(true)
    }

    useEffect(()=>{
        initDefaults();
    },[chainId,account])

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

            <Fragment>
                <Table
                    removeWrapper
                    isHeaderSticky
                    color={"danger"}
                    disallowEmptySelection
                    selectionMode="single"
                    aria-label="Example static collection table" >
                    <TableHeader>
                        <TableColumn>🐳 Whale</TableColumn>
                        <TableColumn align='end'>Bet Amount</TableColumn>
                    </TableHeader>
                    <TableBody
                        emptyContent={isLoaded ? "No Players Found!" : "Loading... Please Wait!"}
                        isLoading={!isLoaded}
                        items={tableItems}
                        loadingContent={<Spinner color="danger" />}
                        className="flex flex-col gap-2">
                        {(collection) => (

                            <TableRow  key={`${collection.user}`}>
                                <TableCell>
                                    <UserCard userAccount={collection.user}/>
                                </TableCell>
                                <TableCell>{formatEther(collection.depositAmount)} {getNativeCurrencyByChainId(chainId)}</TableCell>
                            </TableRow>
                        )}

                    </TableBody>
                </Table>
            </Fragment>


    );
};

export const PlayersTab = memo(_Players);
