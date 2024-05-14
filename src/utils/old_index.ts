export { computePriceImpact } from './computePriceImpact'
export { sortedInsert } from './sortedInsert'
export { sqrt } from './sqrt'
export { validateAndParseAddress } from './validateAndParseAddress'
import {BigNumber, ethers} from "ethers";
import moment from "moment";
import {BLOCKCHAINS} from "../constants/chains";
import {useFindNetworkByChainId} from "../hooks/useContract";
import {isMobile} from "./userAgent";
import accountPage from "../pages/AccountPage";

export default function jsNumberForAddress (address : string) : number {
    const addr = address.slice(2, 10);
    const seed = parseInt(addr, 16);
    return seed;
}

export function isValidFloatInputValue(value:string){
    return  /^-?\d*[.,]?\d*$/.test(value);
}

export function formatValue(value:string, fixed : boolean, decimal = 2 ) : string{
    value = ethers.utils.formatUnits( value , 6 );
    if( fixed == true )
    {
        let parse = value.split('.');

        value = parse[0] + ( parse[1] && decimal > 0 ? '.' : '') + parse[1].substring(0,decimal);
    }
    return value;
}

function formatNums(num,sep,dec,u){
    sep=sep||',';u=u||'\\d';if(typeof num!='string'){
        num=String(num);
        if(dec&&dec!='.')
            num=num.replace('.',dec);}
    return num.replace(RegExp('\\'+(dec||'.')+u+'+|'+u+'(?=(?:'+u+'{3})+(?!'+u+'))','g'),function(a){
        return a.length==1?a+sep:a})}

export function numberWithCommas(value) {
    return  formatNums(value,',','.','[\\d\\u0660-\\u0669\\u06f0-\\u06f9]');
}
export function getCurrentDateToUnixTime(){
    return moment().unix();
}
export function getDateToUnixTime(date){
    return moment(date).unix().toString();
}
export function unixTimeToDateTimeBN(unixTime:BigNumber){
    var result = "-";
    if (BigNumber.isBigNumber(unixTime) && BigNumber.from(unixTime).gt(0)){
        let periodtime = BigNumber.from( unixTime).toNumber();
        result = moment.unix(periodtime).format("DD-MM-YYYY HH:mm:ss");
    }
    return result;
}
export  function unixTimeToDateTime(unixTime:number) : string{
    return unixTime > 0 ? moment.unix(unixTime).format("DD-MM-YYYY HH:mm:ss") : "-";
}
export function convertTimeStampToDay(startDate:number,timeStamp:number){
    let unixTime = BigNumber.from(startDate).toNumber() + BigNumber.from(timeStamp).toNumber() ;
    return moment.unix(unixTime).format("DD-MM-YYYY HH:mm:ss");
}

export const convertWeiToEther =(price) =>{
    if (!price){
        return "";
    }
    const balanceInWei = (+(price)).toLocaleString("fullwide", { useGrouping: false });
    return ethers.utils.formatUnits(balanceInWei,18);
}

export const convertBNToString =(bn) =>{
    if (!bn){
        return "";
    }
    const balanceInWei = (+(bn)).toLocaleString("fullwide", { useGrouping: false });
    return balanceInWei;
}

export const formatPrice =(price) =>{
    return ethers.utils.formatUnits(price,18);
}


export const generateThumb =(imagePath) =>{
    return imagePath.replaceAll("nfts","thumb");
}

export const getRandomNumber = (min = 0, max = 1, decimal) => {
    let random = Math.random() * (max - min);
    if (!decimal) {
        random = Math.round(random);
    }
    return min + random;
};

export const getTokenLogoBySymbol = (chainId) => {
    return "/images/coins/gem.svg"
}

