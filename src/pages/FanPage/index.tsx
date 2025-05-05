import { Image, Badge, Progress, Card, CardHeader, CardBody, CardFooter, Button, Tooltip } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { Flame, Trophy, Medal, TrendingUp, Gift, ArrowUp, Clock, Zap, ChevronRight, Star, BarChart3 } from "lucide-react";
import { tokens }  from "../../Components/SwapComponents/Fan/Components/Data";
import LevelTokens from "../../Components/LevelTokens";

// Fan token veri yapısı
interface FanToken {
  id: number;
  name: string;
  logo: string;
  earned: number;
  total: number;
  color: string;
  change24h: number; // 24 saatlik değişim yüzdesi
}

// Ranking veri yapısı
interface UserRank {
  position: number;
  username: string;
  amount: number;
}

const FANPAGE: React.FunctionComponent<IPage> = props => {
    // Kullanıcının toplam kazanımları
    const [totalEarned, setTotalEarned] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    
    // Sıralama
    const [userRanking, setUserRanking] = useState<UserRank[]>([
        { position: 1, username: "whale_trader", amount: 1250 },
        { position: 2, username: "crypto_king", amount: 1180 },
        { position: 3, username: "token_hunter", amount: 950 },
        { position: 4, username: "YOU", amount: 820 },
        { position: 5, username: "hodler99", amount: 765 },
    ]);
    
    // Zamanı sayan geri sayım
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    
    // Örnek token verileri 
    const [fanTokens, setFanTokens] = useState<FanToken[]>([
        { id: 1, name: "CHZ", logo: "/logos/chz.png", earned: 12, total: 20, color: "primary", change24h: 5.2 },
        { id: 2, name: "BAR", logo: "/logos/bar.png", earned: 5, total: 10, color: "success", change24h: 3.7 },
        { id: 3, name: "JUV", logo: "/logos/juv.png", earned: 8, total: 15, color: "warning", change24h: -1.3 },
        { id: 4, name: "PSG", logo: "/logos/psg.png", earned: 3, total: 10, color: "error", change24h: 7.8 },
        { id: 5, name: "ACM", logo: "/logos/acm.png", earned: 4, total: 8, color: "secondary", change24h: 2.1 },
        { id: 6, name: "CITY", logo: "/logos/city.png", earned: 6, total: 12, color: "primary", change24h: 4.5 },
        { id: 7, name: "ATM", logo: "/logos/atm.png", earned: 2, total: 7, color: "error", change24h: -0.8 },
        { id: 8, name: "ASR", logo: "/logos/asr.png", earned: 3.5, total: 9, color: "warning", change24h: 1.9 },
        // Diğer tokenler burada eklenebilir - Gerçek uygulamada 78 token olacak
    ]);
    
    // En çok kazanılan tokenler
    const [topTokens, setTopTokens] = useState<FanToken[]>([]);
    
    // Yeni kazanılan token (animasyon için)
    const [newReward, setNewReward] = useState<FanToken | null>(null);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
        
        // En çok kazanılan tokenleri hesapla
        const sorted = [...fanTokens].sort((a, b) => 
            (b.earned / b.total) - (a.earned / a.total)
        ).slice(0, 5);
        setTopTokens(sorted);
        
        // Toplam kazanılan token miktarını hesapla
        const total = fanTokens.reduce((sum, token) => sum + token.earned, 0);
        setTotalEarned(total);
        
        // Tahmini toplam değer (USDT)
        const value = fanTokens.reduce((sum, token) => sum + token.earned * (2 + Math.random() * 8), 0);
        setTotalValue(value);
        
        // Hedef tarih: 9 Mayıs 2025, 19:00
        const targetDate = new Date('2025-05-09T19:00:00');
        
        // Kalan zamanı hesaplayan fonksiyon
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();
            
            // Eğer tarih geçtiyse, sıfır değerlerini döndür
            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            
            // Kalan zamanı hesapla
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            return { days, hours, minutes, seconds };
        };
        
        // İlk hesaplama
        setTimeLeft(calculateTimeLeft());
        
        // Her saniyede bir güncelleme yapmak için interval oluştur
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        
        // Component unmount olduğunda interval'i temizle
        return () => clearInterval(timer);
    }, []);

    // Toplam kazanım yüzdesini hesapla
    const totalPercentage = 0

    return (
        <div className="max-w-7xl p-6 mx-auto min-h-screen font-sans">
            {/* Yeni ödül animasyonu */}
            {newReward && (
                <div className="fixed top-[20%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                              backdrop-blur-md bg-black/40 p-6 rounded-2xl z-[1000] flex flex-col items-center gap-3
                              shadow-[0_0_40px_rgba(255,193,7,0.5)] animate-fadeInOut border border-[#f7c15550]">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#f7c155] to-transparent opacity-10"></div>
                    <Zap size={42} className="text-amber-400" />
                    <h3 className="text-white text-center text-xl font-bold tracking-wide">
                        New Reward!
                    </h3>
                    <div className="bg-gradient-to-r from-[#ffffff10] to-transparent p-1 rounded-full">
                        <Image 
                            src={newReward.logo} 
                            alt={newReward.name}
                            width={64}
                            height={64}
                            className="rounded-full drop-shadow-lg"
                        />
                    </div>
                    <h4 className="text-amber-400 m-0 text-lg font-semibold flex items-center">
                        <Star size={14} className="mr-1" /> {newReward.name} +{(Math.random() * 0.3).toFixed(3)}
                    </h4>
                    <p className="text-gray-300 text-sm">
                        Make more trades to earn more!
                    </p>
                </div>
            )}

            {/* DashBoard Üst Kısım */}
            <div className="mb-8 text-center">
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 text-4xl md:text-5xl font-extrabold drop-shadow-sm tracking-tight mb-4">
                    ERSAN FAN TOKEN
                </h1>
                <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-700/10 border border-amber-500/20">
                    <Flame size={20} className="text-amber-400" />
                    <p className="text-amber-100 font-medium text-sm md:text-base tracking-wide">
                        Unique Earning Journey with 78 Fan Tokens
                    </p>
                    <Flame size={20} className="text-amber-400" />
                </div>
            </div>
            
            {/* Optimized Statistics InfoBar */}
            <div className="mb-2 bg-gradient-to-r from-[#1e1f3a] to-[#2a2d58] rounded-lg border border-indigo-500/10 shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* All Stats in a compact row format */}
                    <div className="flex flex-1 items-center gap-2 p-3 md:border-r border-white/5">
                        {/* Earnings */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex-shrink-0">
                            <Trophy size={16} className="text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between">
                                <p className="text-gray-400 text-xs uppercase tracking-wide truncate">Total Rewards</p>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white text-lg font-bold">{tokens.length }</span>
                                    <span className="text-indigo-300 text-xs">TOKENS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Countdown */}
                    <div className="flex flex-1 items-center gap-2 p-3 border-t md:border-t-0 md:border-r border-white/5">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0">
                            <Clock size={16} className="text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <p className="text-gray-400 text-xs uppercase tracking-wide truncate mr-1">Claim Date</p>
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                    </span>
                                </div>
                                <span className="text-white/60 text-[10px] bg-white/5 rounded px-1">
                                    {Math.floor((timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes) / (14 * 24 * 60) * 100)}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                                <div className="flex items-center gap-1">
                                    <div className="inline-flex items-baseline bg-black/20 px-1.5 py-0.5 rounded border border-white/10">
                                        <span className="text-white text-sm font-bold">{timeLeft.days}</span>
                                        <span className="text-purple-300 text-[10px] ml-0.5">d</span>
                                    </div>
                                    <span className="text-white/40">:</span>
                                    <div className="inline-flex items-baseline bg-black/20 px-1.5 py-0.5 rounded border border-white/10">
                                        <span className="text-white text-sm font-bold countdown-pulse">{timeLeft.hours.toString().padStart(2, '0')}</span>
                                        <span className="text-purple-300 text-[10px] ml-0.5">h</span>
                                    </div>
                                    <span className="text-white/40">:</span>
                                    <div className="inline-flex items-baseline bg-black/20 px-1.5 py-0.5 rounded border border-white/10">
                                        <span className="text-white text-sm font-bold countdown-pulse">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                                        <span className="text-purple-300 text-[10px] ml-0.5">m</span>
                                    </div>
                                    <span className="text-white/40">:</span>
                                    <div className="inline-flex items-baseline bg-black/20 px-1.5 py-0.5 rounded border border-white/10">
                                        <span className="text-white text-sm font-bold countdown-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                                        <span className="text-purple-300 text-[10px] ml-0.5">s</span>
                                    </div>
                                </div>
                                <div className="h-1 w-10 md:w-16 bg-black/30 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                        style={{ 
                                            width: `${100 - Math.floor((timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes) / (14 * 24 * 60) * 100)}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                  
                </div>
            </div>
            
            {/* Live Activity Feed Bar */}
            <div className="hidden mb-6 bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/10 backdrop-blur-sm rounded-lg border border-amber-500/20 overflow-hidden shadow-lg relative">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
                <div className="flex items-center overflow-hidden">
                    {/* Live Marker */}
                    <div className="flex items-center justify-center bg-gradient-to-r from-amber-600 to-red-600 py-2 px-3 border-r border-amber-500/20">
                        <div className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </div>
                        <span className="text-white font-bold text-xs tracking-wider">LIVE</span>
                    </div>
                    
                    {/* Scrolling Activity Feed */}
                    <div className="py-2 px-3 overflow-hidden relative flex-1">
                        <div className="animate-marquee whitespace-nowrap flex items-center">
                            {/* Activity Items - These would dynamically update in a real app */}
                            <div className="flex items-center mr-6">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-1.5">
                                    <ArrowUp size={12} className="text-white" />
                                </div>
                                <span className="text-amber-300 text-xs font-medium">user_12904</span>
                                <span className="text-white/70 text-xs mx-1">earned</span>
                                <span className="text-amber-300 text-xs font-bold">0.354 BAR</span>
                                <span className="text-green-400 text-xs font-medium ml-1">+$1.28</span>
                            </div>
                            <div className="flex items-center mr-6">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-1.5">
                                    <Zap size={12} className="text-white" />
                                </div>
                                <span className="text-amber-300 text-xs font-medium">crypto_master</span>
                                <span className="text-white/70 text-xs mx-1">traded</span>
                                <span className="text-amber-300 text-xs font-bold">13.7 PSG</span>
                                <span className="text-green-400 text-xs font-medium ml-1">+$42.89</span>
                            </div>
                            <div className="flex items-center mr-6">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center mr-1.5">
                                    <Trophy size={12} className="text-white" />
                                </div>
                                <span className="text-amber-300 text-xs font-medium">{newReward ? newReward.name : 'JUV'}</span>
                                <span className="text-white/70 text-xs mx-1">just hit</span>
                                <span className="text-amber-300 text-xs font-bold">$4.20 (+8.7%)</span>
                                <span className="text-amber-300/70 text-xs ml-1">last 24h</span>
                            </div>
                            <div className="flex items-center mr-6">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center mr-1.5">
                                    <Gift size={12} className="text-white" />
                                </div>
                                <span className="text-white/70 text-xs">Last reward pool:</span>
                                <span className="text-amber-300 text-xs font-bold ml-1">328.5 Tokens</span>
                                <span className="text-white/70 text-xs mx-1">distributed to</span>
                                <span className="text-amber-300 text-xs font-bold">197</span>
                                <span className="text-white/70 text-xs ml-1">users</span>
                            </div>
                            <div className="flex items-center mr-6">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mr-1.5">
                                    <TrendingUp size={12} className="text-white" />
                                </div>
                                <span className="text-white/70 text-xs">Last hour:</span>
                                <span className="text-amber-300 text-xs font-bold ml-1">1,284 trades</span>
                                <span className="text-white/70 text-xs mx-1">worth</span>
                                <span className="text-amber-300 text-xs font-bold">$849,723</span>
                            </div>
                            <div className="flex items-center mr-6">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-1.5">
                                    <ArrowUp size={12} className="text-white" />
                                </div>
                                <span className="text-amber-300 text-xs font-medium">whale_trader</span>
                                <span className="text-white/70 text-xs mx-1">earned</span>
                                <span className="text-amber-300 text-xs font-bold">1.75 CHZ</span>
                                <span className="text-green-400 text-xs font-medium ml-1">+$5.62</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="py-2 px-3 bg-gradient-to-r from-black/20 via-black/10 to-transparent border-l border-white/5 hidden md:block">
                        <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-amber-600 to-red-600 text-white h-7 px-2 rounded text-xs shadow-md">
                            <Zap size={10} className="mr-1" /> Join Now
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Genel İlerleme */}
            <Card className="bg-gradient-to-br from-[#1e1f3a] to-[#2c2e5e] border border-blue-500/10 shadow-xl mb-8">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <CardHeader className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex ites-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600">
                            <TrendingUp size={18} className="text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-xl">Fan Token Progress Status</h3>
                    </div>
                        {Math.floor(totalPercentage)}% Completed
                </CardHeader>
                
                <CardBody className="p-6">
                    <div className="mb-8">
                        {/* İlerleme başlık ve yüzde gösterimi - Düzeltilmiş konumlandırma */}
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-300">Fan Token Claim Progress</h4>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
                                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                                        {totalPercentage.toFixed(1)}%
                                    </span>
                                </div>
                                {/* İlerleme indikatörü - Temiz ve minimal */}
                                <div className="flex space-x-1">
                                    {totalPercentage > 25 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                    {totalPercentage > 50 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                    {totalPercentage > 75 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                </div>
                            </div>
                        </div>
                        
                        {/* Ana progress track - Basitleştirilmiş ve sabitlenmiş */}
                        <div className="h-7 bg-[#1a1c35] rounded-lg overflow-hidden border border-indigo-500/10 shadow-inner shadow-black/10">
                            {/* İlerleme çizgileri ve işaretler */}
                            <div className="relative h-full w-full">
                                {/* İşaretler */}
                                <div className="absolute inset-0 flex justify-between px-4 items-center pointer-events-none">
                                    {[25, 50, 75].map(value => (
                                        <div key={value} className="h-full w-px bg-indigo-500/10 relative">
                                            <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-indigo-400/40">
                                                {value}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* İlerleme dolgu */}
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400
                                              transition-all duration-1000 ease-out relative"
                                    style={{ width: `${totalPercentage}%` }}
                                >
                                    {/* Şimşek efekti */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                                    translate-x-[-100%] animate-shimmer-slow" />
                                       
                                    {/* Kenar parıltısı */}
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/40 blur-[1px]"></div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Alt İşaretler - Daha temiz ve daha az karmaşık */}
                        <div className="flex justify-between mt-2 px-3 text-xs text-gray-500">
                            <span>0%</span>
                            <span className="ml-6">25%</span>
                            <span className={`${totalPercentage >= 50 ? 'text-blue-400' : ''}`}>50%</span>
                            <span className={`mr-4 ${totalPercentage >= 75 ? 'text-blue-400' : ''}`}>75%</span>
                            <span className={`${totalPercentage >= 100 ? 'text-blue-400 font-medium' : ''}`}>100%</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white/5 rounded-xl p-4 mb-5">
                        <div>
                            <h4 className="text-gray-200 font-medium mb-1">
                                You can start earning after claiming your tokens.
                            </h4>
                            <p className="text-gray-400 text-sm">
                                Each trade increases your chance to earn more tokens!
                            </p>
                        </div>
                        <div className="flex mt-4 md:mt-0">
                            <Button 
                                size="lg" 
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/20
                                         transition-transform hover:translate-y-[-3px] hover:shadow-blue-500/30 rounded-xl">
                                <Zap size={18} className="mr-2" /> CLAIM YOUR TOKENS
                            </Button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2  gap-3">
                        <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center">
                            <span className="text-blue-400 text-sm mb-1">Total Users</span>
                            <span className="text-white font-bold">0</span>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center">
                            <span className="text-green-400 text-sm mb-1">Reward Assets</span>
                            <span className="text-white font-bold">{tokens.length}</span>
                        </div>
                    </div>
                </CardBody>
            </Card>
            
            {/* Professional Fan Token Collection with Level System */}
            <Card className="bg-gradient-to-br from-[#1e1f3a] to-[#2c2e5e] border border-blue-500/10 shadow-xl mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                
                {/* Header with User Level based on holdings */}
                <CardHeader className="flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-indigo-400/30">
                                <Gift size={20} className="text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold border border-amber-400/50 shadow-lg">
                                3
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-xl">Fan Token Collection</h3>
                            <p className="text-gray-400 text-xs mt-1">Hold more tokens to increase your level and unlock rewards</p>
                        </div>
                    </div>
                    
                    {/* Level based on Token Holdings */}
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 w-full sm:w-auto sm:min-w-[260px]">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold">
                                    0
                                </div>
                                <span className="text-white text-sm font-medium">Level 1 Collector</span>
                            </div>
                            <Badge color="warning" variant="flat" size="sm" className="text-[10px]">
                                0 Tokens Held
                            </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Current Holdings</span>
                            <span>
                                <span className="text-amber-400 font-medium">{0}</span>
                                <span className="mx-1">/</span>
                                <span>1000 tokens for Level 1</span>
                            </span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                                style={{ 
                                    width: `${Math.min(0 / 100 * 100, 100)}%` 
                                }}
                            ></div>
                        </div>
                        <div className="flex flex-wrap justify-between mt-1.5">
                            <div className="flex gap-1.5">
                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold">1</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">2</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">3</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">4</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">5</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">6</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">7</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">8</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">9</div>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700/30 border border-gray-600/30 text-gray-500 text-[10px] font-bold">10</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1.5 sm:mt-0">
                                <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                        <path d="M12 13V2l8 4-8 4"></path>
                                        <path d="M20.55 10.23A9 9 0 1 1 8 4.94"></path>
                                        <path d="M8 10a5 5 0 1 0 8.9 2.02"></path>
                                    </svg>
                                    Increase your holdings to level up and unlock more token rewards
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                
                {/* Level Requirements Info Bar */}
                <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-b border-amber-500/10 text-amber-300 text-xs">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-700 text-white text-[8px] font-bold">1</div>
                            <span>5+ tokens</span>
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-700 text-white text-[8px] font-bold">2</div>
                            <span>25+ tokens</span>
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center rounded-full bg-amber-500 text-white text-[8px] font-bold">3</div>
                            <span>50+ tokens</span>
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-700/30 text-gray-400 text-[8px] font-bold">4</div>
                            <span>100+ tokens</span>
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-700/30 text-gray-400 text-[8px] font-bold">5</div>
                            <span>250+ tokens</span>
                        </span>
                    </div>
                </div>
                
                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row justify-between px-6 py-3 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-2 mb-3 md:mb-0 overflow-x-auto p-0.5 -mx-0.5">
                        <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white">
                            All Assets (78)
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-green-600/20 to-green-600/20 text-green-300 border border-green-500/20">
                            Unlocked ({fanTokens.length})
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-red-600/20 to-red-600/20 text-red-300 border border-red-500/20">
                            Locked (33)
                        </Button>
                        <Button size="sm" className="bg-transparent text-gray-400 hover:bg-white/10">
                            Claimable (5)
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg block w-full pl-10 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search fan tokens..." 
                        />
                    </div>
                </div>
                
                <CardBody className="p-6">
                    <LevelTokens
                        level={1}
                        title="Level 1 - Starter Token"
                        badgeText="Beginner Level"
                        color="red"
                        tokens={1}
                        isLocked={true}
                        showViewMore={false}
                    />
                    
                    <LevelTokens
                        level={2}
                        title="Level 2 - Basic Tokens"
                        badgeText="4 Tokens"
                        color="orange"
                        tokens={3}
                        isLocked={true}
                        showViewMore={false}
                    />
                    
                    <LevelTokens
                        level={3}
                        title="Level 3 - Advanced Tokens"
                        badgeText="5 Tokens"
                        color="yellow"
                        tokens={5}
                        isLocked={true}
                        showViewMore={false}
                    />
                    
                    <LevelTokens
                        level={4}
                        title="Level 4 - Premium Tokens"
                        badgeText="7 Tokens"
                        color="green"
                        tokens={7}
                        isLocked={true}
                        requiredTokens={100}
                        currentTokens={totalEarned}
                        showViewMore={false}
                    />
                    
                    <LevelTokens
                        level={5}
                        title="Level 5 - Elite Tokens"
                        badgeText="9 Tokens"
                        color="blue"
                        tokens={9}
                        isLocked={true}
                        requiredTokens={250}
                        currentTokens={totalEarned}
                        showViewMore={false}
                    />
                    
                    <LevelTokens
                        level={6}
                        title="Level 6 - Legendary Tokens"
                        badgeText="11 Tokens"
                        color="purple"
                        tokens={11}
                        isLocked={true}
                        requiredTokens={500}
                        currentTokens={totalEarned}
                        showViewMore={false}
                    />
                    
                    {/* Yeni Leveller */}
                    <LevelTokens
                        level={7}
                        title="Level 7 - Mythic Tokens"
                        badgeText="13 Tokens"
                        color="pink"
                        tokens={13}
                        isLocked={true}
                        requiredTokens={850}
                        currentTokens={totalEarned}
                        showViewMore={false}
                    />
                    
                    <LevelTokens
                        level={8}
                        title="Level 8 - Divine Tokens"
                        badgeText="15 Tokens"
                        color="cyan"
                        tokens={15}
                        isLocked={true}
                        requiredTokens={1300}
                        currentTokens={totalEarned}
                        showViewMore={false}
                    />
                    
                    <LevelTokens
                        level={9}
                        title="Level 9 - Celestial Tokens"
                        badgeText="17 Tokens"
                        color="indigo"
                        tokens={17}
                        isLocked={true}
                        requiredTokens={1850}
                        currentTokens={totalEarned}
                        showViewMore={false}
                    />
                    
                    <LevelTokens
                        level={10}
                        title="Level 10 - Immortal Tokens"
                        badgeText="19 Tokens"
                        color="gold"
                        tokens={19}
                        isLocked={true}
                        requiredTokens={2500}
                        currentTokens={totalEarned}
                        showViewMore={false}
                    />
                </CardBody>
                
                <div className="border-t border-white/5 p-4 bg-black/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <path d="M12 13V2l8 4-8 4"></path>
                                <path d="M20.55 10.23A9 9 0 1 1 8 4.94"></path>
                                <path d="M8 10a5 5 0 1 0 8.9 2.02"></path>
                            </svg>
                            <span className="text-gray-300 text-sm">
                                Increase your holdings to level up and unlock more token rewards
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" className="bg-white/5 text-gray-300 hover:bg-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                                Level Guide
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <Zap size={14} className="mr-1"/> Buy More Tokens
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
       
            {/* CTA Buton */}
            <div className="text-center mb-10">
                <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-6 px-8 text-lg
                             shadow-xl shadow-blue-900/30 transition-all hover:scale-105 hover:shadow-blue-900/40
                             rounded-xl border border-blue-500/20">
                    <Zap size={22} className="mr-3" /> TRADE & EARN NOW!
                </Button>
                <p className="text-blue-300/70 text-sm mt-3">
                    Every trade is a chance to earn new fan tokens!
                </p>
            </div>
            
            {/* Animasyonlu CSS ve Görsel Detaylar */}
            <style jsx global>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -60%); }
                    10% { opacity: 1; transform: translate(-50%, -50%); }
                    90% { opacity: 1; transform: translate(-50%, -50%); }
                    100% { opacity: 0; transform: translate(-50%, -40%); }
                }

                .bg-grid-pattern {
                    background-image: 
                        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                
                .text-shadow {
                    text-shadow: 0 0 10px rgba(255,255,255,0.3);
                }
                
                .animate-pulse {
                    animation: pulse 2s infinite;
                }
                
                .animate-fadeInOut {
                    animation: fadeInOut 3s forwards;
                }

                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-180%); }
                }
                .animate-marquee {
                    animation: marquee 35s linear infinite;
                }

                @keyframes shimmer-slow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer-slow {
                    animation: shimmer-slow 3s infinite;
                }
            `}</style>
        </div>
    );
}

    export default FANPAGE;


