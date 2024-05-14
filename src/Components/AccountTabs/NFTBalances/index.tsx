import React, { useEffect, useState, useRef } from 'react';
import { useWeb3React } from "@web3-react/core";
import { MORALIS_API_KEY } from '../../../constants/ai';
import { NFTLoading } from '../../NFTLoading';
import { AccountNFTItem } from '../../AccountNFTItem';
import { ChainId, DEFAULT_BITCI_CHAIN_NFT_URL } from '../../../constants/chains';
import { ethers } from 'ethers';
import { useNFT1155Contract, useNFT721Contract, useStandardNFT721Contract } from '../../../hooks/useContract';
import useBlockNumber from '../../../hooks/useBlockNumber';
import { hexZeroPad } from 'ethers/lib/utils';
import {Badge} from "@nextui-org/react";
export const NFTBalances = (props: {account})=> {
    const [defaultAssets,setDefaultAssets] = useState(null)
    const { connector, account, provider, chainId } = useWeb3React()
    const blockNumber = useBlockNumber()
    const IMON_1155NFTContract = useNFT1155Contract()
    const IMON_721NFTContract = useNFT721Contract();
    const STANDARD_721NFTContract = useStandardNFT721Contract();

    const fetchNFTsMoralis = async ()=>{
        var _userNFTAssets = [];
        let account = props.account
        if(!account){
            return
        }
        let url = ""
        if(chainId === ChainId.CHILIZ_SPICY_TESTNET){
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=chiliz%20testnet&format=decimal&media_items=false`
        }else if (chainId === ChainId.CHILIZ_MAINNET){
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=chiliz&format=decimal&media_items=false`
        }else if (chainId === ChainId.ARBITRUM_ONE){
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=arbitrum&format=decimal&media_items=false`
        }else{
            return;
        }
        const options = {
            method: 'GET', // or 'POST', 'PUT', etc.
            headers: {
              'X-Moralis-Application-Id': "IMON",
              'X-API-Key': MORALIS_API_KEY,
              'Content-Type': 'application/json',
            },
          };
        fetch(url, options)
        .then(response => response.json())
        .then(data => {
            if(!data){return}

            console.log("API_ REUSLTS",data)
            for (const token of data.result) {
                _userNFTAssets.push({amount:token.amount, name: token.name, contract: token.token_address, id: token.token_id, type: token.contract_type === 'ERC721' ? 'ERC-721' : token.contract_type === 'ERC1155' ? "ERC-1155" : "ERC-721" })
            }
            setDefaultAssets(_userNFTAssets);
        })
        .catch(error => console.error('Error:', error));
        }

    const fetchBitciBalances = async () => {
        var _userNFTAssets = [];
        var erc1155Tokens = [];
        var erc721Tokens = [];

        const userAccount = props.account
        const _defaultNFTs = await (
            await fetch(
                DEFAULT_BITCI_CHAIN_NFT_URL
            )
        ).json();
        const defaultNFTList = _defaultNFTs.nfts;


        defaultNFTList.map((token, index) => {
            if (token.type === "ERC-1155") {
                const is1155Exists = erc1155Tokens.findIndex(tokenItem => tokenItem.address === token.address) > -1;
                if (!is1155Exists) {
                    erc1155Tokens.push({ name: token.name, address: token.address })
                }
            } else if (token.type === "ERC-721") {
                const check721Exists = erc721Tokens.findIndex(tokenItem => tokenItem.address === token.address) > -1;
                if (!check721Exists) {
                    erc721Tokens.push({ name: token.name, address: token.address })
                }
            }
        });

        const imon721TokenIDList = [];

        await Promise.all(erc721Tokens.map(async (token) => {
            const erc721Contract = await STANDARD_721NFTContract(token.address);
            const logs = await provider.getLogs({
                fromBlock: 0,
                toBlock: blockNumber,
                address: erc721Contract.address,
                topics: [[
                    ethers.utils.id("Transfer(address,address,uint256)"),
                    null,
                    hexZeroPad(userAccount, 32)]]
            })
            for await (const log of logs) {
                try {
                    const parsedLog = erc721Contract.interface.parseLog(log);
                    if (parsedLog.name === "Transfer") {
                        if (ethers.utils.getAddress(parsedLog.args.to.toString()) == ethers.utils.getAddress(userAccount)) {
                            const tokenId = `${parsedLog.args.tokenId}`;
                            const ownerOf = await erc721Contract.ownerOf(tokenId);
                            if (ethers.utils.getAddress(ownerOf) === ethers.utils.getAddress(userAccount)) {
                                _userNFTAssets.push({ name: token.name, contract: token.address, id: tokenId, type: 'ERC-721' })
                            }
                        }
                    }
                } catch (exception) {
                }
            }
        }));


        const imon1155NFTTokenIds = [];
        for await (const collection of erc1155Tokens) {
            const NFTContract = await IMON_1155NFTContract(collection.address);
            const logs = await provider.getLogs({
                fromBlock: 0,
                toBlock: blockNumber,
                address: NFTContract.address
            })
            for (const log of logs) {
                const parsedLog = NFTContract.interface.parseLog(log);
                if (parsedLog.name === "TransferSingle") {
                    const tokenId = parsedLog.args.id;
                    if (!imon1155NFTTokenIds.includes(`${tokenId}`)) {
                        imon1155NFTTokenIds.push(`${tokenId}`);
                    }
                }
            }

            try {
                const user1155Balances = await NFTContract.balanceOfBatch(Array(imon1155NFTTokenIds.length).fill(userAccount), imon1155NFTTokenIds);
                user1155Balances.map((balance, index) => {
                    if (balance > 0) {
                        _userNFTAssets.push({ name: collection.name, contract: collection.address, id: `${imon1155NFTTokenIds[index]}`, type: 'ERC-1155' })
                    }
                })

            } catch (ex) {

            }

        }

        setDefaultAssets(_userNFTAssets)


    }

        
    const fetchAssets = async () => {
        setDefaultAssets(null);
        await fetchNFTsMoralis();
    }
    useEffect(()=>{
        if([ChainId.BITCI,ChainId.BITCI_TEST].includes(chainId)){
            fetchBitciBalances()
        }else{
            fetchNFTsMoralis();
        }
    },[props.account])

    return (
        <div className={"w-full flex gap-2 flex-col"}>
            {
                defaultAssets && defaultAssets.map((nftItem, index) => {
                    return (
                            <AccountNFTItem tokenAmount={nftItem?.amount} reloadFunction={fetchAssets} showMetadata={true} canSell={true} key={`nftItemIndex${index}`} itemType={nftItem.type} contractAddress={nftItem.contract} tokenId={nftItem.id} />
                    )
                })
            }
            {
                !defaultAssets && <NFTLoading/>
            }
        </div>
    );
}
