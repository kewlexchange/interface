import { Slider, Image, Badge, Spinner } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";

const TokenInfoComponent = () => {

     // Token verileri
     const totalTokens = 1000000;
     const circulatingTokens = 117000; // Dolaşımdaki token
     const burnedTokens = 883000; // Yakılmış token
     const lockedTokens = 20000; // Kilitli token

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
      
   
      
        const totalSquares = 1024; // Toplam kare sayısı
        const sideLength = Math.sqrt(totalSquares); // Kare düzen için kenar uzunluğu
        const canvasSize = Math.min(window.innerWidth, window.innerHeight) - 20; // Ekrana sığacak boyut
        const squareSize = canvasSize / sideLength; // Her bir karenin boyutu
      
        // Token başına kare sayısını hesapla
        const tokenPerSquare = totalTokens / totalSquares;
      
        // Canvas boyutlarını ayarla
        canvas.width = canvasSize;
        canvas.height = canvasSize+30;
      
        let squareIndex = 0;
      
        for (let row = 0; row < sideLength; row++) {
          for (let col = 0; col < sideLength; col++) {
            const x = col * squareSize;
            const y = row * squareSize;
      
            let fillColor = "blue"; // Varsayılan renk mavi
      
            // Kırmızı renk için: Yakılmış token
            if (squareIndex < burnedTokens / tokenPerSquare) {
                fillColor = "rgba(255, 0, 0, 0.9)"; // Kırmızı renk ve alfa değeri
            }
            // Yeşil renk için: Dolaşımdaki token
            else if (squareIndex < (burnedTokens + circulatingTokens - lockedTokens) / tokenPerSquare) {
              fillColor = "green"; // Dolaşımdaki, ama kilitli olmayan tokenler
            }
            // Mavi renk için: Kilitli token
            else if (squareIndex < (burnedTokens + circulatingTokens) / tokenPerSquare) {
              fillColor = "blue"; // Kilitli tokenler
            }
      
            // Dış hatları yuvarlatmak için path başlat
            ctx.beginPath();
            ctx.moveTo(x + 5, y); // Sol üst köşede 5px yuvarlak başlat
            ctx.arcTo(x + squareSize, y, x + squareSize, y + squareSize, 5); // Üst sağ köşe
            ctx.arcTo(x + squareSize, y + squareSize, x, y + squareSize, 5); // Alt sağ köşe
            ctx.arcTo(x, y + squareSize, x, y, 5); // Alt sol köşe
            ctx.arcTo(x, y, x + 5, y, 5); // Üst sol köşe
            ctx.closePath();
      
            ctx.fillStyle = fillColor; // Renk seçimi
            ctx.fill(); // Renk ile kareyi doldur
      
            ctx.strokeStyle = "black"; // Kare kenar rengi
            ctx.lineWidth = 2; // Çizgi kalınlığı
            ctx.stroke(); // Kenar çizgisi
      
            // Kırmızı karelere ateş emojisi ekle
            if (squareIndex < burnedTokens / tokenPerSquare) {
                ctx.font = `${squareSize * 0.6}px Arial`; // Emojiyi kareye uyacak şekilde boyutlandır
              ctx.textAlign = "center"; // Ortalamak için
              ctx.textBaseline = "middle"; // Ortalamak için
              ctx.fillText("🔥", x + squareSize / 2, y + squareSize / 2); // Ateş emojisini çiz
            }
      
            squareIndex++;
          }
        }
     
        
  // Açıklama barı ekleyelim
  const barHeight = 30;
  const barMargin = 20;

  // Bar için arka plan
  ctx.fillStyle = "#f0f0f0"; // Açık gri
  ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight); // Barı çizin

  // Renkli alanlar
  const colorWidth = canvas.width / 3;
  ctx.fillStyle = "red";
  ctx.fillRect(0, canvas.height - barHeight, colorWidth, barHeight); // Kırmızı alan
  ctx.fillStyle = "green";
  ctx.fillRect(colorWidth, canvas.height - barHeight, colorWidth, barHeight); // Yeşil alan
  ctx.fillStyle = "blue";
  ctx.fillRect(colorWidth * 2, canvas.height - barHeight, colorWidth, barHeight); // Mavi alan

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
                            <span>117.000.00 KWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Circulating Supply</span>
                            <span>97.000.00 KWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Burned Tokens</span>
                            <span>883.000.00 KWL</span>
                        </div>
                        <div className="w-full flex flex-row gap-2 justify-between items-center">
                            <span>Locked Tokens</span>
                            <span>20.000.00 KWL</span>
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
