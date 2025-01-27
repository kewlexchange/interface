import React, { memo, useEffect, useMemo, useState } from 'react';
import { getIconByChainId, getNFTItemType, getNativeCurrencyByChainId, getShordAccount, unixTimeToDateTime } from "../../utils";
import { useWeb3React } from "@web3-react/core";
import Identicon from '../Identicon';
import { ethers } from 'ethers';
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Chip, Image, Input, Slider, Spinner, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import { title } from '../Primitives';
import { formatEther, parseEther } from '@ethersproject/units';
import { ChainId } from '../../constants/chains';
import { useDomainContract, useLaunchpadContract } from '../../hooks/useContract';
import useModal, { ModalInfo, ModalLoading, ModalSuccessTransaction, ModalSelectToken } from '../../hooks/useModals';

const _IDOItem = (props: { IDOParams, name }) => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [depositAmount, setDepositAmount] = useState("1")
    const [userBalance, setUserBalance] = useState("0")
    const [depositAccount, setDepositAccount] = useState("0xEd1DeA47A277aa2E9e39f6fd156D44fB5fD4dbC0")
    const IMON_LAUNCHPAD_CONTRACT = useLaunchpadContract(chainId, true);
    const DOMAINS = useDomainContract(chainId, true)

    const [totalDeposit, setTotalDeposit] = useState("0")
    const [userInfo, setUserInfo]: any = useState(null)
    const [contributors, setContributors]: any = useState([])
    const [isLoaded, setIsLoaded] = useState(false)

    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })

    useEffect(() => {
    }, [])





    const UserCard = (props: { userAccount: any }) => {
        const [userName, setUserName] = useState("")
        const [isRefunded,setIsRefunded] = useState(false)

        const checkRefundStatus = async (acc) => {
       
            const [_totalDeposit, _userInfo] = await IMON_LAUNCHPAD_CONTRACT.getContributorInfo(acc);
            setIsRefunded(_userInfo.isRefunded)
            console.log(_userInfo)

        } 

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
            checkRefundStatus(props.userAccount)
        }, [props.userAccount])
        return (
            <>
                <div className='w-full flex flex-row items-center justify-start gap-2'>
                    <Identicon size={32} account={props.userAccount} />
                    <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className={(isRefunded ? "text-danger line-through" : "text-default-600 ") +  " text-small font-semibold leading-none "}>{userName}</h4>
                        <h5 className={(isRefunded ? "text-danger line-through" : "text-default-400 ") + " text-small text-xs tracking-tight"}>{props.userAccount}</h5>
                    </div>
                </div>
            </>
        )
    }
    const initDefaults = async () => {
        setIsLoaded(false)
        setDepositAmount("1")
        setUserBalance("0")

        const _balance = await provider.getBalance(account ? account : ethers.constants.AddressZero);
        setUserBalance(formatEther(_balance))
        const [_totalDeposit, _userInfo, _contributors] = await IMON_LAUNCHPAD_CONTRACT.getFairLaunchInfo(account ? account : ethers.constants.AddressZero);
        setTotalDeposit(formatEther(_totalDeposit))
        setUserInfo(_userInfo);
        console.log(_contributors)

        const groupedTransactions: { [_contributor: string]: { depositAmount: any; deposiCount: any } } = {};
        for await (const contributorItem of _contributors) {
            console.log(contributorItem);

            if (!groupedTransactions[contributorItem.user]) {
                groupedTransactions[contributorItem.user] = { depositAmount: parseEther("0"), deposiCount: parseEther("0") };
            }
            groupedTransactions[contributorItem.user].depositAmount = groupedTransactions[contributorItem.user].depositAmount.add(contributorItem.depositAmount)
            groupedTransactions[contributorItem.user].deposiCount = groupedTransactions[contributorItem.user].deposiCount.add(1)
        }



        const sortedGroupedTransactions = Object.entries(groupedTransactions)
            .sort(([, a], [, b]) => b.depositAmount.sub(a.depositAmount))
            .map(([user, values]) => ({ user, ...values }));

        setContributors(sortedGroupedTransactions)
        setIsLoaded(true)

    }
    useEffect(() => {

        initDefaults();

    }, [account, chainId])

    const handleContribute = async () => {


        if (![ChainId.CHILIZ_MAINNET, ChainId.CHILIZ_SPICY_TESTNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Chain. Please Switch to Chiliz Main Net!" } });
            toggleError();
            return;
        }

        if (depositAmount === "") {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Amount!" } });
            toggleError();
            return;
        }

        if (depositAmount === "0") {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Amount!" } });
            toggleError();
            return;
        }


        console.log("depositAmount", depositAmount)


        let overrides = {
            value: parseEther(depositAmount.toString())
        }


        toggleLoading();
        await IMON_LAUNCHPAD_CONTRACT.contribute(overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Joining : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }

    const handleRefund = async () => {

        if (![ChainId.CHILIZ_MAINNET, ChainId.CHILIZ_SPICY_TESTNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Chain. Please Switch to Chiliz Main Net!" } });
            toggleError();
            return;
        }

        if (!userInfo) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid User!" } });
            toggleError();
            return;
        }

        if (userInfo && userInfo.isRefunded) {
            setTransaction({ hash: '', summary: '', error: { message: "Already refunded!" } });
            toggleError();
            return;
        }

        toggleLoading();
        await IMON_LAUNCHPAD_CONTRACT.doRefund().then(async (tx) => {
            await tx.wait();
            const summary = `Refunding... : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }

    return (
        <>
            <ModalInfo
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />

            <div className="w-full flex flex-col items-center justify-center">
                <Image isBlurred src="/images/nftlaunchpad/imon/cover.webp" />
            </div>
            <div className={"w-full rounded-lg p-2"}>

                <div className="rounded-lg flex items-center justify-center gap-2 flex-col">


                    <div className={"w-full flex gap-2 flex-col rounded-lg  py-2"}>
                        <div className='w-full flex flex-col items-center justify-center gap-2'>
                            <span className={title({ size: "md", color: "green" })}>{props.name}</span>
                        </div>
                        <Card shadow='lg'
                            className="min-w-xl max-w-xl"

                        >
                            <CardHeader className="justify-between">
                                <div className="flex gap-5">
                                    <Avatar isBordered radius="full" size="md" src="https://raw.githubusercontent.com/defaulttokenlist/assets/main/bitci/tokens/0x9631be8566fC71d91970b10AcfdEe29F21Da6C27/logo.svg" />
                                    <div className="flex flex-col gap-1 items-start justify-center">
                                        <h4 className="text-small font-semibold leading-none text-default-600">IMON</h4>
                                        <h5 className="text-small tracking-tight text-default-400">Intelligent Monsters</h5>
                                    </div>
                                </div>

                                <div className={"bg-red-200/30 rounded-xl p-2"}>
                                    <span className={"text-red-500 flex flex-row items-center justify-center gap-2"}>
                                        <svg
                                            className="animate-spin h-5 w-5 text-current"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        Cancelled
                                    </span>
                                </div>

                            </CardHeader>
                            <CardBody>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Name</span>
                                    <span className={"font-bold"}>Intelligent Monsters</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Symbol</span>
                                    <span className={"font-bold"}>IMON</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Decimals</span>
                                    <span className={"font-bold"}>18</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Total Supply</span>
                                    <span className={"font-bold"}>50.000.000,00</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Standard</span>
                                    <span className={"font-bold"}>ERC20</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Blockchain</span>
                                    <span className={"font-bold"}>Chiliz</span>
                                </div>

                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Token Price</span>
                                    <span className={"font-bold"}>-</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Soft Capitalization</span>
                                    <span className={"font-bold"}>-</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Hard Capitalization</span>
                                    <span className={"font-bold"}>-</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Liquidity</span>
                                    <span className={"font-bold"}>5.000.000,00</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Contribution Start</span>
                                    <span className={"font-bold"}>Jan 29th, Mon, 17:00 UTC+3</span>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Contribution End</span>
                                    <span className={"font-bold"}>-</span>
                                </div>
                                <div className='hidden w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>FCFS Start</span>
                                    <span className={"font-bold"}>-</span>
                                </div>
                                <div className='hidden w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>FCFS End</span>
                                    <span className={"font-bold"}>-</span>
                                </div>
                                <div className='hidden w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Voting Start</span>
                                    <span className={"font-bold"}>-</span>
                                </div>
                                <div className='hidden w-full flex flex-row items-center justify-between'>
                                    <span className={"font-normal"}>Voting End</span>
                                    <span className={"font-bold"}>-</span>
                                </div>
                            </CardBody>
                            <CardFooter className="gap-3">
                                <div className="flex gap-1">
                                    <p className="font-semibold text-default-400 text-small">{contributors && contributors.length}</p>
                                    <p className=" text-default-400 text-small">Contributors</p>
                                </div>
                                <div className="flex gap-1">
                                    <p className="font-semibold text-default-400 text-small">{totalDeposit} CHZ</p>
                                    <p className="text-default-400 text-small">Total Raised</p>
                                </div>
                            </CardFooter>
                        </Card>


                        <Card className='p-2'>
                            <Tabs selectedKey={"refund"} size={"lg"} color='success' aria-label="Tabs sizes">
                                <Tab isDisabled={true} key="contribute" title="Contribute">
                                    <Card className='w-full flex flex-col gap-2'>
                                        <CardHeader className="flex justify-between items-start">
                                            <div className="flex gap-5">
                                                <Button radius='full' isIconOnly size='lg'> <Identicon size={36} account={account ? account : ethers.constants.AddressZero} />
                                                </Button>
                                                <div className="flex flex-col gap-1 items-start justify-center">
                                                    <h4 className="text-small font-semibold leading-none text-default-600">Contribution</h4>

                                                    <h5 className="text-small tracking-tight text-success-400">You can contribute and play a crucial role in advancing the development of IMON. Contribute now to support IMON's development and growth.</h5>
                                                </div>

                                            </div>
                                            <Button onPress={() => {
                                                initDefaults()
                                            }} isIconOnly radius='full'>
                                                <span translate='no' className="material-symbols-outlined">
                                                    refresh
                                                </span>
                                            </Button>
                                        </CardHeader>
                                        <CardBody>

                                            <div className='w-full flex flex-col gap-2 items-center justify-center'>
                                                <div className='w-full flex flex-row items-center justify-center'>
                                                    <span className={title({ size: "md", color: "green" })}>{depositAmount} CHZ</span>
                                                </div>
                                                <Slider
                                                    onChange={(e) => {
                                                        setDepositAmount(e)
                                                    }}
                                                    className={"w-full"}
                                                    size="lg"
                                                    showTooltip={true}

                                                    step={1}
                                                    color="success"
                                                    showSteps={false}
                                                    maxValue={userBalance}
                                                    minValue={0}
                                                    value={depositAmount === "" ? 0 : parseFloat(depositAmount)}
                                                    defaultValue={parseFloat(depositAmount)}
                                                />

                                                <Input
                                                    type="number"
                                                    size='lg'
                                                    onChange={(e) => {
                                                        setDepositAmount(e.target.value)
                                                    }}
                                                    min={0}
                                                    color={"success"}
                                                    variant='bordered'
                                                    label="Deposit Amount"

                                                    placeholder=""
                                                    defaultValue=""
                                                    labelPlacement='outside'
                                                    value={depositAmount}
                                                    className="w-full"
                                                    endContent={
                                                        <img src={getIconByChainId(chainId)} className="w-8 h-8" alt="" />
                                                    }
                                                />

                                                <div className="w-full">
                                                    <Button onPress={() => {
                                                        handleContribute();
                                                    }} variant='shadow' size='lg' className='w-full' color='success'>Contribute</Button>
                                                </div>




                                            </div>




                                        </CardBody>

                                    </Card>


                                </Tab>
                                <Tab key="refund" title="Refund">
                                    <Card className='w-full flex flex-col gap-2'>
                                        <CardHeader className="flex justify-between items-start">
                                            <div className="flex gap-5">
                                                <Button radius='full' isIconOnly size='lg'> <Identicon size={36} account={account ? account : ethers.constants.AddressZero} />
                                                </Button>
                                                <div className="flex flex-col gap-1 items-start justify-center">
                                                    <h4 className="text-small font-semibold leading-none text-default-600">Refund</h4>
                                                    <h5 className="text-small tracking-tight rounded-xl text-danger-400">
                                                        You can retrieve the money you invested in the IMON Launch by requesting a refund. However, please note that you will not receive IMON Tokens if you choose to refund. You will not experience any deprivation of rights in this process, and you can rejoin at any time. IMON will continue with the rest.
                                                    </h5>
                                                </div>

                                            </div>
                                            <Button onPress={() => {
                                                initDefaults()
                                            }} isIconOnly radius='full'>
                                                <span translate='no' className="material-symbols-outlined">
                                                    refresh
                                                </span>
                                            </Button>
                                        </CardHeader>
                                        <CardBody>

                                            <div className='w-full flex flex-col gap-2 items-center justify-center'>
                                                <div className='w-full flex flex-row items-center justify-center'>
                                                    <span className={title({ size: "md", color: "red" })}>{userInfo && formatEther(userInfo.depositAmount)} CHZ</span>
                                                </div>
                                                <div className='w-full flex flex-col gap-2'>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Your Contribution</span>
                                                        <span>{userInfo ? userInfo.joinedAt ? formatEther(userInfo.depositAmount) : "-" : "-"} CHZ</span>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Joined At</span>
                                                        <span>{userInfo ? userInfo.joinedAt ? unixTimeToDateTime(userInfo.joinedAt) : "-" : "-"}</span>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Is Refunded</span>
                                                        <span>{userInfo ? (userInfo.isRefunded ? "Yes" : "No") : "-"}</span>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Refunded At</span>
                                                        <span>{userInfo ? userInfo.isRefunded ? unixTimeToDateTime(userInfo.refundedAt) : "-" : "-"}</span>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Withdraw Amount</span>
                                                        <span>{userInfo ? formatEther(userInfo.withdrawAmount) : "-"} CHZ</span>
                                                    </div>
                                                </div>



                                                <div className="w-full">
                                                    <Button onPress={() => {
                                                        handleRefund();
                                                    }} isDisabled={userInfo && userInfo.isRefunded} variant='shadow' size='lg' className='w-full' color='default'>Refund</Button>
                                                </div>




                                            </div>




                                        </CardBody>

                                    </Card>

                                </Tab>

                                <Tab isDisabled={true} key="claim" title="Claim Tokens">
                                    <Card className='w-full flex flex-col gap-2'>
                                        <CardHeader className="flex justify-between items-start">
                                            <div className="flex gap-5">
                                                <Button radius='full' isIconOnly size='lg'> <Identicon size={36} account={account ? account : ethers.constants.AddressZero} />
                                                </Button>
                                                <div className="flex flex-col gap-1 items-start justify-center">
                                                    <h4 className="text-small font-semibold leading-none text-default-600">Claim Tokens</h4>
                                                    <h5 className="text-small tracking-tight  text-secondary-400">The token claiming process will be possible once the total contributions reach the softcap. This process may take some time. If you do not wish to wait, you have the option to request a refund.</h5>
                                                </div>



                                            </div>
                                            <Button onPress={() => {
                                                initDefaults()
                                            }} isIconOnly radius='full'>
                                                <span translate='no' className="material-symbols-outlined">
                                                    refresh
                                                </span>
                                            </Button>
                                        </CardHeader>
                                        <CardBody>

                                            <div className='w-full flex flex-col gap-2 items-center justify-center'>
                                                <div className='w-full flex flex-row items-center text-center justify-center'>
                                                    <span className={title({ size: "sm", color: "violet" })}>The claimable token amount has not been calculated yet.</span>
                                                </div>

                                                <div className='w-full flex flex-row items-center justify-center'>
                                                    <span className={title({ size: "md", color: "violet" })}>{userInfo && formatEther(userInfo.depositAmount)} CHZ</span>
                                                </div>
                                                <div className='w-full flex flex-col gap-2'>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Your Contribution</span>
                                                        <span>{userInfo ? userInfo.joinedAt ? formatEther(userInfo.depositAmount) : "-" : "-"} CHZ</span>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Joined At</span>
                                                        <span>{userInfo ? userInfo.joinedAt ? unixTimeToDateTime(userInfo.joinedAt) : "-" : "-"}</span>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Is Refunded</span>
                                                        <span>{userInfo ? (userInfo.isRefunded ? "Yes" : "No") : "-"}</span>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Refunded At</span>
                                                        <span>{userInfo ? userInfo.isRefunded ? unixTimeToDateTime(userInfo.refundedAt) : "-" : "-"}</span>
                                                    </div>
                                                    <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                        <span>Withdraw Amount</span>
                                                        <span>{userInfo ? formatEther(userInfo.withdrawAmount) : "-"} IMON</span>
                                                    </div>
                                                </div>



                                                <div className="w-full">
                                                    <Button onPress={() => {

                                                    }} variant='shadow' isDisabled size='lg' className='w-full' color='secondary'>Claim Tokens</Button>
                                                </div>

                                            </div>




                                        </CardBody>

                                    </Card>

                                </Tab>
                            </Tabs>
                        </Card>


                        <Table
                        isHeaderSticky
                        color={"default"}
                        disallowEmptySelection
                        selectionMode="single"
                        aria-label="Example static collection table">
                            <TableHeader>
                                <TableColumn>Address</TableColumn>
                                <TableColumn>Amount</TableColumn>
                            </TableHeader>
                            

                            <TableBody
            emptyContent={isLoaded ? "No Transactions Found!" : "Loading... Please Wait!"}
            isLoading={!isLoaded}
            items={contributors}
            loadingContent={<Spinner color="default" />}
            className="flex flex-col gap-2">
            {(collection) => (
            
                <TableRow key={`/nfts/${collection.user}`}>
                    <TableCell>
                        <UserCard userAccount={collection.user}/>
                    </TableCell>
                    <TableCell className='text-end'>{formatEther(collection.depositAmount)} {getNativeCurrencyByChainId(chainId)}</TableCell>
       
                </TableRow>
            )}

        </TableBody>

                        </Table>
                    </div>




                </div>

            </div>
        </>
    );
}
export const IDOItem = memo(_IDOItem)
