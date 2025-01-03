import { Slider, Image, Badge, Card, Tabs, Tab, Input, CardBody, CardFooter, Button, TableRow, TableColumn, TableHeader, Spinner, TableCell, TableBody, Table, User } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { ChangeEvent, useEffect, useState } from "react";
import { getAddress, isAddress, parseEther } from "ethers/lib/utils";
import { useERC20Contract, useKEWLListingContract } from "../../hooks/useContract";
import { ChainId } from "../../constants/chains";
import { useWeb3React } from "@web3-react/core";
import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "../../hooks/useModals";
import { BigNumber } from "ethers";
import { useFetchAllTokenList } from "../../state/user/hooks";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { generateExplorerURLByChain } from "../../utils";

const ListingPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()

    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [statusText, setStatusText] = useState("Waiting for confirmation...")
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()

    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const KEWLListing = useKEWLListingContract(chainId, true);

    const [amount, setAmount] = useState(1);
    const [externalTokenName, setExternalTokenName] = useState("")
    const [externalTokenSymbol, setExternalTokenSymbol] = useState("")
    const [externalTokenAddress, setExternalTokenAddress] = useState("")
    const [externalTokenLogo, setExternalTokenLogo] = useState("")
    const [externalTokenDecimals, setExternalTokenDecimals] = useState(0)
    const [externalTokenBalance, setExternalTokenBalance] = useState("0")
    const [listingRequests, setListingRequests] = useState([])

    const [listingFee, setListingFee] = useState("25000")
    const ERC20Contract = useERC20Contract()
    const [isLoaded, setLoaded] = useState(false)
    const dispatch = useAppDispatch()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])


    useFetchAllTokenList(chainId, account)

    
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);


    const initDefaults = async () => {
        setLoaded(true)
        if (chainId != ChainId.CHILIZ_MAINNET) {
            return
        }
        setLoaded(false)
        const _listings = await KEWLListing.getListings();
        console.log(_listings)
        setListingRequests(_listings)
        setLoaded(true)

    }

    useEffect(() => {
        if (!account) {

        }

        initDefaults();

    }, [account, chainId, provider, connector])

    const fetchTokenInfo = async () => {
        try {
            const ERC20Token = ERC20Contract(externalTokenAddress)
            const name = await ERC20Token.name();
            const symbol = await ERC20Token.symbol();
            const decimals = await ERC20Token.decimals();
            const balance = await ERC20Token.balanceOf(account)



            setExternalTokenName(name)
            setExternalTokenDecimals(BigNumber.from(decimals).toNumber())
            setExternalTokenSymbol(symbol)
        } catch (e) {

        }

    }

    useEffect(() => {
        fetchTokenInfo()
    }, [externalTokenAddress])

    const handleContractAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (isAddress(event?.target?.value)) {
            setExternalTokenAddress(event?.target?.value)
        } else {
            setExternalTokenAddress("")

        }
    };

    const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        setExternalTokenLogo(event?.target?.value)
    };

    const handleListingRequest = async () => {
        if (chainId !== ChainId.CHILIZ_MAINNET) {
            setTransaction({ hash: '', summary: '', error: { message: "Please switch to Chiliz Network!" } });
            toggleError();
            return
        }

        if (!isAddress(externalTokenAddress)) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Contract Address!" } });
            toggleError();
            return
        }

        if (externalTokenSymbol == "") {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Contract!" } });
            toggleError();
            return
        }

        if (externalTokenLogo == "") {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Token Image!" } });
            toggleError();
            return
        }

        let tokenParams = {
            token: externalTokenAddress,
            logoURI: externalTokenLogo
        }

        let depositOverrides = {
            value: parseEther(listingFee)
        }

        toggleLoading();
        await KEWLListing.listingRequest(tokenParams, depositOverrides).then(async (tx) => {
            await tx.wait();
            const summary = `Listing Request... : ${tx.hash}`
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

    const checkExists = (address: any): boolean => {
        if (!defaultAssets) { return false; }
        if (defaultAssets.length === 0) { return false; }
        let checkAsset = defaultAssets.find((token: any) => token.address === address);
        return checkAsset !== undefined;
    }

    const getLogo = (address: any): boolean => {
        if (!defaultAssets) { return false; }
        if (defaultAssets.length === 0) { return false; }
        let checkAsset = defaultAssets.find((token: any) => token.address === address);
        return checkAsset?.logoURI;
    }
    
    const isCancelled = (address: any) : boolean =>{
        if(getAddress("0x13D9E110e0c13016CAF9982CcB79A70aC39C1374") == getAddress(address) ){
            return true 
        }
        return false
    }

    return (

        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={statusText} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />


            <div className={"w-full px-2 py-5 swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <Card className={" flex gap-2 flex-col p-2 w-full"}>
                        <div className="w-full max-w-full">
                            <Tabs color={"default"} aria-label="Listing Tabs">

                                <Tab key="listings" title="Upcoming Listings">

                                    <Table
                                        onRowAction={(key: any) => {
                                                let transaction = JSON.parse(key);
                                                
                                            let explorerURL = generateExplorerURLByChain(chainId,transaction.token,true);
                                             window.open(explorerURL, "_blank");
                                        }}
                                        isHeaderSticky
                                        color={"default"}
                                        disallowEmptySelection
                                        selectionMode="single"
                                        removeWrapper aria-label="Example static collection table">
                                        <TableHeader>
                                            <TableColumn>Asset</TableColumn>
                                            <TableColumn>Status</TableColumn>

                                        </TableHeader>
                                        <TableBody
                                            items={listingRequests}
                                            loadingContent={<Spinner color="default" />}
                                            className="flex flex-col gap-2"

                                            emptyContent={isLoaded ? "No Listings Request Found!" : "Loading... Please Wait!"}
                                            isLoading={!isLoaded}>


                                            {(collection) => (

                                                <TableRow key={JSON.stringify({ token: collection.assetInfo.token})}>
                                                    <TableCell>

                                                        <User
                                                            name={collection.assetInfo.symbol + " - " + collection.assetInfo.name}
                                                            description={collection.assetInfo.token}
                                                            avatarProps={{
                                                                src: getLogo(collection.assetInfo.token)
                                                            }}
                                                        />
                                                    </TableCell>
                                        
                                                    <TableCell>{checkExists(collection?.assetInfo?.token) ?

                                                        <div className='w-full p-2 rounded-lg bg-green-500/10 text-green-500 flex flex-row gap-2 p-2 items-center justify-start'>
                                                            <span>Listed</span>
                                                        </div>
                                                        :

                                                       

                                                        <div className='w-full p-2 rounded-lg bg-danger-500/10 text-danger-500 flex flex-row gap-2 p-2 items-center justify-start'>
                                                            <Spinner size='sm' color="default" />
                                                            <span>{ isCancelled(collection.assetInfo?.token) ? "Cancelled": "Processing..."}</span>
                                                        </div>}</TableCell>

                                                </TableRow>
                                            )}


                                        </TableBody>
                                    </Table>
                                </Tab>

                                <Tab key="request" title="List your Token">
                                    <Card>
                                        <CardBody className="flex flex-col gap-2">
                                            <Input onChange={handleLogoChange} size="lg" type="text" label="Token Logo [SVG Format]" placeholder="https://kewl.exchange/yourlogo.svg" />
                                            <div className="w-full flex flex-row gap-2 justify-start rounded-lg bg-danger-500/10 text-danger-500 p-2">
                                                <span>Projects without token logos in SVG format will not be listed. SVG format is mandatory. </span>
                                            </div>

                                            <Input onChange={handleContractAddressChange} size="lg" type="text" label="Contract Address" placeholder="0x" />
                                            <Input isDisabled isReadOnly size="lg" type="text" label="Name" placeholder="" value={externalTokenName} />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input isDisabled isReadOnly size="lg" type="text" label="Symbol" placeholder="" value={externalTokenSymbol} />
                                                <Input isDisabled isReadOnly size="lg" type="text" label="Decimals" placeholder="" value={externalTokenDecimals} />
                                            </div>
                                        </CardBody>
                                        <CardFooter className="flex flex-col gap-2">
                                            <div className="w-full flex flex-col gap-2 justify-start rounded-lg bg-success-500/30 text-success-500 p-2">
                                                <span className="text-sm">To be listed on KEWL, you need to make a small donation ranging from 10.000 CHZ to 1.000.000 CHZ tokens to KEWL Foundation. The amount you donate will be used to further develop the KEWL Foundation and enable it to provide services at even higher standards.</span>


                                            </div>
                                            <Slider
                                                onChange={(e) => {
                                                    setListingFee(e.toString())
                                                }}
                                                size="lg"
                                                step={1000}
                                                color="default"
                                                label="Donation Amount"
                                                showSteps={false}
                                                getValue={(donation) => `${donation} CHZ`}
                                                maxValue={1000000}
                                                minValue={10000}
                                                defaultValue={25000}
                                                className="w-full"
                                            />
                                            <Button onPress={() => {
                                                handleListingRequest()
                                            }} fullWidth size="lg" color="default">Donate For Listing</Button>
                                        </CardFooter>
                                    </Card>
                                </Tab>


                            </Tabs>
                        </div>
                    </Card>
                </div>
            </div>
        </>

    )
}


export default ListingPage;
