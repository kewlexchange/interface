import IPage from "@/interfaces/page";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther, parseEther } from "ethers/lib/utils";
import ChiliMON from "../../../assets/svg/chilimon.svg"
import { useCHILIMONContract, useNFT1155Contract } from "../../../hooks/useContract";
import Identicon from "../../../Components/Identicon";
import useModal, { ModalNoProvider, ModalError, ModalLoading, ModalSuccessTransaction } from "../../../hooks/useModals";
import { getNativeCurrencyByChainId, generateExplorerURLByChain, getShordAccount } from "../../../utils";
const ChilimonPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()

    const CHILIMONDIAMOND = useCHILIMONContract(chainId, true);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [statsInfo, setStatsInfo]: any = useState(null)
    const [gameInfo, setGameInfo]: any = useState(null)
    const [userPlayedGames,setUserPlatedGames] : any = useState(null)
    const IMON_NFTContract =  useNFT1155Contract()


    const claimAirdrop = async () => {
        if (!account) { return; }
        if (!account) { return; }
        toggleLoading();
        await CHILIMONDIAMOND.claim().then(async (tx) => {
            await tx.wait();
            const summary = `Minting CHZ Airdrop: ${tx.hash}`
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


    const handleMint = async () => {
        if (!account) { return; }
        let overrides = {
            value: parseEther(statsInfo.pricePerGame)
        }
        toggleLoading();
        await CHILIMONDIAMOND.join(overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Minting CIHILIMON: ${tx.hash}`
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

    const handleBurn = async (params) => {
        if (!account) { return; }
        const getCollectionAddress = await CHILIMONDIAMOND.getCollectionAddress();
        const NFTContract = await IMON_NFTContract(getCollectionAddress,true);
        const hasAllowance = await NFTContract.isApprovedForAll(account,CHILIMONDIAMOND.address);



        if(!hasAllowance){
            toggleLoading();
            await NFTContract.setApprovalForAll(CHILIMONDIAMOND.address,true).then(async (tx) => {
                await tx.wait();
                const summary = `Unlocking NFT's for: ${CHILIMONDIAMOND.address}`
                setTransaction({ hash: tx.hash, summary: summary, error:null});
                await provider.getTransactionReceipt(tx.hash).then(()=>{
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error });
                toggleError();
            }).finally(async ()=>{
                toggleLoading();
            });
        }
    

        

        toggleLoading();
        await CHILIMONDIAMOND.burn(BigNumber.from(params.blockStart).toNumber()).then(async (tx) => {
            await tx.wait();
            const summary = `Burning.. CIHILIMON: ${tx.hash}`
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



    const initDefaults = async () => {
      
        if (!CHILIMONDIAMOND) { return; }
        console.log("calistim")
        const [totalMinted,
            playerCount,
            totalDeposit,
            pricePerGame,
            totalBurned,
            lastGameBlock,
            currentGameBlock,
            nextGameBlock] = await CHILIMONDIAMOND.getStats();

        let _statsInfo = {
            totalMinted: BigNumber.from(totalMinted).toNumber(),
            playerCount: BigNumber.from(playerCount).toNumber(),
            totalDeposit: formatEther(totalDeposit),
            pricePerGame: formatEther(pricePerGame),
            totalBurned:BigNumber.from(totalBurned).toNumber(),
            lastGameBlock:BigNumber.from(lastGameBlock).toNumber(),
            currentGameBlock: BigNumber.from(currentGameBlock).toNumber(),
            nextGameBlock: BigNumber.from(nextGameBlock).toNumber()
        }
        setStatsInfo(_statsInfo);
        console.log(_statsInfo)

        const _gameInfo = await CHILIMONDIAMOND.getGameInfo(currentGameBlock);
        setGameInfo(_gameInfo)
        console.log(_gameInfo)

        const [userBlocks,userGames] = await CHILIMONDIAMOND.getUserInfo(account);
        console.log(userBlocks,userGames)
        setUserPlatedGames(userGames)

    }


  useEffect(() => {
    // setInterval kullanarak her 5 saniyede bir fonksiyonu çağırma
    const intervalId = setInterval(initDefaults, 5000);

    // useEffect temizleme fonksiyonu
    return () => clearInterval(intervalId);
  }, [chainId,account]); // Boş bağımlılık dizisi, sadece bir kere çalıştırmak için


    useEffect(() => {
        initDefaults()
    }, [chainId, account])

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />


            <div className={"container mx-auto"}>
                <div className={"w-full flex flex-col items-center justify-center"}>
                    <img src={ChiliMON} className="w-[500px] h-[300px]" />


                    <div className={"collection flex flex-col items-center justify-center"}>
                        <span className={"w-full text-center text-7xl sm:text-3xl font-bold text-black"}>CHILIMOTION</span>
                        <span className={"w-full text-center font-bold text-pink-800"}>
                            Chilimon First NFT Collection of Index Protocol on Chiliz Chain
                        </span>
                    </div>
                </div>
                <div className={"w-3/4 sm:w-full flex flex-col items-center gap-4 justify-center mx-auto transparent-bg rounded-2xl p-5"}>
                   
                    <div className="flex flex-col gap-2 p-2 w-full">
                        <div className="w-full cursor-pointer  rounded-lg">
                                <div className={"w-full flex flex-col gap-2"}>

                                        <div className="grid grid-cols-2">
                                            <div className="w-full flex flex-row  gap-2 justify-start items-center">
                                                <Identicon size={48} account={ethers.constants.AddressZero}/>
                                                <div className="w-full">
                                                    <span className="text-2xl font-bold leading-none text-gray-900">
                                                        CHILIMON
                                                    </span>
                                                    <h3 className="text-base uppercase font-normal text-gray-500">Collection Name</h3>
                                                </div>
                                            </div>

                                            {
                                                userPlayedGames && userPlayedGames.length * 2.5 > 0 ?  <button onClick={() => {
                                                    claimAirdrop();
                                                }} className={"btn btn-primary"}>Claim Your {userPlayedGames && userPlayedGames.length * 2.5} CHZ Airdrop</button> :
                                                <span className="btn btn-primary">No Rewards Available</span>
                                            }

                                           
                                        </div>
                                </div>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                            <div className="border rounded-lg p-2 flex flex-col gap-2 items-start justify-center">
                                    <span className="text-base uppercase font-normal text-gray-500">Total Deposit</span>
                                    <span className="font-bold leading-none text-gray-900">
                                        {statsInfo && statsInfo.totalDeposit} {getNativeCurrencyByChainId(chainId)}
                                    </span>
                            </div>

                            <div className="border rounded-lg p-2 flex flex-col gap-2 items-start justify-center">
                                    <span className="text-base uppercase font-normal text-gray-500">Total Player</span>
                                    <span className="font-bold leading-none text-gray-900">
                                        {statsInfo && statsInfo.playerCount}
                                    </span>
                            </div>

                            <div className="border rounded-lg p-2 flex flex-col gap-2 items-start justify-center">
                                    <span className="text-base uppercase font-normal text-gray-500">Total Minted</span>
                                    <span className="font-bold leading-none text-gray-900">
                                        {statsInfo && statsInfo.totalMinted}
                                    </span>
                            </div>

                            <div className="border rounded-lg p-2 flex flex-col gap-2 items-start justify-center">
                                    <span className="text-base uppercase font-normal text-gray-500">Total Burned</span>
                                    <span className="font-bold leading-none text-gray-900">
                                        {statsInfo && statsInfo.totalBurned}
                                    </span>
                            </div>
                            <div className="border rounded-lg p-2 flex flex-col gap-2 items-start justify-center">
                                    <span className="text-base uppercase font-normal text-gray-500">Last Block</span>
                                    <span className="font-bold leading-none text-gray-900">
                                        {statsInfo && statsInfo.lastGameBlock}
                                    </span>
                            </div>
                            <div className="border rounded-lg p-2 flex flex-col gap-2 items-start justify-center">
                                    <span className="text-base uppercase font-normal text-gray-500">Current Block</span>
                                    <span className="font-bold leading-none text-gray-900">
                                        {statsInfo && statsInfo.currentGameBlock}
                                    </span>
                            </div>

                            <div className="border rounded-lg p-2 flex flex-col gap-2 items-start justify-center">
                                    <span className="text-base uppercase font-normal text-gray-500">Next Block</span>
                                    <span className="font-bold leading-none text-gray-900">
                                        {statsInfo && statsInfo.nextGameBlock}
                                    </span>
                            </div>

                            <div className="border rounded-lg p-2 flex flex-col gap-2 items-start justify-center">
                                    <span className="text-base uppercase font-normal text-gray-500">Minting Difficulty</span>
                                    <span className="font-bold leading-none text-gray-900">
                                        {statsInfo && statsInfo.pricePerGame} {getNativeCurrencyByChainId(chainId)}
                                    </span>
                            </div>
                        </div>
                        
 

                        <div className="w-full">
                            {gameInfo &&
                                <div className="flex flex-col gap-2">
                                    <span className={"text-pink-960"}>Minters</span>
                                    <div className="w-full grid grid-cols-2 gap-2">
                                        {gameInfo.players.map((player, index) => (
                                            <div className={"w-full hover:bg-gray-50 flex flex-row border p-2 gap-2 rounded-lg"} key={index}>
                                                <Identicon account={player} size={24} />
                                                {player}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                        </div>


                        <div className="w-full">
                            {userPlayedGames &&
                                <div className="flex flex-col gap-2">
                                    <span className={"text-pink-960"}>My Recent Mints</span>
                                    <div className="w-full grid grid-cols-5 sm:grid-cols-2 gap-2">
                                        {userPlayedGames.slice().reverse().map((game, index) => (
                                            <div className={"w-full flex flex-col items-start justify-start text-start border p-2 gap-2 rounded-lg"} key={index}>
                                                <div className="flex flex-col gap-2 w-full p-2">
                                                    <span className="text-sm text-pink-960">Block Range</span>
                                                    <div className="flex flex-row gap-2">
                                                        <span className="text-xs">{BigNumber.from(game.blockStart).toNumber()}</span>
                                                        <span className="text-xs">{BigNumber.from(game.blockEnd).toNumber()}</span>
                                                    </div>
                                        
                                                    <span className="text-sm  text-pink-960">Winner</span>
                                                    <a target="_blank" href={generateExplorerURLByChain(chainId,game.winnerUser,false)} className="flex flex-row gap-2 flex items-center justify-start">
                                                        <Identicon account={game.winnerUser} size={18} />
                                                        <span className="text-xs"> {getShordAccount(game.winnerUser)}</span>
                                                    </a>
                            
                                                    <span className="text-sm text-pink-960">Total Deposit</span>
                                                    <div className="flex flex-col">
                                                        
                                                        <span className="text-xs"> {formatEther(game.totalDeposit)} {getNativeCurrencyByChainId(chainId)}</span>
                                                    </div>
                                     
                                                    <span className="text-sm text-pink-960">Reward Amount</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs"> {formatEther(game.totalReward)} {getNativeCurrencyByChainId(chainId)}</span>
                                                    </div>
                              
                                                    <span className="text-sm text-pink-960">Platform Fee</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs"> {formatEther(game.totalFee)} {getNativeCurrencyByChainId(chainId)}</span>
                                                    </div>
                                         
                                                    <span className="text-sm text-pink-960">Player Count</span>
                                                    <div className="flex flex-col">
                                                        <span  className="text-xs"> {BigNumber.from(game.playerCount).toNumber()}</span>
                                                    </div>
                                                    <div className="w-full">
                                                        
                                                            
                                                            {
                                                                ethers.utils.getAddress(account) !== ethers.utils.getAddress(game.winnerUser) ? <>

                                                                {game.winnerUser === ethers.constants.AddressZero ? <>Pending...</>: <></>} 
                                                                </> :  <>
                                                                {
                                                                    game.claimed ? <>Claimed!</> : <>
                                                                            <button onClick={()=>{
                                                                    handleBurn(game)
                                                                }}  className={"btn btn-primary w-full"}>Claim</button>
                                                                    </>
                                                                }
                                                        
                                                                </>
                                                            }
            
                                                    </div>
                                                </div>
                                                
                                               
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                        </div>

                    </div>

                    <div className={"w-full p-5 bg-white rounded-lg"}>
                        <div className="w-full flex flex-col gap-2">
                            <span>🌶 Chiliz Chain produces a new block every 3 seconds.</span>
                            <span>🌶 Only one mint is won every 20 blocks.</span>
                            <span>🌶 20 blocks will take approximately 1 minute.</span>
                            <span>🌶 Blocks will exist as long as the Chiliz blockchain exists.</span>
                            <span>🌶 Each valid mint transaction receives 1 NFT.</span>
                            <span>🌶 When an NFT is burned, your reward from the reward pool is automatically transferred to your wallet in CHZ.</span>
                            <span>🌶 The next block interval determines the fate of the previous block interval.</span>
                            <span>🌶 The claimed NFT is burned, and the corresponding reward balance is instantly transferred to your wallet.</span>
                            <span>🌶 If you lose a mint in a block, there is no refund; the fee is added to the NFT bid.</span>
                            <span>🌶 If the winner of the NFT does not claim it and puts it up for sale on the market, the person who determines the fate of the previous block interval in the next block interval earns royalties from the sales revenue in the NFT marketplace.</span>
                                                    
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export default ChilimonPage;
