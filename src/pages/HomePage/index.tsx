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
    Layers,
    Building2,
    Repeat,
    ChartLine,
    Percent,
    TrendingUp,
    PieChart,
    FileText,
    Code2,
    Check,
    ArrowLeftRight,
    Image,
    ImagePlus,
    Link,
    DollarSign,
    Trophy,
    CheckCircle,
    Settings
} from 'lucide-react';
import WalletModal from '@/Components/WalletModal';
import { useWeb3React } from '@web3-react/core';
import { TokenBalances } from '@/Components/AccountTabs/TokenBalances';

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
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 dark:via-white/[0.1] to-transparent rotate-180 group-hover:rotate-360 transition-all duration-2000" />
            
            {/* Enhanced Icon container with advanced glass effect */}
            <div className="relative flex items-center justify-center transform transition-all duration-500 will-change-transform">
                {/* Futuristic background with scanning effect */}
                <div className="absolute inset-0 before:absolute before:inset-0 before:bg-gradient-to-t before:from-violet-500/10 before:via-transparent before:to-transparent before:animate-scan">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100/80 to-white/80 dark:from-white/[0.08] dark:to-transparent rounded-xl backdrop-blur-md border border-gray-200 dark:border-white/[0.08]" />
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

const walletOptions = [
    {
        id: 'metamask',
        name: 'MetaMask',
        icon: '/images/wallets/metamask-icon.svg',
        description: 'The most popular and secure wallet',
        popular: true
    },
    {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '/images/wallets/walletconnect-icon.svg',
        description: 'Connect multiple wallets seamlessly'
    },
    {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '/images/wallets/coinbase-icon.svg',
        description: 'The easiest way to get started'
    },
    {
        id: 'trustwallet',
        name: 'Trust Wallet',
        icon: '/images/wallets/trustwallet-icon.svg',
        description: 'The most trusted DeFi wallet'
    },
    {
        id: 'uniswap',
        name: 'Uniswap',
        icon: '/images/wallets/uniswap-wallet-icon.png',
        description: 'The best wallet experience'
    },
    {
        id: 'coin98',
        name: 'Coin98',
        icon: '/images/wallets/coin98.svg',
        description: 'The gateway to the DeFi ecosystem'
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
            icon: <Building2 className="w-6 h-6 text-[#C084FC]" />,
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
            icon: <Repeat className="w-6 h-6 text-[#C084FC]" />,
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
            icon: <Network className="w-6 h-6 text-[#C084FC]" />,
            metrics: [
                { value: '2+', label: 'Networks' },
                { value: '1-Click', label: 'Bridge' },
                { value: '100%', label: 'Security' }
            ],
            highlight: 'Unified Trading Experience'
        }
    ];

    const tradingTools = [
        {
            title: 'Swap',
            icon: <ArrowLeftRight className="w-10 h-10 text-[#C084FC]" />,
            description: 'Lightning-fast token swaps with minimal slippage and best execution across multiple DEXs',
            metrics: [
                { 
                    value: '0.1%', 
                    label: 'Min Slippage',
                    icon: <Percent className="w-6 h-6 text-[#C084FC]" />
                },
                { 
                    value: '10+', 
                    label: 'DEX Aggregators',
                    icon: <Network className="w-6 h-6 text-[#C084FC]" />
                },
                { 
                    value: '1000+', 
                    label: 'Token Pairs',
                    icon: <Coins className="w-6 h-6 text-[#C084FC]" />
                }
            ],
            features: [
                'Cross-chain swaps',
                'Gas optimization',
                'Price impact protection'
            ],
            highlight: 'Best Price Execution'
        },
        {
            title: 'NFT Marketplace',
            icon: <Image className="w-10 h-10 text-[#C084FC]" />,
            description: 'Trade NFTs across multiple chains with advanced collection analytics and rarity tracking',
            metrics: [
                { 
                    value: '100K+', 
                    label: 'NFTs Listed',
                    icon: <ImagePlus className="w-6 h-6 text-[#C084FC]" />
                },
                { 
                    value: '5+', 
                    label: 'Chains',
                    icon: <Link className="w-6 h-6 text-[#C084FC]" />
                },
                { 
                    value: 'Real-time', 
                    label: 'Floor Price',
                    icon: <LineChart className="w-6 h-6 text-[#C084FC]" />
                }
            ],
            features: [
                'Collection analytics',
                'Rarity tracking',
                'Bulk trading'
            ],
            highlight: 'Cross-Chain NFT Trading'
        },
        {
            title: 'Token Vesting',
            icon: <Clock className="w-10 h-10 text-[#C084FC]" />,
            description: 'Secure and transparent token vesting solution for teams and investors',
            metrics: [
                { 
                    value: '100%', 
                    label: 'Automated',
                    icon: <Settings className="w-6 h-6 text-[#C084FC]" />
                },
                { 
                    value: '24/7', 
                    label: 'Monitoring',
                    icon: <Activity className="w-6 h-6 text-[#C084FC]" />
                },
                { 
                    value: '0 Risk', 
                    label: 'Smart Contract',
                    icon: <ShieldCheck className="w-6 h-6 text-[#C084FC]" />
                }
            ],
            features: [
                'Custom vesting schedules',
                'Multi-token support',
                'Cliff periods'
            ],
            highlight: 'Enterprise-grade Vesting'
        },
        {
            title: 'Launchpad',
            icon: <Rocket className="w-10 h-10 text-[#C084FC]" />,
            description: 'Launch your project with institutional-grade infrastructure and support',
            metrics: [
                { 
                    value: '20+', 
                    label: 'Successful IDOs',
                    icon: <Trophy className="w-6 h-6 text-[#C084FC]" />
                },
                { 
                    value: '$50M+', 
                    label: 'Total Raised',
                    icon: <DollarSign className="w-6 h-6 text-[#C084FC]" />
                },
                { 
                    value: '100%', 
                    label: 'Success Rate',
                    icon: <CheckCircle className="w-6 h-6 text-[#C084FC]" />
                }
            ],
            features: [
                'KYC integration',
                'Multi-round sales',
                'Automated distribution'
            ],
            highlight: 'Your Gateway to Success'
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

    // Update the color classes and gradients
    const gradientClasses = {
        primary: "from-[#7C3AED] to-[#C084FC]", // Ana mor gradient
        secondary: "from-[#C084FC] to-[#E879F9]", // Açık mor gradient
        glass: "from-black/5 to-black/10",
        glow: "from-[#7C3AED]/10 via-[#C084FC]/10 to-[#E879F9]/10"
    };

    const borderClasses = {
        default: "border-white/10",
        hover: "hover:border-[#7C3AED]/50",
        active: "border-[#7C3AED]"
    };

    const bgClasses = {
        card: "bg-[#050510]/95",
        button: "bg-[#7C3AED]",
        hover: "hover:bg-[#6D28D9]"
    };

    // Update card components
    const FeatureCard = ({ feature }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative backdrop-blur-xl rounded-2xl overflow-hidden"
        >
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/[0.02] border border-white/[0.05] rounded-2xl" />
            
            <div className="relative p-8">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20">
                        {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                        {feature.title}
                    </h3>
                </div>

                {/* Description */}
                <p className="text-[#C084FC]/80 mb-8 leading-relaxed">
                    {feature.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {feature.metrics.map((metric, idx) => (
                        <div 
                            key={idx}
                            className="flex flex-col items-center p-4 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 hover:border-[#7C3AED]/20 transition-all duration-300"
                        >
                            <div className="mb-2">
                                {metric.icon}
                            </div>
                            <span className="text-xl font-bold text-white mb-1">
                                {metric.value}
                            </span>
                            <span className="text-sm text-[#C084FC]/80 text-center">
                                {metric.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Highlight badge */}
                <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20">
                    <span className="text-sm font-medium text-[#C084FC]">
                        {feature.highlight}
                    </span>
                </div>
            </div>
        </motion.div>
    );

    // Trading Advantages card component
    const TradingAdvantageCard = ({ advantage }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative backdrop-blur-xl rounded-2xl overflow-hidden"
        >
            {/* Glass background with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-[#C084FC]/5 to-[#E879F9]/10 border border-white/[0.05] rounded-2xl" />
            
            <div className="relative p-8">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20">
                        {advantage.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                        {advantage.title}
                    </h3>
                </div>

                {/* Description */}
                <p className="text-lg text-white/80 leading-relaxed mb-8">
                    {advantage.description}
                </p>

                {/* Metrics */}
                <div className="space-y-3">
                    {advantage.metrics.map((metric, idx) => (
                        <div 
                            key={idx} 
                            className="group/metric flex justify-between items-center p-4 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 hover:border-[#7C3AED]/30 transition-all duration-300"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#7C3AED]/10 group-hover/metric:bg-[#7C3AED]/20 transition-colors duration-300">
                                    {metric.icon}
                                </div>
                                <span className="text-white/80 text-base group-hover/metric:text-white transition-colors duration-300">
                                    {metric.label}
                                </span>
                            </div>
                            <span className="font-bold text-xl text-white group-hover/metric:text-[#C084FC] transition-colors duration-300">
                                {metric.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Highlight badge */}
                <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#7C3AED]/20 to-[#C084FC]/20 border border-[#7C3AED]/30">
                    <span className="text-sm font-medium text-white">
                        {advantage.highlight}
                    </span>
                </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/0 via-[#C084FC]/0 to-[#E879F9]/0 group-hover:from-[#7C3AED]/5 group-hover:via-[#C084FC]/5 group-hover:to-[#E879F9]/5 transition-all duration-500" />
        </motion.div>
    );

    // Stil tanımlamaları
    const styles = {
        heading: "text-4xl sm:text-5xl font-bold text-white drop-shadow-glow mb-6",
        subheading: "text-lg text-white/90 font-medium max-w-2xl mx-auto",
        sectionContainer: "relative px-4 sm:px-6 py-16 sm:py-24",
    };

    // Tailwind config'e eklenecek
    const tailwindConfig = {
        theme: {
            extend: {
                dropShadow: {
                    'glow': '0 0 10px rgba(124, 58, 237, 0.3)',
                }
            }
        }
    };

    const ToolCard = ({ tool }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative backdrop-blur-xl rounded-2xl overflow-hidden"
        >
            {/* Glass background with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-[#C084FC]/5 to-[#E879F9]/10 border border-white/[0.05] rounded-2xl" />
            
            <div className="relative p-8">
                {/* Card Header */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="p-4 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 backdrop-blur-xl">
                        {tool.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">
                        {tool.title}
                    </h3>
                </div>

                {/* Description */}
                <p className="text-lg text-white/80 leading-relaxed mb-10">
                    {tool.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {tool.metrics.map((metric, idx) => (
                        <div 
                            key={idx}
                            className="group/metric flex flex-col items-center p-4 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 hover:border-[#7C3AED]/30 transition-all duration-300"
                        >
                            <div className="mb-3 p-2 rounded-lg bg-[#7C3AED]/10 group-hover/metric:bg-[#7C3AED]/20 transition-colors duration-300">
                                {metric.icon}
                            </div>
                            <span className="text-2xl font-bold text-white mb-1 group-hover/metric:text-[#C084FC] transition-colors duration-300">
                                {metric.value}
                            </span>
                            <span className="text-sm text-white/60 text-center group-hover/metric:text-white/80 transition-colors duration-300">
                                {metric.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                    {tool.features.map((feature, idx) => (
                        <div 
                            key={idx} 
                            className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-300"
                        >
                            <div className="p-1 rounded-full bg-[#7C3AED]/20">
                                <Check className="w-4 h-4 text-[#C084FC]" />
                            </div>
                            <span className="text-base">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Highlight badge */}
                <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED]/20 to-[#C084FC]/20 border border-[#7C3AED]/30">
                    <span className="text-sm font-medium text-white">
                        {tool.highlight}
                    </span>
                </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/0 via-[#C084FC]/0 to-[#E879F9]/0 group-hover:from-[#7C3AED]/5 group-hover:via-[#C084FC]/5 group-hover:to-[#E879F9]/5 transition-all duration-500" />
        </motion.div>
    );

    const WalletOption = ({ wallet }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative backdrop-blur-xl rounded-2xl overflow-hidden"
        >
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-[#C084FC]/5 to-[#E879F9]/10 border border-white/[0.05] rounded-2xl" />
            
            <div className="relative p-6 flex items-center gap-4">
                {/* Wallet Icon */}
                <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/20 to-[#C084FC]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                    <div className="relative w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.05] p-2 flex items-center justify-center">
                    <img
                            src={wallet.icon}
                            alt={wallet.name}
                            width={32}
                            height={32}
                            className="w-full rounded-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Wallet Info */}
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                            {wallet.name}
                        </h3>
                        {wallet.popular && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/30">
                                Popular
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-white/70">
                        {wallet.description}
                    </p>
                </div>

                {/* Connect Button */}
                <button className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 border border-[#7C3AED]/30 text-white/90 hover:text-white text-sm font-medium transition-all duration-300">
                    Connect
                </button>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/0 via-[#C084FC]/0 to-[#E879F9]/0 group-hover:from-[#7C3AED]/5 group-hover:via-[#C084FC]/5 group-hover:to-[#E879F9]/5 transition-all duration-500" />
        </motion.div>
    );


    const { connector, chainId,account } = useWeb3React()

    return (
        <div className="relative w-full min-h-screen">
            <main className="relative">
                {/* Hero Section - siyah container kaldırıldı */}
                <section className="relative flex flex-col items-center justify-center px-4 sm:px-6 min-h-[90vh] sm:min-h-screen">
                    {/* Background Effects */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Ana gradient arka plan */}
                        <div className="absolute inset-0 bg-gradient-radial from-[#7C3AED]/40 via-[#7C3AED]/20 to-transparent" />
                        
                        {/* Mor glow katmanları */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute w-[1000px] h-[1000px] bg-gradient-radial from-[#C084FC]/30 via-[#C084FC]/10 to-transparent" />
                            <div className="absolute w-[800px] h-[800px] bg-gradient-radial from-[#E879F9]/30 via-[#E879F9]/10 to-transparent rotate-45" />
                            <div className="absolute w-[800px] h-[800px] bg-gradient-radial from-[#7C3AED]/30 via-[#7C3AED]/10 to-transparent -rotate-45" />
                        </div>

                        {/* İnce grid overlay */}
                        <div className="absolute inset-0 bg-grid-white/[0.02] opacity-20" />
                    </div>

                    {/* Hero Content */}
                    <div className="relative max-w-7xl mx-auto text-center space-y-8 sm:space-y-12">
                  
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
                            </motion.div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-7xl font-bold tracking-tight">
                            <span className="inline-block bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent">
                                Future of
                            </span>
                            <br />
                            <span className="inline-block bg-gradient-to-r from-[#C084FC] to-[#E879F9] bg-clip-text text-transparent">
                                Decentralized Trading
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg sm:text-xl text-[#C084FC]/80 max-w-2xl mx-auto">
                            Experience quantum-speed trading with AI-powered execution, 
                            cross-chain capabilities, and institutional-grade security.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            <motion.button
                            onClick={()=>{
                                window.location.href = '/swap'
                            }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-2xl bg-[#7C3AED] text-white font-semibold shadow-lg shadow-[#7C3AED]/25 hover:shadow-xl hover:bg-[#6D28D9] transition-all duration-300"
                            >
                                Launch Platform →
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-2xl bg-[#0A0A1B]/60 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-[#7C3AED]/20"
                            >
                                View Documentation
                            </motion.button>
                        </div>
                    </div>
                </section>

                {/* Wallet Section */}
                <section className="relative px-4 sm:px-6 py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                                Connect Your Wallet
                            </h2>
                            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                                Choose from our wide range of supported wallets
                            </p>
                        </div>

                        <div className="w-full gap-4">
                            {
                                !account ?  <WalletModal/> : <TokenBalances/>
                            }
                           
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="relative px-4 sm:px-6 py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                                Professional Trading Tools
                            </h2>
                            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                                Advanced features for professional traders
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {tradingTools.map((tool, idx) => (
                                <ToolCard key={idx} tool={tool} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trading Advantages */}
                <section className="relative px-4 sm:px-6 py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                                Trading Advantages
                            </h2>
                            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                                Experience seamless trading with our advanced features
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {tradingAdvantages.map((advantage, idx) => (
                                <TradingAdvantageCard key={idx} advantage={advantage} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;
