import { Slider, Image, Badge, Spinner } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";

const TokenInfoComponent = () => {

     // Token verileri
     const totalTokens = 1000000;
     const circulatingTokens = 100000; // Dolaşımdaki token
     const burnedTokens = 900000; // Yakılmış token
     const lockedTokens = 11000; // Kilitli token

    const [blocks, setBlocks] = useState([]);


    


    function formatNums(num, sep, dec, u) {
        sep = sep || ','; u = u || '\\d'; if (typeof num != 'string') {
            num = String(num);
            if (dec && dec != '.')
                num = num.replace('.', dec);
        }
        return num.replace(RegExp('\\' + (dec || '.') + u + '+|' + u + '(?=(?:' + u + '{3})+(?!' + u + '))', 'g'), function (a) {
            return a.length == 1 ? a + sep : a
        })
    }

    function numberWithCommas(value) {
        return formatNums(value, ',', '.', '[\\d\\u0660-\\u0669\\u06f0-\\u06f9]');
    }


  
    
    function drawGrid(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            console.error("Canvas element not found.");
            return;
        }
    
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.error("Unable to get canvas context.");
            return;
        }
    
        const totalCircles = 1024; // Toplam daire sayısı
        const canvasSize = Math.min(window.innerWidth, window.innerHeight) - 20; // Ekran boyutu
        const centerX = canvasSize / 2; // Spiral merkezi X
        const centerY = canvasSize / 2; // Spiral merkezi Y
        const maxRadius = canvasSize / 2.5; // Spiral için maksimum yarıçap (daha geniş spiral için artırıldı)
        const circleSize = 20; // Daire çapı (daha büyük daireler)
        const angleStep = 0.15; // Açının artış miktarı (daha sıkı spiral)
        const radiusStep = maxRadius / totalCircles * 1.2; // Yarıçap artış miktarı (daha düzenli spiral)
    
        // Token başına düşen daire sayısını hesapla
        const tokenPerCircle = totalTokens / totalCircles;
    
        // Canvas boyutlarını ayarla
        canvas.width = canvasSize;
        canvas.height = canvasSize + 50;
    
        let angle = 0; // Başlangıç açısı
        let radius = 0; // Başlangıç yarıçapı
        let circleIndex = 0;
    
        // Spiral düzeninde daireleri çiz
        for (let i = 0; i < totalCircles; i++) {
            // Polar koordinatları kullanarak daire merkezi hesapla
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
    
            let fillColor = "blue"; // Varsayılan renk mavi
    
            // Kırmızı renk: Yakılmış token
            if (circleIndex < burnedTokens / tokenPerCircle) {
                fillColor = "rgba(255, 0, 0, 0.9)";
            }
            // Yeşil renk: Dolaşımdaki token
            else if (circleIndex < (burnedTokens + circulatingTokens - lockedTokens) / tokenPerCircle) {
                fillColor = "green";
            }
            // Mavi renk: Kilitli token
            else if (circleIndex < (burnedTokens + circulatingTokens) / tokenPerCircle) {
                fillColor = "blue";
            }
    
            // Daireyi çiz
            ctx.beginPath();
            ctx.arc(x, y, circleSize / 2, 0, Math.PI * 2); // Dairenin dış hatları
            ctx.closePath();
    
            ctx.fillStyle = fillColor; // Dairenin rengi
            ctx.fill();
    
            ctx.strokeStyle = "black"; // Kenar rengi
            ctx.lineWidth = 1; // Çizgi kalınlığı
            ctx.stroke();
    
            // Kırmızı dairelere ateş emojisi ekle
            if (circleIndex < burnedTokens / tokenPerCircle) {
                ctx.font = `${circleSize * 0.6}px Arial`; // Emoji boyutu
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("🔥", x, y);
            }
    
            // Spiral için açıyı ve yarıçapı artır
            angle += angleStep;
            radius += radiusStep;
    
            circleIndex++;
        }
    
        // Açıklama barı ekleyelim
        const barHeight = 30;
    
        // Bar için arka plan
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
    
        // Renkli alanlar
        const colorWidth = canvas.width / 3;
        ctx.fillStyle = "red";
        ctx.fillRect(0, canvas.height - barHeight, colorWidth, barHeight);
        ctx.fillStyle = "green";
        ctx.fillRect(colorWidth, canvas.height - barHeight, colorWidth, barHeight);
        ctx.fillStyle = "blue";
        ctx.fillRect(colorWidth * 2, canvas.height - barHeight, colorWidth, barHeight);
    
        // Renkler için yazılar
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Burned", colorWidth / 2, canvas.height - barHeight / 2);
        ctx.fillText("Holders", colorWidth * 1.5, canvas.height - barHeight / 2);
        ctx.fillText("Locked", colorWidth * 2.5, canvas.height - barHeight / 2);
    }
      
    const initData = async () => {

        drawGrid("gridCanvas");

    }

    useEffect(() => {
        initData();
    }, [])


    return (
        <>
            <div className={"w-full px-2 py-5"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>

                    <div className="w-full">
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Asset</span>
                            <span>KEWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Symbol</span>
                            <span>KWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Chain</span>
                            <span>Chiliz</span>
                        </div>
                    </div>

                    <div className="w-full">
                        <h1 className="text-lg">KWL Token Metrics</h1>


                    <div className="w-full">
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Initial Supply</span>
                            <span>1.000.000.00 KWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Max Supply</span>
                            <span>100.000.00 KWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Circulating Supply</span>
                            <span>100.000.00 KWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Burned Tokens</span>
                            <span>900.000.00 KWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Locked Tokens</span>
                            <span>10.000.00 KWL</span>
                        </div>
                    </div>
                    </div>

                    <div className="w-full">


                        <div className="w-full rounded-lg">
                            <canvas id="gridCanvas"></canvas>
                        </div>

                    </div>
                </div>
            </div>


        </>
    )
}


export default TokenInfoComponent;
