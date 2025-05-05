import React from "react";
import { Badge, Tooltip } from "@nextui-org/react";
import { ChevronRight, Lock, CheckCircle, TrendingUp, Zap } from "lucide-react";

interface LevelTokensProps {
  level: number;
  title: string;
  badgeText: string;
  color: string; // Renk parametresini göz ardı edeceğiz çünkü sabit renk kullanacağız
  tokens: number;
  isLocked: boolean;
  currentTokens?: number;
  requiredTokens?: number;
  showViewMore?: boolean;
}

const LevelTokens: React.FC<LevelTokensProps> = ({
  level,
  title,
  badgeText,
  tokens,
  isLocked,
  currentTokens = 0,
  requiredTokens = 0,
  showViewMore = true
}) => {
  // Ana renk değerleri (bg-gradient-to-br from-[#1e1f3a] to-[#2c2e5e] ile uyumlu)
  const primaryColor = "#5865f2"; // Discord mavisi - aksan rengi
  
  return (
    <div className="mb-8">
      {/* Ana seviye başlığı */}
      <div className="bg-gradient-to-br from-[#1e1f3a] to-[#2c2e5e] rounded-xl p-5 mb-4 border border-indigo-500/10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-md">
              {level}
            </div>
            
            <div>
              <h3 className="text-white text-lg font-medium">{title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <Badge className="bg-indigo-600 text-white text-xs py-0.5 px-2">
                  {badgeText}
                </Badge>
                
                {isLocked ? (
                  <span className="text-gray-400 text-xs flex items-center">
                    <Lock size={10} className="mr-1" />
                    {requiredTokens - currentTokens} token gerekli
                  </span>
                ) : (
                  <span className="text-indigo-400 text-xs flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1"></span>
                    Aktif
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-white font-medium">{tokens}</div>
              <div className="text-indigo-300 text-xs">Token</div>
            </div>
            
            <div className="text-center">
              <div className="text-white font-medium">{isLocked ? 0 : currentTokens}</div>
              <div className="text-indigo-300 text-xs">Kazanılan</div>
            </div>
            
            {!isLocked && (
              <div className="text-center">
                <div className="text-indigo-400 font-medium flex items-center justify-center">
                  <TrendingUp size={14} className="mr-1" />
                  {level * 5}%
                </div>
                <div className="text-indigo-300 text-xs">ROI</div>
              </div>
            )}
          </div>
        </div>
        
        {/* İlerleme çubuğu */}
        <div className="mt-4 pt-4 border-t border-indigo-500/10">
          <div className="flex justify-between text-xs text-indigo-300 mb-1.5">
            <span>İlerleme</span>
            <span>{isLocked ? '0%' : `${Math.min(100, Math.round((currentTokens / tokens) * 100))}%`}</span>
          </div>
          <div className="h-1.5 bg-indigo-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: isLocked ? '0%' : `${Math.min(100, Math.round((currentTokens / tokens) * 100))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Token kartları grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {[...Array(tokens)].map((_, index) => {
          const progressValue = isLocked ? 0 : Math.max(5, 95 - index * 15);
          const tokenValue = isLocked ? 0 : Math.round(20 - index * 2);
          const maxValue = 10 + level;
          
          return (
            <Tooltip 
              key={`token-${level}-${index}`}
              content={isLocked ? `${requiredTokens} token gerekli` : `${tokenValue}/${maxValue} tamamlandı`}
            >
              <div className={`
                overflow-hidden transition-all duration-300
                bg-gradient-to-br from-[#1e1f3a] to-[#2c2e5e]
                border ${isLocked ? 'border-slate-700/20' : 'border-indigo-500/20'}
                hover:border-indigo-500/30 hover:-translate-y-1
                rounded-lg shadow-lg ${isLocked ? 'opacity-80' : ''}
              `}>
                {/* Kart başlığı */}
                <div className="flex justify-between items-center p-3 border-b border-indigo-500/10">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className={isLocked ? "text-gray-500" : "text-indigo-400"} />
                    <span className={isLocked ? "text-gray-400" : "text-indigo-300"}>
                      #{index + 1}
                    </span>
                  </div>
                  
                  {!isLocked && index === 0 ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle size={12} className="text-emerald-500" />
                    </div>
                  ) : isLocked ? (
                    <Lock size={14} className="text-gray-500" />
                  ) : null}
                </div>
                
                {/* Kart içeriği */}
                <div className="p-3">
                  <h4 className={`text-sm font-medium mb-3 ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                    {title.split(' - ')[1] || "Token"}
                  </h4>
                  
                  {/* İlerleme çubuğu */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={isLocked ? 'text-gray-500' : 'text-indigo-300'}>İlerleme</span>
                      <span className={isLocked ? 'text-gray-500' : 'text-indigo-300'}>
                        {isLocked ? '0%' : `${progressValue}%`}
                      </span>
                    </div>
                    <div className="h-1 bg-indigo-900/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isLocked ? 'bg-gray-600/30' : 'bg-indigo-600'} rounded-full`}
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Değerler */}
                  <div className="flex justify-between mb-4 text-xs">
                    <div>
                      <div className="text-gray-400">Tamamlama</div>
                      <div className={isLocked ? 'text-gray-500' : 'text-white'}>
                        {tokenValue}/{maxValue}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Değer</div>
                      <div className={isLocked ? 'text-gray-500' : 'text-indigo-300'}>
                        {isLocked ? '--' : `${level * 3 + (10 - index)} USDT`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Buton */}
                  <button 
                    className={`
                      w-full py-1.5 text-xs font-medium rounded 
                      ${isLocked 
                        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }
                      transition-colors duration-200
                    `}
                    disabled={isLocked}
                  >
                    {isLocked ? "Kilitli" : "Talep Et"}
                  </button>
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
      
      {/* Tümünü Görüntüle Butonu */}
      {tokens > 6 && showViewMore && (
        <div className="flex justify-center mt-4">
          <button className="
            flex items-center gap-1 px-4 py-1.5 text-sm
            text-indigo-400 bg-indigo-950/30 hover:bg-indigo-900/20 
            border border-indigo-500/20 rounded-md transition-colors duration-200
          ">
            <span>Tüm Tokenler</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LevelTokens;