import IRoute from "../interfaces/route";

import AboutPage from "../pages/AboutPage";
import HomePage from "../pages/HomePage";
import StakePage from "../pages/StakePage";
import MintPage from "../pages/MintPage";
import BurnPage from "../pages/BurnPage";
import DAOPage from "../pages/DAOPage";
import CreateProposalPage from "../pages/CreateProposalPage";
import ProposalPage from "../pages/ProposalPage";
import AccountPage from "../pages/AccountPage";
import UnstakePage from "../pages/UnstakePage";
import TestPage from "../pages/TestPage";
import WrapPage from "../pages/WrapPage";
import NFTs from "../pages/NFTs";
import NFTDetail from "../pages/NFTs/NFTDetail";
import NFTCollection from "../pages/NFTs/NFTCollection";
import AirdropPage from "../pages/AirdropPage";
import CreatePage from "../pages/CreatePage";
import AIPage from "../pages/AIPage";
import SwapPage from "../pages/SwapPage";
import TestTrade from "../pages/TestTrade";
import FarmPage from "../pages/FarmPage";
import CreateLaunchPage from "../pages/Launchpad/Create";
import LaunchpadPage from "../pages/Launchpad";
import GamesPage from "../pages/Games/index";
import ChilimonPage from "../pages/Games/Chilimotion";
import PlinkoGamePage from "../pages/Games/plinko";
import DomainsHomePage from "../pages/DomainsHomePage";
import { isCHZDomains, isIMON } from "../hooks/useDomains";
import RegisterDomainPage from "../pages/RegisterDomainPage";
import MyDomainsPage from "../pages/RegisterDomainPage/MyDomains";
import ManageDomainsPage from "../pages/RegisterDomainPage/ManagePage";
import NFTStake from "../pages/NFTs/NFTStake";
import NFTLaunch from "../pages/Launchpad/NFTLaunch";
import NFTDistributor from "../pages/Launchpad/Distributor";
import NFTSoccerGame from "../pages/Launchpad/NFTLaunch/NFTSoccerGame";
import IPFSUploadPage from "../pages/IPFSUploadPage";
import BridgePage from "../pages/Bridge";
import TokenMintPage from "../pages/TokenMintPage";
import ChiliStrikePage from "../pages/Games/ChiliAtor";
import FanTokenNFTWrapperPage from "../pages/MetamorphPage";
import MetamorphPage from "../pages/MetamorphPage";
import ChiliAtorPage from "../pages/Games/ChiliAtor";
import ExplorerPage from "../pages/ExplorerPage";
import OldSwapPage from "../pages/OldSwapPage";
import ChartPage from "../pages/ExplorerPage/ChartPage";
import PlatformEarningsPage from "../pages/PlatformEarnings";
import MigratePage from "../pages/MigratePage";
import StakeProofPage from "../pages/StakeProofPage";
import ListingPage from "../pages/ListingPage";
import TOSPage from "../pages/TosPage";
import VestingPage from "../pages/VestingPage";
import PredictionsPage from "../pages/PredictionsPage";
import OldStakePage from "../pages/StakePage/oldstake";
import PepperPage from "../pages/PepperPage";
import TokenInfo from "../pages/TokenInfo";
import HopPage from "@/pages/HopPage";
import ReflectionPage from "@/pages/ReflectionPage";
import FANPAGE from "@/pages/FanPage";
import ETFPAGE from "@/pages/ETFPage";

