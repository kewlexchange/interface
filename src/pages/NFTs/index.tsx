import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Button, Card, Link, Image, Tabs, Tab, Input } from "@nextui-org/react";
import { NFT_MARKET_COLLECTION_TAB } from "../../Components/NFTMarketTabs/Collections";
import { NFT_MARKET_LEADERBOARD_TAB } from "../../Components/NFTMarketTabs/Leaderboard";
import { GridIcon, ListIcon, WalletIcon } from "lucide-react";

const NFTs: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, chainId, account]);
    return (

        <>

            <section className="relative w-full rounded-lg min-h-[90vh] py-32 overflow-hidden">
                {/* Alien Tech Background */}
                <div className="absolute inset-0">
                    {/* Base Layer */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-violet-500/[0.12] via-violet-500/[0.08] to-transparent
                        dark:from-violet-900/20 dark:via-black dark:to-black" />

                    {/* Tech Grid */}
                    <div className="absolute inset-0 bg-[url('/alien-grid.svg')] bg-repeat opacity-[0.07]
                        dark:opacity-[0.05] animate-pulse-slow" />

                    {/* Light Theme Specific Effects */}
                    <div className="absolute inset-0 dark:hidden">
                        <div className="absolute inset-0 backdrop-blur-3xl opacity-30" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/80" />
                    </div>

                    {/* Energy Lines */}
                    <div className="absolute inset-0">
                        {[...Array(8)].map((_, i) => (
                            <div key={i}
                                className="absolute h-[1px] w-full
                            bg-gradient-to-r from-transparent via-violet-500/40 to-transparent
                            animate-scan-line"
                                style={{
                                    top: `${i * 12.5}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    opacity: 0.3
                                }} />
                        ))}
                    </div>

                    {/* Alien Tech Circles */}
                    <div className="absolute inset-0">
                        {[...Array(5)].map((_, i) => (
                            <div key={i}
                                className="absolute w-[500px] h-[500px] rounded-full
                            border border-violet-500/20
                            animate-tech-pulse"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    animationDelay: `${i * 1}s`
                                }} />
                        ))}
                    </div>

                    {/* Floating Particles */}
                    <div className="absolute inset-0">
                        {[...Array(30)].map((_, i) => (
                            <div key={i}
                                className="absolute w-1 h-1 bg-violet-500/40
                            animate-float-particle"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animationDuration: `${3 + Math.random() * 5}s`,
                                    animationDelay: `${Math.random() * 2}s`
                                }} />
                        ))}
                    </div>

                    {/* Glowing Orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 -right-20 w-80 h-80
                          rounded-full bg-violet-500/10 blur-3xl
                          animate-pulse-slow mix-blend-screen" />
                        <div className="absolute bottom-1/4 -left-20 w-80 h-80
                          rounded-full bg-blue-500/10 blur-3xl
                          animate-pulse-slow animation-delay-1000 mix-blend-screen" />
                    </div>
                </div>

                {/* Content Container */}
                <div className="relative marketplace-container">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        {/* Tech Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         dark:bg-black/20 backdrop-blur-xl border border-violet-500/20
                         shadow-[0_0_15px_rgba(139,92,246,0.3)]
                         animate-pulse-slow">
                            <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                            <span className="text-sm font-medium text-violet-500">
                                KEWL Technology NFT Marketplace
                            </span>
                        </div>

                        {/* Main Title */}
                        <div className="space-y-6 relative">
                            <div className="absolute -inset-x-10 inset-y-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0
                           animate-gradient-x" />
                            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight
                          [text-shadow:_0_0_30px_rgba(139,92,246,0.3)]">
                                <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 
                              bg-clip-text text-transparent">
                                    KEWL NFT
                                </span>
                                <br />
                                <span className="dark:text-white/90">
                                    Marketplace
                                </span>
                            </h1>
                            <p className="text-xl dark:text-violet-200/60 max-w-2xl mx-auto leading-relaxed">
                                Discover and collect extraordinary NFTs from across the multiverse.
                            </p>
                        </div>

                        {/* Action Buttons */}
                    

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-16">
                            {[
                                { label: "Active Users", value: "10K+" },
                                { label: "Total Volume", value: "$5M+" },
                                { label: "NFT Count", value: "35K+" },
                                { label: "Artists", value: "8.5K+" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2 backdrop-blur-sm p-4 rounded-2xl
                                     bg-white/40 dark:bg-white/5
                                     border border-white/20 dark:border-white/10">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 
                             bg-clip-text text-transparent">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-24">
                <div className="marketplace-container">
                    <div className="flex flex-col gap-8">
                        {/* Header with View Toggle */}
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 gradient-text">
                                    Trend Collections
                                </h2>
                                <p className="text-default-500">
                                    Discover the most popular NFT collections 🚀
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                                    <Button
                                        size="sm"
                                        className={`min-w-[40px] h-8 ${viewMode === 'grid'
                                                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                                : 'bg-transparent text-neutral-500'
                                            }`}
                                        onPress={() => setViewMode('grid')}
                                    >
                                        <GridIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        className={`min-w-[40px] h-8 ${viewMode === 'list'
                                                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                                : 'bg-transparent text-neutral-500'
                                            }`}
                                        onPress={() => setViewMode('list')}
                                    >
                                        <ListIcon className="w-4 h-4" />
                                    </Button>
                                </div>

                              
                            </div>
                        </div>

                        <div className="w-full">
                            <NFT_MARKET_COLLECTION_TAB viewMode={viewMode} className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                                    : "flex flex-col gap-4"
                            } />

                        </div>

                        {/* View More */}
                        <div className="text-center mt-8">
                            <Button
                                size="lg"
                                variant="bordered"
                                className="font-semibold glass-card hover:bg-white/10"
                            >
                                See More
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="w-full">

            </div>


            <div className="hidden mx-auto w-full sm:max-w-6xl">

                <Card className={" flex gap-2 flex-col p-2 w-full"}>
                    <div className="w-full max-w-full">
                        <Tabs color={"default"} aria-label="NFT Market Tabs">
                            <Tab key="collections" title="Collections">
                                <NFT_MARKET_COLLECTION_TAB />
                            </Tab>
                            <Tab key="leaderboard" title="Leaderboard">
                                <NFT_MARKET_LEADERBOARD_TAB />
                            </Tab>
                        </Tabs>
                    </div>
                </Card>


            </div>


        </>
    )
}


export default NFTs;
