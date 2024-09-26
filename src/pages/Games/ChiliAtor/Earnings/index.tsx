import React, { Fragment, memo, useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import {useWeb3React} from "@web3-react/core";

import {formatEther, parseEther} from "ethers/lib/utils";
import {title} from "../../../../Components/Primitives";
import {useChiliatorGameContract, useDomainContract} from "../../../../hooks/useContract";
import {Card, CardBody, CardFooter, CardHeader, Select, SelectItem, Selection, Button} from "@nextui-org/react";
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {
    convertTimeStampToDay,
    getNativeCurrencyByChainId,
    getShordAccount,
    unixTimeToDateTime
} from "../../../../utils";
import {BigNumber} from "ethers";
import Identicon from "../../../../Components/Identicon";

const _Earnings: React.FC = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [isLoaded,setLoaded] = useState(false)
    const [gameList,setGameList] = useState([])
    const [gameInfo,setGameInfo] : any = useState(null)
    const ChiliatorGameContract = useChiliatorGameContract(chainId, true);
    const DOMAINS = useDomainContract(chainId, true)
    const [values, setValues] = React.useState<Selection>(new Set([]));

    const initDefaults = async () => {
        setLoaded(false)

        const _gameList = await ChiliatorGameContract.getUserInfo(account);
        console.log("_gameList",_gameList)

        const _userPlayedGames = await ChiliatorGameContract.getUserAllGameInfo(account,0,255);


        console.log(_userPlayedGames)

        setGameList(_userPlayedGames)

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

                    <div className="flex flex-row gap-1 items-start justify-center">
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
                color={"default"}
                disallowEmptySelection
                selectionMode="single"
                aria-label="Example static collection table" >
                <TableHeader>
                    <TableColumn>Game</TableColumn>
                    <TableColumn align='end'>Joined At</TableColumn>
                    <TableColumn align='end'>Bet Amount</TableColumn>
                    <TableColumn align='end'>Reward Deposit</TableColumn>
                    <TableColumn align='end'>Multiplier</TableColumn>
                    <TableColumn align='end'>Claimed At</TableColumn>
                    <TableColumn align='end'>Action</TableColumn>
                </TableHeader>
                <TableBody
                    emptyContent={isLoaded ? "No Players Found!" : "Loading... Please Wait!"}
                    isLoading={!isLoaded}
                    items={gameList}
                    loadingContent={<Spinner color="default" />}
                    className="flex flex-col gap-2">
                    {(collection) => (
                        <TableRow  key={`${BigNumber.from(collection.gameId).toNumber()}`}>
                            <TableCell>
                                {BigNumber.from(collection.gameId).toNumber()}
                            </TableCell>
                            <TableCell>{unixTimeToDateTime(collection.playedAt)}</TableCell>
                            <TableCell>{formatEther(collection.depositAmount)} {getNativeCurrencyByChainId(chainId)}</TableCell>
                            <TableCell>{formatEther(collection.rewardAmount)} {getNativeCurrencyByChainId(chainId)}</TableCell>
                            <TableCell>{formatEther(collection.rewardMultiplier)}</TableCell>
                            <TableCell>{unixTimeToDateTime(collection.claimedAt)}</TableCell>
                            <TableCell><Button isDisabled={collection.claimed} color={"default"} variant={"solid"} size={"sm"}>Claim</Button></TableCell>
                        </TableRow>
                    )}

                </TableBody>
            </Table>


        </Fragment>


    );
};

export const EarningsTab = memo(_Earnings);