const routes: IRoute[] = [
    { path: "/", name: "HomePage", title: 'Home', component: isIMON() ? HomePage : isCHZDomains() ? DomainsHomePage : GamesPage, exact: true, full: true },
    { path: "/testtrade", name: "TradePage", title: 'Trade', component: TestTrade, exact: true, full: false },
    { path: "/create", name: "CreatePage", title: 'Create NFT', component: CreatePage, exact: true, full: false },
    { path: "/nfts", name: "NFTs", title: 'NFTs', component: NFTs, exact: true, full: true },
    { path: "/nfts/stake", name: "Stake Page", title: 'Stake', component: NFTStake, exact: true, full: true },
    { path: "/nfts/stake/:collectionId", name: "Stake Page", title: 'Stake', component: NFTStake, exact: true, full: true },
    { path: "/nfts/:contract/:tokenId", name: "NFTDetails", title: 'NFT Details', component: NFTDetail, exact: true, full: true },
    { path: "/nfts/:collectionId", name: "NFTCollection", title: 'NFT Collection', component: NFTCollection, exact: true, full: true },
    { path: "/stake", name: "Stake Page", title: 'Stake', component: StakePage, exact: true, full: false },
    { path: "/stakeproof", name: "Stake Proof Page", title: 'Stake Proofs', component: StakeProofPage, exact: true, full: false },
    { path: "/listing", name: "Listing Page", title: 'Listing', component: ListingPage, exact: true, full: false },
    { path: "/metamorph", name: "Metamorph", title: 'Metamorph', component: MetamorphPage, exact: true, full: false },
    { path: "/migrate", name: "Migrate", title: 'Migrate', component: MigratePage, exact: true, full: false },
    { path: "/platformearnings", name: "Platform Earnings", title: 'Platform Earnings', component: PlatformEarningsPage, exact: true, full: false },
    { path: "/explorer", name: "Pair Explorer", title: 'Pair Explorer', component: ExplorerPage, exact: true, full: true },
    { path: "/explorer/:pair", name: "Pair Explorer", title: 'Chart', component: ChartPage, exact: true, full: true },
    { path: "/account", name: "AccountPage", title: 'Account', component: AccountPage, exact: true, full: false },
    { path: "/dao", name: "DAOPage", title: 'DAO', component: DAOPage, exact: true, full: false },
    { path: "/dao/create", name: "CreateProposalPage", title: 'Create Proposal', component: CreateProposalPage, exact: true, full: false },
    { path: "/dao/:address", name: "ProposalPage", title: 'View Proposal', component: ProposalPage, exact: true, full: false },
    { path: "/ai", name: "AIPage", title: 'Artificial Intelligence', component: AIPage, exact: true, full: false },
    { path: "/ai/:address", name: "AIPage", title: 'Artificial Intelligence', component: AIPage, exact: true, full: false },
    { path: "/about", name: "AboutPage", title: 'About', component: AboutPage, exact: true, full: false },
    { path: "/earn", name: "StakePage", title: 'Earn', component: StakePage, exact: true, full: false },
    { path: "/earn/stake", name: "StakePage", title: 'Stake', component: StakePage, exact: true, full: false },
    { path: "/earn/unstake", name: "UnstakePage", title: 'Unstake', component: UnstakePage, exact: true, full: false },
    { path: "/mint", name: "MintPage", title: 'Mint', component: MintPage, exact: true, full: false },
    { path: "/burn", name: "BurnPage", title: 'Burn', component: BurnPage, exact: true, full: false },
    { path: "/wrap", name: "WrapPage", title: 'Wrap', component: WrapPage, exact: true, full: false },
    { path: "/swap", name: "SwapPage", title: 'Swap', component: SwapPage, exact: true, full: false },
    { path: "/oldswap", name: "OldSwap", title: 'Swap', component: OldSwapPage, exact: true, full: false },
    { path: "/oldstake", name: "OldStake", title: 'Swap', component: OldStakePage, exact: true, full: false },
    { path: "/farms", name: "FarmPage", title: 'Farms', component: FarmPage, exact: true, full: false },
    { path: "/launchpad", name: "LaunchpadPage", title: 'Launchpad', component: LaunchpadPage, exact: true, full: false },
    { path: "/launchpad/nft", name: "NFTLaunchpadPage", title: 'INO - Initial NFT Offering', component: NFTLaunch, exact: true, full: false },
    { path: "/launchpad/create", name: "LaunchpadPage", title: 'Create Launchpad', component: CreateLaunchPage, exact: true, full: false },
    { path: "/launchpad/nft", name: "NFTLaunchpadPage", title: 'INO - Initial NFT Offering', component: NFTLaunch, exact: true, full: false },
    { path: "/launchpad/dist", name: "NFDistributor", title: 'NFT Distributor', component: NFTDistributor, exact: true, full: false },
    { path: "/launchpad/nftsoccergames", name: "NFT Soccer Games", title: 'INO - NFT Soccer Games', component: NFTSoccerGame, exact: true, full: false },
    { path: "/launchpad/:path", name: "Launchpad", title: 'Launchpad', component: LaunchpadPage, exact: true, full: false },
    { path: "/games", name: "GamesPage", title: 'Games', component: GamesPage, exact: true, full: false },
    { path: "/games/plinko", name: "PlinkoGamePage", title: 'Plinko Game', component: PlinkoGamePage, exact: true, full: false },
    { path: "/games/chilimotion", name: "ChilimonPage", title: 'Chilimon', component: ChilimonPage, exact: true, full: false },
    { path: "/games/chiliator", name: "ChiliAtorGame", title: 'ChiliAtor Game', component: ChiliAtorPage, exact: true, full: false },
    { path: "/cns", name: "CNSPage", title: 'CHZ Domains', component: RegisterDomainPage, exact: true, full: false },
    { path: "/cns/domains", name: "DomainsPage", title: 'My Domains', component: MyDomainsPage, exact: true, full: false },
    { path: "/cns/manage", name: "ManageDomainsPage", title: 'Domain Management', component: ManageDomainsPage, exact: true, full: false },
    { path: "/airdrop", name: "Airdrop Page", title: 'Airdrop', component: AirdropPage, exact: true, full: false },
    { path: "/ipfs", name: "IPFS Uploader", title: 'IPFS Uploader', component: IPFSUploadPage, exact: true, full: false },
    { path: "/test", name: "Test Page", title: 'Test', component: TestPage, exact: true, full: false },
    { path: "/bridge", name: "Bridge Page", title: 'Bridge', component: BridgePage, exact: true, full: false },
    { path: "/imon404", name: "ERC 404", title: 'ERC 404', component: TokenMintPage, exact: true, full: false },
    { path: "/tos", name: "Terms Of Service", title: 'Terms Of Service', component: TOSPage, exact: true, full: false },
    { path: "/vesting", name: "Vesting", title: 'Vesting', component: VestingPage, exact: true, full: false },
    { path: "/euro2024", name: "Football Predictions", title: 'EURO 2024 Football Predictions', component: PredictionsPage, exact: true, full: false },
    { path: "/pepper", name: "PEPPER Claims", title: 'PEPPER Claims', component: PepperPage, exact: true, full: false },
    { path: "/token", name: "Token Info", title: 'Token Info', component: TokenInfo, exact: true, full: false },
    { path: "/reflection", name: "KEWL Reflection", title: 'KEWL Reflection', component: ReflectionPage, exact: true, full: false },
    { path: "/fan", name: "KEWL FAN", title: 'KEWL FAN', component: FANPAGE, exact: true, full: false },
    { path: "/etf", name: "KEWL ETF", title: 'KEWL ETF', component: ETFPAGE, exact: true, full: false }
  ];

  
export default routes;