export const getIconByChainId = (chainId,isAsset = false) => {
    var imagePath = "";
    switch (parseInt(chainId)){
        case parseInt(BLOCKCHAINS.BSC.MAIN.chainId):
        case parseInt(BLOCKCHAINS.BSC.TEST.chainId):
            imagePath = "/images/coins/bsc.svg";
            break;
        case parseInt(BLOCKCHAINS.ETH.MAIN.chainId):
        case parseInt(BLOCKCHAINS.ETH.SEPOLIA.chainId):
        case parseInt(BLOCKCHAINS.ETH.RINKEBY.chainId):
        case parseInt(BLOCKCHAINS.ETH.ROPSTEN.chainId):
        case parseInt(BLOCKCHAINS.ETH.KOVAN.chainId):
        case parseInt(BLOCKCHAINS.ETH.GOERLI.chainId):
            imagePath = "/images/coins/eth.svg";
            break;
        case parseInt(BLOCKCHAINS.CHZ.MAIN.chainId):
            imagePath = "/images/coins/chz.svg";
            break;
        case parseInt(BLOCKCHAINS.AVAX.MAIN.chainId):
        case parseInt(BLOCKCHAINS.AVAX.FUJI.chainId):
            imagePath = "/images/coins/avax.svg";
            break;
        case parseInt(BLOCKCHAINS.OE.MAIN.chainId):
        case parseInt(BLOCKCHAINS.OE.KOVAN.chainId):
            imagePath = isAsset ?  "/images/coins/eth.svg" : "/images/coins/op.svg";
            break;
        case parseInt(BLOCKCHAINS.MATIC.MAIN.chainId):
        case parseInt(BLOCKCHAINS.MATIC.MUMBAI.chainId):
            imagePath = "/images/coins/matic.svg";
            break;
        case parseInt(BLOCKCHAINS.FTM.MAIN.chainId):
        case parseInt(BLOCKCHAINS.FTM.TEST.chainId):
            imagePath = "/images/coins/ftm.svg";
            break;
        case parseInt(BLOCKCHAINS.KCC.MAIN.chainId):
            imagePath = "/images/coins/kcc.svg";
            break;
        case parseInt(BLOCKCHAINS.ARB.MAIN.chainId):
            imagePath =  isAsset ?  "/images/coins/eth.svg" : "/images/coins/arb.svg";
            break;
        case parseInt(BLOCKCHAINS.AURORA.MAIN.chainId):
            imagePath =  isAsset ?  "/images/coins/eth.svg" : "/images/coins/aurora.svg";
            break;
        case parseInt(BLOCKCHAINS.GNOSIS.MAIN.chainId):
            imagePath =  isAsset ?  "/images/coins/gno.svg" : "/images/coins/gnosis.svg";
            break;
        case parseInt(BLOCKCHAINS.TOMO.MAIN.chainId):
            imagePath =  isAsset ?  "/images/coins/tomo.svg" : "/images/coins/tomo.svg";
            break;
        case parseInt(BLOCKCHAINS.CELO.MAIN.chainId):
            imagePath =  "/images/coins/celo.svg";
            break;
        case parseInt(BLOCKCHAINS.HECO.MAIN.chainId):
            imagePath =   isAsset ?  "/images/coins/ht.svg" : "/images/coins/heco.svg";
            break;
        case parseInt(BLOCKCHAINS.GLMR.MAIN.chainId):
            imagePath =  "/images/coins/glmr.svg";
            break;
        case parseInt(BLOCKCHAINS.KLAY.MAIN.chainId):
            imagePath =  "/images/coins/klay.svg";
            break;
        case parseInt(BLOCKCHAINS.BITCI.TEST.chainId):
        case parseInt(BLOCKCHAINS.BITCI.MAIN.chainId):
            imagePath =  "/images/coins/bitci.svg";
            break;
        default:
            imagePath = "/images/coins/error.svg";
            break;
    }
    return imagePath;
}

export const getIconByAsset = (symbol) => {
    var imagePath = "";
    var asset = symbol ? symbol.toLowerCase() : "error";
    imagePath = `/images/coins/${asset}.svg`;
    return imagePath;
}

export function getNativeTokenByChainId(chainId){
    return "BNL";
}

export function getNativeCurrencyInfoByChainId(chainId){
    var nativeCurrencySymbol;
    for (const [CHAIN, NETWORKS] of Object.entries(BLOCKCHAINS)) {
        for (const [NETWORK,NETWORK_DATA] of Object.entries(NETWORKS)) {
            if (parseInt(NETWORK_DATA.chainId) === chainId){
                nativeCurrencySymbol = NETWORK_DATA.nativeCurrency
            }
        }
    }
    return nativeCurrencySymbol;
}

export function getNativeCurrencyByChainId(chainId){
    var nativeCurrencySymbol = "";
    for (const [CHAIN, NETWORKS] of Object.entries(BLOCKCHAINS)) {
        for (const [NETWORK,NETWORK_DATA] of Object.entries(NETWORKS)) {
            if (parseInt(NETWORK_DATA.chainId) === chainId){
                nativeCurrencySymbol = NETWORK_DATA.nativeCurrency.symbol
            }
        }
    }
    return nativeCurrencySymbol;
}

