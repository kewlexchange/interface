import { motion, useScroll, useTransform } from 'framer-motion';
import IPage from "../../interfaces/page";
import React, { useEffect, useRef } from "react";
import { 
    Zap, 
    LineChart, 
    Brain, 
    Shield, 
    Clock, 
    Coins,
    Activity,
    BarChart4,
    Network,
    Lock,
    Palette,
    Rocket,
    ShieldCheck,
    Gem,
    Timer,
    Layers
} from 'lucide-react';

interface HexagonIconProps {
    children: React.ReactNode;
    glowColor?: string;
    className?: string;
}

const HexagonIcon: React.FC<HexagonIconProps> = ({ 
    children, 
    glowColor = "from-violet-500/20",
    className = ""
}) => (
    <div className={`relative group flex items-center justify-center w-20 h-20 ${className}`}>
        {/* Alien tech container */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Enhanced holographic glow */}
            <div className={`absolute inset-0 ${glowColor} opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-700`} />
            
            {/* Alien tech border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent rotate-180 group-hover:rotate-360 transition-all duration-2000" />
            
            {/* Enhanced Icon container with advanced glass effect */}
            <div className="relative flex items-center justify-center transform transition-all duration-500 will-change-transform">
                {/* Futuristic background with scanning effect */}
                <div className="absolute inset-0 before:absolute before:inset-0 before:bg-gradient-to-t before:from-violet-500/10 before:via-transparent before:to-transparent before:animate-scan">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent rounded-xl backdrop-blur-md border border-white/[0.08]" />
                </div>
                
                {/* Enhanced Icon wrapper with holographic effect */}
                <div className="relative z-10 p-4 transform group-hover:scale-110 transition-all duration-700 will-change-transform">
                    <div className="relative group-hover:animate-float">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const SmallHexagonIcon: React.FC<HexagonIconProps> = ({ 
    children, 
    glowColor = "from-violet-500/20",
    className = ""
}) => (
    <div className={`relative group flex items-center justify-center w-14 h-14 ${className}`}>
        {/* Base container */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Enhanced Background glow */}
            <div className={`absolute inset-0 ${glowColor} opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500`} />
            
            {/* Enhanced Icon container with glass effect */}
            <div className="relative flex items-center justify-center transform transition-transform duration-300 will-change-transform">
                {/* Enhanced Icon background with improved glass effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-lg backdrop-blur-md border border-white/[0.05]" />
                
                {/* Enhanced Icon wrapper with smooth hover effect */}
                <div className="relative z-10 p-3 transform group-hover:scale-105 transition-all duration-500 will-change-transform">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

interface WalletOption {
    id: string;
    name: string;
    icon: string;
    description: string;
    popular?: boolean;
    comingSoon?: boolean;
}

const walletOptions: WalletOption[] = [
    {
        id: 'metamask',
        name: 'MetaMask',
        icon: '/images/wallets/metamask-icon.svg',
        description: 'The most popular Web3 wallet with 30M+ users worldwide',
        popular: true
    },
    {
        id: 'trustwallet',
        name: 'Trust Wallet',
        icon: '/images/wallets/trustwallet-icon.svg',
        description: 'The most trusted & secure crypto wallet',
        popular: true
    },
    {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '/images/wallets/walletconnect-icon.svg',
        description: 'Open protocol for connecting wallets',
    },
    {
        id: 'coin98',
        name: 'Coin98',
        icon: '/images/wallets/coin98.svg',
        description: 'All-in-one DeFi solution',
    },
    {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '/images/wallets/coinbase-icon.svg',
        description: 'Professional-grade crypto wallet',
    },
    {
        id: 'uniswap',
        name: 'UniSwap Wallet',
        icon: '/images/wallets/uniswap-wallet-icon.png',
        description: 'Trade and swap directly from your wallet',
    }
];

const HomePage: React.FunctionComponent<IPage> = props => {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    const logoScale = useTransform(scrollY, [0, 300], [1, 0.8]);
    const logoOpacity = useTransform(scrollY, [0, 300], [1, 0.9]);

    const features = [
        {
            title: 'NFT Marketplace',
            gradient: 'from-violet-900/10',
            items: [
                {
                    title: 'Trending Collections',
                    description: 'Discover and trade the hottest NFT collections',
                    stats: ['24h Volume: $2.5M', '7d Volume: $18.3M'],
                    image: '🖼️'
                },
                {
                    title: 'Easy Trading',
                    description: 'Buy and sell NFTs with just a few clicks',
                    stats: ['Instant Listings', 'Secure Transactions'],
                    image: '💱'
                },
                {
                    title: 'Creator Tools',
                    description: 'Launch your own NFT collection effortlessly',
                    stats: ['Custom Minting', 'Royalty Support'],
                    image: '🎨'
                }
            ]
        },
        {
            title: 'Launchpad',
            gradient: 'from-purple-900/10',
            items: [
                {
                    title: 'Upcoming Projects',
                    description: 'Get early access to promising token sales',
                    stats: ['Success Rate: 100%', 'Avg. ROI: 312%'],
                    image: '🚀'
                },
                {
                    title: 'Staking Pools',
                    description: 'Stake KEWL tokens for guaranteed allocation',
                    stats: ['APY up to 25%', 'Flexible Lock Periods'],
                    image: '📈'
                },
                {
                    title: 'Project Vetting',
                    description: 'Thorough due diligence on all launches',
                    stats: ['KYC Required', 'Smart Contract Audit'],
                    image: '✅'
                }
            ]
        },
        {
            title: 'Token Vesting',
            gradient: 'from-pink-900/10',
            items: [
                {
                    title: 'Smart Vesting',
                    description: 'Automated token distribution schedules',
                    stats: ['Multi-sig Security', 'Real-time Tracking'],
                    image: '⏱️'
                },
                {
                    title: 'Team Management',
                    description: 'Manage team token allocations efficiently',
                    stats: ['Role-based Access', 'Transparent Timeline'],
                    image: '👥'
                },
                {
                    title: 'Compliance Tools',
                    description: 'Stay compliant with vesting regulations',
                    stats: ['Audit Logs', 'Legal Framework'],
                    image: '📋'
                }
            ]
        },
        {
            title: 'DEX & Swap',
            gradient: 'from-rose-900/10',
            items: [
                {
                    title: 'Lightning Swaps',
                    description: 'Instant token exchanges at best rates',
                    stats: ['0.1% Slippage', 'Deep Liquidity'],
                    image: '⚡'
                },
                {
                    title: 'Cross-chain Bridge',
                    description: 'Seamless asset transfer across chains',
                    stats: ['10+ Chains', 'Secure Bridge'],
                    image: '🌉'
                },
                {
                    title: 'Yield Farming',
                    description: 'Earn rewards by providing liquidity',
                    stats: ['High APY', 'Auto-compound'],
                    image: '🌾'
                }
            ]
        }
    ];

    const swapFeatures = [
        {
            title: 'Lightning-Fast Swaps',
            description: 'Execute trades in milliseconds with our optimized routing system and advanced MEV protection',
            icon: '⚡',
            stats: [
                { value: '0.1s', label: 'Execution Time' },
                { value: '0.01%', label: 'Min Slippage' },
                { value: '100+', label: 'Token Pairs' }
            ],
            highlight: 'Fastest DEX in the market',
            gradient: 'from-violet-500/20 to-purple-500/20'
        },
        {
            title: 'Best Trading Rates',
            description: 'Smart order routing across multiple liquidity pools ensures you always get the best possible price',
            icon: '📈',
            stats: [
                { value: '99.9%', label: 'Price Accuracy' },
                { value: '$2B+', label: 'Daily Volume' },
                { value: '0.1%', label: 'Trading Fee' }
            ],
            highlight: 'Save on every trade',
            gradient: 'from-purple-500/20 to-pink-500/20'
        },
        {
            title: 'Cross-Chain Bridge',
            description: 'Seamlessly swap assets across multiple blockchains with institutional-grade security',
            icon: '🌉',
            stats: [
                { value: '10+', label: 'Chains' },
                { value: '100%', label: 'Security' },
                { value: '24/7', label: 'Support' }
            ],
            highlight: 'True cross-chain freedom',
            gradient: 'from-pink-500/20 to-rose-500/20'
        }
    ];

    const tradingAdvantages = [
        {
            title: 'Institutional-Grade DEX',
            description: 'Professional trading infrastructure with deep liquidity and advanced order types',
            icon: '🏛️',
            metrics: [
                { value: '$10B+', label: 'Liquidity Depth' },
                { value: '500ms', label: 'Order Execution' },
                { value: '100+', label: 'Trading Pairs' }
            ],
            highlight: 'Enterprise Trading Solution'
        },
        {
            title: 'Smart Order Routing',
            description: 'AI-powered routing across multiple liquidity pools for best execution price',
            icon: '🔄',
            metrics: [
                { value: '0.01%', label: 'Price Impact' },
                { value: '99.9%', label: 'Fill Rate' },
                { value: '5+', label: 'DEX Aggregation' }
            ],
            highlight: 'Best-in-Class Pricing'
        },
        {
            title: 'Cross-Chain Architecture',
            description: 'Seamless trading across major blockchains with unified liquidity',
            icon: '⛓️',
            metrics: [
                { value: '12+', label: 'Networks' },
                { value: '1-Click', label: 'Bridge' },
                { value: '100%', label: 'Security' }
            ],
            highlight: 'Unified Trading Experience'
        }
    ];

    const tradingFeatures = [
        {
            title: 'Smart Swap',
            icon: <Zap className="w-8 h-8 text-violet-200 transition-colors duration-300" />,
            description: 'Optimize your trades across all liquidity pools in the ecosystem for maximum returns',
            metrics: [
                { 
                    value: '0.1s', 
                    label: 'Execution Time',
                    icon: <Clock className="w-5 h-5 text-violet-200 transition-colors duration-300" />,
                    glowColor: 'from-violet-400/40 to-fuchsia-400/40'
                },
                { 
                    value: '100+', 
                    label: 'Liquidity Pools',
                    icon: <Layers className="w-6 h-6 text-violet-300" />,
                    glowColor: 'from-blue-400/40 to-violet-400/40'
                },
                { 
                    value: '0.01%', 
                    label: 'Min Slippage',
                    icon: <Activity className="w-6 h-6 text-violet-300" />,
                    glowColor: 'from-fuchsia-400/40 to-pink-400/40'
                }
            ],
            highlight: 'Best execution guaranteed',
            gradient: 'from-violet-400/10 via-fuchsia-400/10 to-pink-400/10'
        },
        {
            title: 'NFT Market',
            icon: <Palette className="w-10 h-10 text-rose-200 drop-shadow-[0_0_10px_rgba(251,113,133,0.3)]" />,
            description: 'Trade exclusive NFTs with zero platform fees and instant settlements',
            metrics: [
                { 
                    value: '10K+', 
                    label: 'Collections',
                    icon: <Gem className="w-6 h-6 text-rose-300" />,
                    glowColor: 'from-rose-400/40 to-orange-400/40'
                },
                { 
                    value: '0%', 
                    label: 'Platform Fee',
                    icon: <Coins className="w-6 h-6 text-rose-300" />,
                    glowColor: 'from-orange-400/40 to-amber-400/40'
                },
                { 
                    value: '100%', 
                    label: 'Verified',
                    icon: <ShieldCheck className="w-6 h-6 text-rose-300" />,
                    glowColor: 'from-amber-400/40 to-yellow-400/40'
                }
            ],
            highlight: 'Zero Fee NFT Trading',
            gradient: 'from-rose-400/10 via-orange-400/10 to-amber-400/10'
        },
        {
            title: 'Token Vesting',
            icon: <Timer className="w-10 h-10 text-cyan-300" />,
            description: 'Secure and transparent token vesting solution for teams and investors',
            metrics: [
                { 
                    value: '100%', 
                    label: 'Automated',
                    icon: <Activity className="w-6 h-6 text-cyan-300" />,
                    glowColor: 'from-cyan-400/40 to-teal-400/40'
                },
                { 
                    value: '24/7', 
                    label: 'Monitoring',
                    icon: <BarChart4 className="w-6 h-6 text-cyan-300" />,
                    glowColor: 'from-teal-400/40 to-emerald-400/40'
                },
                { 
                    value: '0 Risk', 
                    label: 'Smart Contract',
                    icon: <ShieldCheck className="w-6 h-6 text-cyan-300" />,
                    glowColor: 'from-emerald-400/40 to-green-400/40'
                }
            ],
            highlight: 'Enterprise-grade vesting',
            gradient: 'from-cyan-400/10 via-teal-400/10 to-emerald-400/10'
        },
        {
            title: 'Launchpad',
            icon: <Rocket className="w-10 h-10 text-indigo-300" />,
            description: 'Launch your project with institutional-grade infrastructure and support',
            metrics: [
                { 
                    value: '20+', 
                    label: 'Successful IDOs',
                    icon: <Rocket className="w-6 h-6 text-indigo-300" />,
                    glowColor: 'from-indigo-400/40 to-blue-400/40'
                },
                { 
                    value: '$50M+', 
                    label: 'Total Raised',
                    icon: <Coins className="w-6 h-6 text-indigo-300" />,
                    glowColor: 'from-blue-400/40 to-sky-400/40'
                },
                { 
                    value: '100%', 
                    label: 'Success Rate',
                    icon: <ShieldCheck className="w-6 h-6 text-indigo-300" />,
                    glowColor: 'from-sky-400/40 to-cyan-400/40'
                }
            ],
            highlight: 'Your gateway to success',
            gradient: 'from-indigo-400/10 via-blue-400/10 to-sky-400/10'
        }
    ];

    const tradingMetrics = [
        {
            title: 'Lightning Fast Swaps',
            icon: <Zap className="w-6 h-6 text-violet-400" />,
            metrics: [
                { value: '0.1s', label: 'Execution Time', icon: <Clock className="w-4 h-4" /> },
                { value: '0.01%', label: 'Min Slippage', icon: <Activity className="w-4 h-4" /> },
                { value: '100+', label: 'Token Pairs', icon: <Coins className="w-4 h-4" /> }
            ]
        },
        {
            title: 'Best Trading Rates',
            icon: <LineChart className="w-6 h-6 text-violet-400" />,
            metrics: [
                { value: '99.9%', label: 'Price Accuracy', icon: <BarChart4 className="w-4 h-4" /> },
                { value: '$2B+', label: 'Daily Volume', icon: <Activity className="w-4 h-4" /> },
                { value: '0.1%', label: 'Trading Fee', icon: <Coins className="w-4 h-4" /> }
            ],
            highlight: 'Save on every trade'
        },
        {
            title: 'Cross-Chain Bridge',
            icon: <Brain className="w-6 h-6 text-violet-400" />,
            metrics: [
                { value: '10+', label: 'Chains', icon: <Network className="w-4 h-4" /> },
                { value: '100%', label: 'Security', icon: <Shield className="w-4 h-4" /> },
                { value: '24/7', label: 'Support', icon: <Lock className="w-4 h-4" /> }
            ],
            description: 'Seamlessly swap assets across multiple blockchains with institutional-grade security',
            highlight: 'True cross-chain freedom'
        }
    ];

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
        
        // Enhanced scroll management
        const body = document.body;
        body.style.overflowX = 'hidden';
        body.style.scrollBehavior = 'smooth';
        
        return () => {
            body.style.overflowX = 'auto';
            body.style.scrollBehavior = 'auto';
        };
    }, []);

    // Ana renk değişiklikleri için örnekler:

    // 1. Gradient renk düzenlemeleri
    const gradientClasses = {
        primary: "from-violet-500/20 to-purple-500/20",
        secondary: "from-violet-400/20 to-fuchsia-400/20",
        accent: "from-fuchsia-400/20 to-pink-400/20",
        glass: "from-white/[0.02] to-transparent",
        glow: "from-violet-500/10 via-fuchsia-500/10 to-pink-500/10"
    };

    // 2. Border ve background renk düzenlemeleri
    const borderClasses = {
        default: "border-white/[0.05]",
        hover: "border-violet-500/20",
        active: "border-violet-600/30"
    };

    const bgClasses = {
        card: "bg-[#0A0A1B]/60",
        button: "bg-violet-500/[0.02]",
        hover: "bg-violet-500/[0.08]"
    };

    return (
        <div className="relative w-full min-h-screen">
            {/* Main Content - Adjusted top padding for mobile */}
            <main className="relative rounded-lg">
                {/* Hero Section */}
                <section className="relative flex flex-col items-center justify-center px-4 sm:px-6 min-h-[90vh] sm:min-h-screen">
                    {/* Alien tech background effects */}
                    <div className="absolute inset-0 ">
                        <div className="absolute inset-0 opacity-30">
                            {/* Mobil için daha küçük ve optimize edilmiş blob'lar */}
                            <div className="absolute top-0 -left-4 w-48 sm:w-72 h-48 sm:h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
                            <div className="absolute top-0 -right-4 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
                            <div className="absolute -bottom-8 left-20 w-48 sm:w-72 h-48 sm:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
                        </div>
                        
                        {/* Mobil için optimize edilmiş grid overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A1B]/50 to-[#0A0A1B]" />
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] sm:bg-[length:50px_50px] animate-grid-scan" />
                    </div>

                    <div className="relative max-w-7xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 sm:space-y-8"
                        >
                            {/* KEWL Logo integrated with status badge */}
                            <div className="flex flex-col items-center space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                                {/* 3D Logo */}
                                <motion.div
                                    className="relative w-fit mx-auto group cursor-pointer"
                                 
                                >
                                    {/* 3D Text Layers */}
                                    <div className="relative">
                                        {/* Shadow Layer */}
                                        <div className="absolute -bottom-2 sm:-bottom-3 left-1 sm:left-1.5 right-1 sm:right-1.5 blur-sm opacity-30 text-5xl sm:text-9xl font-bold text-violet-500">
                                            KEWL
                                        </div>
                                        
                                        {/* Main Text */}
                                        <h1 className="relative text-5xl sm:text-9xl font-bold bg-gradient-to-br from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
                                            KEWL
                                        </h1>

                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 bg-white/5 blur-2xl sm:blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    {/* 3D Effect Layers */}
                                    <div className="absolute -bottom-0.5 left-0 right-0 h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
                                    <div className="absolute -bottom-1 sm:-bottom-1.5 left-0 right-0 h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-30" />
                                    <div className="absolute -bottom-1.5 sm:-bottom-2.5 left-0 right-0 h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-10" />
                                </motion.div>

                                {/* Status badge */}
                                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/[0.03] backdrop-blur-lg border border-white/[0.05]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                    </span>
                                    <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent">
                                        Next-Gen Trading Platform
                                    </span>
                                </div>
                            </div>

                            {/* Rest of the hero content */}
                            <h2 className="text-4xl sm:text-7xl md:text-8xl font-bold tracking-tight">
                                <span className="inline-block bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
                                    Future of
                                </span>
                                <br />
                                <span className="inline-block bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                    Decentralized Trading
                                </span>
                            </h2>

                            {/* Mobil için optimize edilmiş açıklama */}
                            <p className="text-base sm:text-xl text-violet-200/80 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm px-4 sm:px-0">
                                Experience quantum-speed trading with AI-powered execution, 
                                cross-chain capabilities, and institutional-grade security.
                            </p>

                            {/* Mobil için optimize edilmiş butonlar */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-6 px-4 sm:px-0">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative w-full sm:w-auto px-8 sm:px-12 py-4 rounded-xl bg-[#0A0A1B] overflow-hidden"
                                    onClick={() => window.location.href = '/swap'}
                                >
                                    {/* Base layer */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-pink-600/20" />
                                    
                                    {/* Animated gradient border */}
                                    <div className="absolute inset-[1px] rounded-[10px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
                                    <div className="absolute inset-[2px] rounded-[9px] bg-[#0A0A1B]" />
                                    
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="absolute inset-[1px] rounded-[10px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                                    </div>
                                    
                                    {/* Top glass highlight */}
                                    <div className="absolute inset-[2px] rounded-[9px]">
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>

                                    {/* Content wrapper */}
                                    <div className="relative flex items-center justify-center gap-2 text-white">
                                        {/* Icon */}
                                        <div className="relative w-5 h-5 mr-1">
                                            <div className="absolute inset-0 rotate-0 group-hover:rotate-90 transform transition-all duration-300">
                                                <svg 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    className="w-5 h-5"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <span className="relative font-semibold tracking-wide text-sm">
                                            Launch Platform
                                        </span>

                                        {/* Arrow */}
                                        <div className="relative w-5 h-5 ml-1 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                                            <svg 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                className="w-5 h-5"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Glow effect */}
                                    <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300" />

                                    {/* Bottom light bar */}
                                    <div className="absolute bottom-[2px] left-[2px] right-[2px] h-[1px]">
                                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>

                                    {/* Side light bars */}
                                    <div className="absolute top-[2px] bottom-[2px] left-[2px] w-[1px]">
                                        <div className="h-full w-full bg-gradient-to-b from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>
                                    <div className="absolute top-[2px] bottom-[2px] right-[2px] w-[1px]">
                                        <div className="h-full w-full bg-gradient-to-b from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>

                                    {/* Corner accents */}
                                    <div className="absolute top-[2px] left-[2px] w-2 h-2 border-t border-l border-white/30 rounded-tl" />
                                    <div className="absolute top-[2px] right-[2px] w-2 h-2 border-t border-r border-white/30 rounded-tr" />
                                    <div className="absolute bottom-[2px] left-[2px] w-2 h-2 border-b border-l border-white/30 rounded-bl" />
                                    <div className="absolute bottom-[2px] right-[2px] w-2 h-2 border-b border-r border-white/30 rounded-br" />
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative w-full sm:w-auto px-6 sm:px-8 py-4 rounded-xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-lg hover:bg-white/[0.05] transition-all duration-500"
                                >
                                    <span className="relative text-violet-200 font-semibold group-hover:text-white transition-colors duration-500">
                                        View Documentation
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative px-4 sm:px-6 py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto">
                        {/* Mobil için optimize edilmiş section başlığı */}
                        <div className="text-center mb-12 sm:mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-violet-500/10 text-violet-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                                </span>
                                Enterprise Features
                            </motion.div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-4 sm:mb-6">
                                Professional Trading Tools
                            </h2>
                            <p className="text-base sm:text-xl text-violet-300/80 max-w-2xl mx-auto px-4 sm:px-0">
                                Experience institutional-grade trading with advanced features and deep liquidity
                            </p>
                        </div>

                        {/* Mobil için optimize edilmiş feature grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                            {tradingFeatures.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`group relative ${bgClasses.card} backdrop-blur-xl rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 ${borderClasses.default} hover:${borderClasses.hover}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    {/* İçerik aynı kalacak, sadece padding ve spacing değişecek */}
                                    <div className="relative p-6 sm:p-10">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mb-6 sm:mb-10">
                                            <HexagonIcon 
                                                glowColor={feature.gradient}
                                                className="transform group-hover:scale-105 transition-transform duration-500"
                                            >
                                                {feature.icon}
                                            </HexagonIcon>
                                            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-white via-violet-200 to-violet-300 bg-clip-text text-transparent group-hover:to-white transition-colors duration-500">
                                                {feature.title}
                                            </h3>
                                        </div>

                                        <p className="text-base sm:text-lg text-violet-300/70 mb-8 sm:mb-12 leading-relaxed group-hover:text-violet-300/90 transition-colors duration-500">
                                            {feature.description}
                                        </p>

                                        {/* Mobil için optimize edilmiş metrics grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                            {feature.metrics.map((metric, metricIdx) => (
                                                <div 
                                                    key={metricIdx} 
                                                    className="group/metric relative flex sm:flex-col items-center justify-between sm:justify-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-violet-500/[0.02] hover:bg-violet-500/[0.08] transition-all duration-500 border border-white/[0.02]"
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${metric.glowColor} opacity-0 group-hover/metric:opacity-20 blur-xl transition-all duration-500`} />
                                                    
                                                    <div className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-0">
                                                        <SmallHexagonIcon 
                                                            glowColor={metric.glowColor}
                                                            className="transform group-hover/metric:scale-110 transition-transform duration-500"
                                                        >
                                                            {metric.icon}
                                                        </SmallHexagonIcon>
                                                        <div className="flex flex-col sm:items-center">
                                                            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-white to-violet-200 bg-clip-text text-transparent sm:mt-4 sm:mb-2 group-hover/metric:to-white transition-colors duration-500">
                                                                {metric.value}
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-violet-400/70 sm:text-center whitespace-nowrap group-hover/metric:text-violet-300 transition-colors duration-500">
                                                                {metric.label}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trading Advantages Section */}
                <section className="relative px-6 py-24 bg-gradient-to-b from-[#0A0A1B]/50 to-[#0A0A1B]">
                    <div className="max-w-7xl mx-auto mb-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-6">
                            Trading Advantages
                        </h2>
                        <p className="text-xl text-violet-300/80 max-w-2xl mx-auto">
                            Experience institutional-grade trading with advanced features and deep liquidity
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tradingAdvantages.map((advantage, idx) => (
                            <motion.div
                                key={idx}
                                className={`group relative ${bgClasses.card} backdrop-blur-xl rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 ${borderClasses.default} hover:${borderClasses.hover}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                {/* Ambient Glow */}
                                <div className={`absolute inset-0 ${gradientClasses.glow} opacity-5 group-hover:opacity-15 transition-opacity duration-500 blur-2xl`} />
                                
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-1000" />
                                
                                {/* Content */}
                                <div className="relative p-10">
                                    <div className="flex items-center gap-8 mb-10">
                                        <HexagonIcon glowColor="from-violet-500/20 to-fuchsia-500/20">
                                            <div className="text-3xl">{advantage.icon}</div>
                                        </HexagonIcon>
                                        <h3 className="text-2xl font-bold bg-gradient-to-br from-white via-violet-200 to-violet-300 bg-clip-text text-transparent">
                                            {advantage.title}
                                        </h3>
                                    </div>

                                    <p className="text-lg text-violet-300/70 mb-10 leading-relaxed group-hover:text-violet-300/90 transition-colors duration-500">
                                        {advantage.description}
                                    </p>

                                    <div className="space-y-4">
                                        {advantage.metrics.map((metric, metricIdx) => (
                                            <div 
                                                key={metricIdx}
                                                className="group/metric relative flex items-center justify-between p-6 rounded-2xl bg-violet-500/[0.02] hover:bg-violet-500/[0.05] transition-all duration-500 border border-white/[0.02]"
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover/metric:opacity-10 blur-xl transition-all duration-500`} />
                                                <span className="relative z-10 text-violet-300/90 group-hover/metric:text-violet-200 transition-colors duration-500">{metric.label}</span>
                                                <span className="relative z-10 text-xl font-bold bg-gradient-to-br from-white to-violet-200 bg-clip-text text-transparent group-hover/metric:to-white transition-colors duration-500">{metric.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {advantage.highlight && (
                                        <div className="mt-12 flex justify-center">
                                            <div className="relative group/badge">
                                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 blur-xl opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500" />
                                                <span className="relative px-8 py-4 rounded-2xl bg-violet-500/[0.03] text-violet-300/90 text-sm font-medium border border-white/[0.05] hover:bg-violet-500/[0.08] hover:border-violet-500/20 transition-all duration-500">
                                                    {advantage.highlight}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Border Effect */}
                                <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-white/[0.05] group-hover:ring-violet-500/20 transition-colors duration-500" />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Launchpad Section */}
                <section className="relative px-6 py-24 bg-gradient-to-b from-[#0A0A1B] to-[#0A0A1B]/50">
                    <div className="max-w-7xl mx-auto mb-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-6">
                            Launch Your Project
                        </h2>
                        <p className="text-xl text-violet-300/80 max-w-2xl mx-auto">
                            Everything you need to launch and grow your blockchain project
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features[1].items.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={`group relative ${bgClasses.card} backdrop-blur-xl rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 ${borderClasses.default} hover:${borderClasses.hover}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                {/* Ambient Glow */}
                                <div className={`absolute inset-0 ${gradientClasses.glow} opacity-5 group-hover:opacity-15 transition-opacity duration-500 blur-2xl`} />
                                
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-1000" />
                                
                                {/* Content */}
                                <div className="relative p-10">
                                    <div className="flex items-center gap-8 mb-10">
                                        <HexagonIcon glowColor="from-violet-500/20 to-fuchsia-500/20">
                                            <div className="text-3xl">{item.image}</div>
                                        </HexagonIcon>
                                        <h3 className="text-2xl font-bold bg-gradient-to-br from-white via-violet-200 to-violet-300 bg-clip-text text-transparent">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <p className="text-lg text-violet-300/70 mb-10 leading-relaxed group-hover:text-violet-300/90 transition-colors duration-500">
                                        {item.description}
                                    </p>

                                    <div className="space-y-4">
                                        {item.stats.map((stat, statIdx) => (
                                            <div 
                                                key={statIdx}
                                                className="group/stat relative flex items-center p-6 rounded-2xl bg-violet-500/[0.02] hover:bg-violet-500/[0.05] transition-all duration-500 border border-white/[0.02]"
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover/stat:opacity-10 blur-xl transition-all duration-500`} />
                                                <span className="relative z-10 text-lg text-violet-300/90 group-hover/stat:text-violet-200 transition-colors duration-500">{stat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Border Effect */}
                                <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-white/[0.05] group-hover:ring-violet-500/20 transition-colors duration-500" />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Wallet Section */}
                <section className="relative px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-b from-[#0A0A1B] to-[#0A0A1B]/90">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-12 sm:mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-violet-500/10 text-violet-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                                </span>
                                Multi-Wallet Support
                            </motion.div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent mb-4 sm:mb-6">
                                Connect Your Preferred Wallet
                            </h2>
                            <p className="text-base sm:text-xl text-violet-300/80 max-w-2xl mx-auto px-4 sm:px-0">
                                Seamlessly connect with multiple wallet options for secure and convenient trading
                            </p>
                        </div>

                        {/* Wallets Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {walletOptions.map((wallet, idx) => (
                                <motion.button
                                    key={wallet.id}
                                    className={`group relative flex w-full ${bgClasses.card} backdrop-blur-xl rounded-2xl overflow-hidden ${borderClasses.default} hover:${borderClasses.hover} transition-all duration-500`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Glass Morphism Background */}
                                    <div className={`absolute inset-0 ${gradientClasses.glass} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                                    
                                    {/* Glow Effect */}
                                    <div className={`absolute -inset-px ${gradientClasses.glow} opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`} />
                                    
                                    {/* Content Container */}
                                    <div className="relative flex items-center w-full p-4 sm:p-5">
                                        {/* Left Section - Icon */}
                                        <div className="relative mr-3 sm:mr-4 mt-6">
                                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-sm border border-white/[0.05] flex items-center justify-center group-hover:border-violet-500/20 transition-all duration-500">
                                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                                <img 
                                                    src={wallet.icon} 
                                                    alt={wallet.name} 
                                                    className="w-7 h-7 object-contain transform group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            
                                       
                                        </div>

                                        {/* Middle Section - Info */}
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h3 className="text-base font-bold bg-gradient-to-br from-white via-violet-100 to-violet-200 bg-clip-text text-transparent truncate group-hover:to-white transition-colors duration-500">
                                                {wallet.name}
                                            </h3>
                                            <p className="mt-0.5 text-xs text-violet-300/70 line-clamp-2 group-hover:text-violet-200/90 transition-colors duration-500">
                                                {wallet.description}
                                            </p>
                                        </div>

                                        {/* Right Section - Arrow */}
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/5 to-transparent flex items-center justify-center border border-white/[0.05] group-hover:border-violet-500/20 transition-all duration-500">
                                                <svg 
                                                    className="w-4 h-4 text-violet-300 transform group-hover:translate-x-0.5 group-hover:text-violet-200 transition-all duration-500" 
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Border Effect */}
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-violet-500/0 group-hover:ring-violet-500/20 transition-all duration-500" />
                                    
                                    {/* Subtle Scan Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-violet-300/60">
                                Don't see your wallet? We're constantly adding more options.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;
