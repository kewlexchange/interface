'use client';

import { Card, CardBody, Image, Progress, Chip, Button, image } from "@nextui-org/react";
import { ExternalLink, Trophy, VerifiedIcon } from 'lucide-react';
import { EthereumIcon } from "../Icons";
import { formatEther } from "@ethersproject/units";
import { getIconByChainId } from "@/utils";
import { useWeb3React } from "@web3-react/core";
import { Route as ReactRoute, NavLink, useNavigate } from 'react-router-dom';

interface NFTCardProps {
  collection: any;
  image:any;
  viewMode: 'grid' | 'list';
}

// ViewButton bileşeni
const ViewButton = ({ variant = "default", onClick }: { variant?: "default" | "overlay"; onClick?: (e: React.MouseEvent) => void; }) => (
  <Button
    size="sm"
    onPress={(e:any)=>{
        onClick(e);
    }}
    className={`
      w-full font-medium tracking-wide transition-all duration-300
      ${variant === "overlay" 
        ? "bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-sm" 
        : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-200/50 dark:border-neutral-700/50"
      }
      h-9 rounded-xl border
      hover:shadow-lg
      group
    `}
    startContent={
      <ExternalLink 
        className={`
          w-5 h-5"}
        `}
      />
    }
  >
   <span className="w-full">View Details</span>
  </Button>
);

// Leaderboard Badge bileşeni
const LeaderboardBadge = ({ rank }: { rank: number }) => (
  <div className="absolute top-3 left-3 flex items-center gap-1.5 
                bg-black/40 backdrop-blur-md border border-white/10
                text-white font-medium text-xs h-6 px-2 rounded-full">
    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
    <span>#{rank}</span>
  </div>
);

export function NFTCard({ collection,image, viewMode }: NFTCardProps) {
    const { connector, account, provider, chainId } = useWeb3React()
    const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/nfts/${collection.collectionId}`);
  };

  if (viewMode === 'list') {
    return (
      <Card 
        isPressable
        onPress={handleViewDetails}
        className="group overflow-hidden rounded-xl bg-white dark:bg-neutral-900
                  border border-neutral-200 dark:border-neutral-800
                  hover:bg-neutral-50 dark:hover:bg-neutral-800
                  hover:border-neutral-300 dark:hover:border-neutral-700
                  hover:shadow-lg dark:hover:shadow-neutral-900/30
                  transition-all duration-300 cursor-pointer"
      >
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Left Section: Image & Basic Info */}
            <div className="flex items-center gap-4 min-w-0 flex-[2]">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={image}
                  alt={"KEWL Image"}
                  removeWrapper
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-semibold truncate overflow-hidden whitespace-nowrap text-ellipsis">
  {collection.name}
</h3>
           
                    <VerifiedIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                
            
              
             
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                  <span>{collection.itemsCount} items</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="flex items-center gap-6 flex-[2] flex-wrap">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Floor</p>
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" src={getIconByChainId(chainId)}/>
                  <span className="font-semibold">{parseFloat(formatEther(collection.floorPrice)).toFixed(4)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Volume</p>
                <div className="flex items-center gap-1">
                <Image className="w-4 h-4" src={getIconByChainId(chainId)}/>
                <span className="font-semibold">{parseFloat(formatEther(collection.totalVolume)).toFixed(4)}</span>
                </div>
              </div>
            
            </div>

            {/* Action Button */}
            <div className="flex-none w-full md:w-[120px]">
              <Button
                size="sm"
                onPress={handleViewDetails}
                className="w-full h-9 rounded-xl
                         bg-violet-500/10 backdrop-blur-xl 
                         border border-violet-500/30 
                         text-violet-500 hover:text-violet-400
                         shadow-[0_0_15px_rgba(139,92,246,0.3)]
                         hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                         transition-all duration-500
                         group relative overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] 
                              transition-transform duration-1000" />
                
                {/* Content */}
                <span className="relative flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4 opacity-70 
                                       group-hover:opacity-100
                                       transition-all duration-500" />
                  View Details
                </span>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      isPressable
      onPress={handleViewDetails}
      className="group bg-white/[0.02] dark:bg-black/[0.02]
                border border-violet-500/10
                hover:border-violet-500/20
                hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]
                transition-all duration-300 cursor-pointer
                rounded-2xl overflow-hidden
                backdrop-blur-xl"
    >
      <CardBody className="p-0">
        {/* Image Container */}
        <div className="relative w-full h-[300px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={image}
              alt={"KEWL NFT"}
              removeWrapper
              className="w-full h-full object-cover transform group-hover:scale-105 
                       transition-all duration-700 ease-out"
            />
          </div>

          {/* Overlay Efektleri */}
          <div className="absolute inset-0">
            {/* Ana gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-t 
                          from-violet-500/20 via-transparent to-transparent
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-300" />
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r 
                          from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover:translate-x-[100%]
                          transition-transform duration-1000" />
          </div>

          {/* Content Container */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 z-20">
            {/* Top Section */}
            <div className="flex items-center justify-between">
              {/* Rank Badge */}
              <div className="flex items-center gap-1.5 
                           bg-black/40 backdrop-blur-xl
                           border border-white/10
                           text-white font-medium text-xs h-6 px-3 rounded-xl
                           shadow-[0_0_20px_rgba(0,0,0,0.2)]
                           hover:bg-black/50
                           transition-all duration-300">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>#{collection.itemsCount}</span>
              </div>

              {/* Verified Badge */}
              <div className="bg-black/40 backdrop-blur-xl rounded-xl p-2
                           border border-white/10
                           shadow-[0_0_20px_rgba(0,0,0,0.2)]
                           hover:bg-black/50
                           transition-all duration-300">
                <VerifiedIcon className="w-4 h-4 text-blue-400" />
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-black/40 backdrop-blur-xl rounded-xl 
                         p-4 border border-white/10
                         hover:bg-black/50
                         transition-all duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-white/80 text-xs font-medium mb-1.5">
                    Floor Price
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Image className="w-4 h-4" src={getIconByChainId(chainId)}/>
                    <span className="font-bold text-white text-lg">
                      {parseFloat(formatEther(collection.floorPrice)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs font-medium mb-1.5">
                    Volume
                  </p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Image className="w-4 h-4" src={getIconByChainId(chainId)}/>
                    <span className="font-bold text-white text-lg">
                      {parseFloat(formatEther(collection.totalVolume)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-3 border-t border-violet-500/10 bg-white/[0.01] dark:bg-black/[0.01]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-xl overflow-hidden border border-violet-500/20">
                <Image
                  src={image}
                  alt=""
                  removeWrapper
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {collection.name}
              </span>
            </div>
          </div>

          {/* View Button */}
          <Button
            size="sm"
            onPress={handleViewDetails}
            className="w-full h-9 rounded-xl
                     bg-violet-500/10 backdrop-blur-xl 
                     border border-violet-500/30 
                     text-violet-500 hover:text-violet-400
                     shadow-[0_0_15px_rgba(139,92,246,0.3)]
                     hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                     transition-all duration-500
                     group relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] 
                          transition-transform duration-1000" />
            
            {/* Content */}
            <span className="relative flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4 opacity-70 
                                   group-hover:opacity-100
                                   transition-all duration-500" />
              View Details
            </span>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
} 