export const getNFTAPIURLByChainId = (chainId,account) => {
    return  `https://testnet2.bitciexplorer.com/api?module=account&action=tokenlist&address=${account}`
}

export const getAssetIconByChainId = (chainId,token) => {
    return  `https://raw.githubusercontent.com/defaulttokenlist/assets/main/bitci/tokens/${token}/logo.svg`
}

export const generateExplorerURLByChain = (chainId,account,isContract = true) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let explorer = useFindNetworkByChainId(chainId).networkData.blockExplorerUrls[0]
    const assetType = isContract ? "/token/" : "/address/";
    explorer = `${explorer}${assetType}${account}`;
    return explorer;
}


export const getShordAccountForMobile = (account) => {
    return isMobile ? account.substring(0, 8) + "..." + account.substring(account.length - 8) : account
}

export const getShordAccount = (account) => {
    if(!account) return "Unknown"
    return  account.substring(0, 6) + "..." + account.substring(account.length - 4)
}

export const randomNumber = (min = 1, max = 9) => {
    return Math.floor(Math.random() * max) + min;
}
export const generateRandomTailwindColor = (index) => {
    const colors = [
        "stone",
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose"
    ]
    const adjustedIndex = index % colors.length;
    const colorIndex =  adjustedIndex === 0 ? colors.length-1 : adjustedIndex;
    const number = randomNumber(1, 9) * 100;
    return `bg-${colors[colorIndex]}-100 text-${colors[colorIndex]}-600`;
}

export const generateRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateRandomIntNum = (max = 100) => Math.floor(Math.random() * max)

export const checkWinner = (items,cardNo) => {
    let bfound = false;
    for(let i = 0; i< items.length; i++){
        if(BigNumber.from(items[i]).toNumber() == BigNumber.from(cardNo).toNumber()){
            bfound = true;
        }
    }
    return bfound;
}

export const saveState = (storageKey,items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
}

export const loadState = (storageKey) => {
    return JSON.parse(localStorage.getItem(storageKey));
}

export const blockNoToAddress = (blockNo) => {
    return ethers.utils.ripemd160(ethers.utils.namehash(blockNo.toString()))
}

export const blockToTimeStamp = (blockNumber,gameBlockNumber,currentGameBlock,gameBlockRange) => {
    if(!blockNumber){return "00:00"}
    const estimatedDelayPerBlock = 3.1
    const gameRange = 100;
    const totalDelayPerBlock = gameRange*estimatedDelayPerBlock;
    const nextGameRange = (gameBlockNumber - currentGameBlock) - gameBlockRange
    let estimated = moment(new Date()).add(nextGameRange*estimatedDelayPerBlock, 'seconds').format('HH:mm:ss')
    return estimated.toString()
}

export const getNFTItemType = (itemType) =>{
    let itemTypeStr = "UNKNOWN";
    if(itemType === 3 ){
        itemTypeStr = "ERC-1155"
    } else if(itemType === 2 ){
        itemTypeStr = "ERC-721"
    }else if(itemType === "ERC-1155" ){
        itemTypeStr = itemType
    }else if(itemType === "ERC-721" ){
        itemTypeStr = itemType
    }
    return itemTypeStr;
}


export const convertToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

export function convertURLToIPFS(url) {
    const parts = url.split('/');
    const hash = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    return `ipfs://${hash}/${filename}`;
}

export function utf8ToBase64(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    // @ts-ignore
    const base64 = btoa(String.fromCharCode.apply(null, data));
    return base64;
}

export const generateTweetText = (promptItem) =>{
    let imageURL = uriToHttp(promptItem.ipfs)[0]
    let tweetURL = "https://twitter.com/intent/tweet?text="
    let tweetParams = "Check out this IMON prompt on "
    let imonURL = `&url=https://kewl.exchange/ai/${promptItem.owner}&via=imondotai&hashtags=IMON,IntelligentMonsters,AI,BITCI`
    return `${tweetURL}${tweetParams}${imonURL}`
}

export const  parseFloatWithDefault = (value: string, defaultValue: number) => {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? defaultValue : parsedValue;
}
