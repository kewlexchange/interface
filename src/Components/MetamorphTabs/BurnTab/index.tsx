import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import useModal, { ModalInfo, ModalLoading, ModalSelectToken, ModalSuccessTransaction } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { Button, Card , CardBody, CardFooter, Image, Spinner, User} from '@nextui-org/react';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getAssetIconByChainIdFromTokenList, getNativeCurrencyByChainId } from '../../../utils';
import { useERC20Contract, useFindDiamondByChainId, useMetamorphContract } from '../../../hooks/useContract';
import { BigNumber, ethers } from 'ethers';
import { formatEther, parseEther, parseUnits } from '@ethersproject/units';
import { ETHER_ADDRESS } from '../../../constants/misc';
import useBlockNumber from '../../../hooks/useBlockNumber';
import { NavLink } from 'react-router-dom';
import { ChainId } from '../../../constants/chains';
import { MORALIS_API_KEY } from '../../../constants/ai';


const _BURN_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()
    const Metamorph = useMetamorphContract(chainId, true)
    const ERC20Contract = useERC20Contract()
    const [baseTokenAllowance, setBaseTokenAllowance] : any = useState(parseEther("0"))
    const [morphTokens, setMorphTokens] : any = useState(null);

    const [baseAsset, setBaseAsset] = useState(null)
    const [baseInputValue, setBaseInputValue] = useState("")
    useFetchAllTokenList(chainId, account)
    const blockNumber = useBlockNumber()

    const [isLoading,setIsLoaded] = useState(true)


    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        setBaseAsset(defaultAssets.find(token => token?.symbol === getNativeCurrencyByChainId(chainId)))
        fetchTokens()
    }, [chainId,account])


    const setInputValue = (e, isBase) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        e = e.replace(",", ".")
        if (regex.test(e)) {
            setBaseInputValue(e)
        }
    }

    const fetchTokens = async () => {
        fetchNFTsMoralis();
        return
        setIsLoaded(true)
        try {
            const logs = await provider.getLogs({
                fromBlock: 0,
                toBlock: blockNumber,
                address: Metamorph.address
            });
    
            const transferLogs = logs
                .map(log => Metamorph.interface.parseLog(log))
                .filter(parsedLog => parsedLog.name === "TransferSingle");
    
            const uniqueTokenIds = new Set();
            const userBalances = [];
    
            for (const parsedLog of transferLogs) {
                console.log("ersan",parsedLog.args.id)
                const tokenId = BigNumber.from(parsedLog.args.id).toString();
                console.log("TokenId",tokenId)

                let accountAddress = account // "0x62cF9Cd2E3CE9FC3b8F6aCd343C62bc6483e0E98"

                if (!uniqueTokenIds.has(tokenId)) {
                    uniqueTokenIds.add(tokenId);
                    const balance = await Metamorph.balanceOf(accountAddress, tokenId);

                    if (balance.gt(0)) {
                        const tokenInfo = await Metamorph.getTokenByTokenId(tokenId);
                        console.log("balance",tokenInfo)

                        userBalances.push({
                            name: "Metamorph",
                            token: tokenInfo,
                            balance: BigNumber.from(balance).toNumber(),
                            contract: Metamorph.address,
                            id: tokenId,
                            type: 'ERC-1155'
                        });
                    }
                }
            }
    
            console.log(userBalances);
            setMorphTokens(userBalances);
            setIsLoaded(false)
    
        } catch (ex) {
            // Hata yönetimini burada ele alabilirsiniz.
            console.error("Error fetching tokens:", ex);
        }
    };
    



    const fetchNFTsMoralis = async () => {
        var _userNFTAssets = [];
        if (!account) {
            return;
        }
        let url = "";
        if (chainId === ChainId.CHILIZ_SPICY_TESTNET) {
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=chiliz%20testnet&format=decimal&media_items=false`;
        } else if (chainId === ChainId.CHILIZ_MAINNET) {
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=chiliz&format=decimal&media_items=false`;
        } else if (chainId === ChainId.ARBITRUM_ONE) {
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=arbitrum&format=decimal&media_items=false`;
        } else {
            return;
        }
        const userBalances = [];
    
        const options = {
            method: 'GET', // or 'POST', 'PUT', etc.
            headers: {
                'X-Moralis-Application-Id': "IMON",
                'X-API-Key': MORALIS_API_KEY,
                'Content-Type': 'application/json',
            },
        };
    
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!data) {
                return;
            }
    
            const promises = data.result.map(async (token) => {
                try {
                 
                    if(ethers.utils.getAddress(token.token_address) != ethers.utils.getAddress(Metamorph.address) ){
                        return null
                    }
                    const tokenInfo = await Metamorph.getTokenByTokenId(token.token_id);
    
                    return {
                        name: "Metamorph",
                        token: tokenInfo,
                        balance: token.amount,
                        contract: Metamorph.address,
                        id: token.token_id,
                        type: 'ERC-1155'
                    };
                } catch (error) {
                    console.error(`Error fetching token info for token ID ${token.token_id}:`, error);
                    return null; // Hata durumunda null döndür
                }
            });
    
            // Tüm işlemler tamamlandığında sonuçları toplayın
            const results = await Promise.all(promises);
    
            // Hatalı işlemleri filtreleyin (null olanları kaldırın)
            for (const result of results) {
                if (result !== null) {
                    userBalances.push(result);
                }
            }
    
            console.log("API_RESULTS", data);
            setMorphTokens(userBalances);
            setIsLoaded(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    

    const initDefaults = async () => {
        checkAllowance();
        fetchNFTsMoralis();
       // fetchTokens();
    }
    const onSelectToken = (tokenInfo) => {
        setBaseAsset(tokenInfo)
        toggleSelectToken()
    }

  
    const checkAllowance = async () => {
        if (!chainId) { return }
        if (!defaultAssets) { return }
        if ((!account)) {
            setBaseTokenAllowance(0)
            return;
        }
        let baseTokenERC = ERC20Contract(baseAsset.address);
        const _baseAllowanceAmount = await baseTokenERC.allowance(account, Metamorph.address);
        console.log("_BASE",_baseAllowanceAmount)
        setBaseTokenAllowance(_baseAllowanceAmount)
    }

    useEffect(()=>{
        if(!baseInputValue){
            return;
        }
        checkAllowance();
    },[baseInputValue])


    const isAllowanceRequired = () => {
        if (!baseAsset) {
            return false
        }
        if (baseAsset.address === ETHER_ADDRESS) {
            return false
        }
        if (!baseInputValue) {
            return false
        }

        let baseVal = parseEther("0");
        try {
            baseVal = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        } catch (e) {
            baseVal = parseEther("0")
        }

        console.log("ALLOWANCE",formatEther(baseTokenAllowance),formatEther(baseVal),baseVal.gte(baseTokenAllowance))
        return baseTokenAllowance.lt(baseVal)
    }


    const handleNFTToToken = async (token) => {
        const tokenId = token.id
        const tokenAmount = token.balance;
        toggleLoading();

        const hasAllowance = await Metamorph.isApprovedForAll(account, Metamorph.address);
        if(!hasAllowance){
            await Metamorph.setApprovalForAll(Metamorph.address, true).then(async (tx) => {
                await tx.wait();
                const summary = `Unlocking tokens for: ${Metamorph.address}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                await provider.getTransactionReceipt(tx.hash).then(() => {
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error: error });
                toggleError();
            }).finally(async () => {
                toggleLoading();
                initDefaults();
            }); 
        }

        await Metamorph.burn(account,tokenId,tokenAmount).then(async (tx) => {
            await tx.wait();
            const summary = `Burning NFTs for: ${Metamorph.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        }); 
    }


    const MorphCard = (props:{token}) => {
        const getLogo = () => {

            if(props.token.token === ethers.constants.AddressZero){
                return getAssetIconByChainIdFromTokenList(chainId,defaultAssets,ETHER_ADDRESS)
            }else{
                return getAssetIconByChainIdFromTokenList(chainId,defaultAssets,props.token.token.token)
            }

        }
        return (
            <Card shadow='sm'>

            <CardBody className="flex flex-row gap-2 items-center justify-between rounded-lg cursor-pointer p-2">
            <User   
                name={props.token.token.symbol}
                description={props.token.token.name}
                avatarProps={{
                    src:getLogo()
                }}/>
      
            <div className="px-6">{props.token.balance}</div>
            </CardBody>
            <CardFooter className='flex flex-row gap-2 w-full'>
                <Button onClick={()=>{
                    handleNFTToToken(props.token)
                }} size='sm' color='default'>Convert NFT to Token</Button>
                <Button as={NavLink} to={"/account"} onClick={()=>{
                   
                }} size='sm' color='default'>Sell On NFT Marketplace</Button>
            </CardFooter>
        </Card>
        )
    }

    return (
        <>
            <ModalInfo
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalSelectToken disableToken={undefined} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={undefined} allExchangePairs={undefined} />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />


            <div className="w-full rounded-xl pb-0">
                <div className="rounded-xl pb-0 flex gap-2 flex-col">



                {morphTokens && morphTokens.length > 0 ? morphTokens.map((token:any) => (
                    <MorphCard key={token.id} token={token}/>
                    ))
                :<>
                <div className="w-full rounded-xl pb-0">
                    <div className="w-full rounded-xl pb-0 flex gap-2 flex-col">
                        {
                            isLoading && <div className='w-full flex flex-col items-center justifty-center'>
                            <Spinner color='default'>Loading... Please wait...</Spinner>
                            </div>
                        }
                    
                        <div className={"flex flex-col gap-2 p-2 text-center items-center justify-center"}>
                            <span translate='no' className="material-symbols-outlined">deployed_code</span>
                            <span className={"w-full text-center"}>Your active morphed NFT positions will appear here.</span>
                        </div>
                    </div>
                </div>
                </>
                }

         
                </div>


            </div>

        </>
    );
}
export const BURN_TAB = memo(_BURN_TAB)

