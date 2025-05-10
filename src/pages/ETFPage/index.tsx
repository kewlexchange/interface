import React, { useState, useEffect } from "react";
import { Progress, Image } from "@nextui-org/react";
import { tokens } from "../../Components/SwapComponents/Fan/Components/Data";

const ETFPAGE = () => {
  // 🎮 Level & XP
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const gainXp = (amount: number) => {
    let newXp = xp + amount, lvl = level;
    while (newXp >= lvl * 100) {
      newXp -= lvl * 100;
      lvl++;
    }
    setLevel(lvl);
    setXp(newXp);
  };

  // 🎲 Secret FanToken & game state
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  useEffect(() => {
    const rnd = tokens[Math.floor(Math.random() * tokens.length)].address;
    setSecret(rnd);
  }, []);

  return (
    <div style={{
      padding: 24,
      maxWidth: 600,
      margin: "auto",
      textAlign: "center",
      background: "#121212",
      color: "#e0e0e0",
      borderRadius: 8
    }}>
  
  
      {/* ── Holographic Neon FOMO Banner ── */}
      <style>{`
        /* ← Grand 3D Neon Hero Banner → */
        @keyframes rotate-gradient {
          0%   { background-position:   0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes glow-flicker {
          0%,100% { opacity: 1; filter: drop-shadow(0 0 16px #ff4b2b); }
          50%     { opacity: 0.8; filter: drop-shadow(0 0 8px #f0f); }
        }
        @keyframes flare {
          0%   { transform: scale(1) translate(-50%,-50%); opacity: 0.5; }
          50%  { transform: scale(1.2) translate(-50%,-50%); opacity: 0.8; }
          100% { transform: scale(1) translate(-50%,-50%); opacity: 0.5; }
        }

        .fomo-banner.big-banner {
          perspective: 1000px;
          transform-style: preserve-3d;
          transform: rotateX(5deg);
          background: linear-gradient(120deg, #ff416c, #ff4b2b, #ffcc00, #0ff, #f0f);
          background-size: 500% 500%;
          animation: rotate-gradient 10s linear infinite;
          position: relative;
          box-shadow:
            inset 0 0 50px rgba(255,65,108,0.5),
            0 0 30px rgba(240,0,255,0.7);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          overflow: hidden;
        }
        .fomo-banner.big-banner::before {
          content: "";
          position: absolute; inset: 0;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(255,255,255,0.2), transparent 70%
          );
          mix-blend-mode: screen;
          animation: flare 3s ease-in-out infinite;
        }
        .fomo-banner.big-banner h2 {
          font-family: "Orbitron", sans-serif;
          font-size: 2.5rem;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          filter:
            drop-shadow(0 0 12px rgba(255,255,255,0.9))
            drop-shadow(0 0 16px rgba(255,200,64,0.7));
          animation: glow-flicker 2s ease-in-out infinite;
          margin: 0;
        }
        .fomo-banner.big-banner p {
          font-size: 1.1rem;
          color: #eee;
          text-shadow: 0 0 8px rgba(255,255,255,0.6);
          animation: glow-flicker 2s ease-in-out infinite;
          margin-top: 8px;
        }
      `}</style>

      {/* 🚀 FOMO Banner */}
      <div className="fomo-banner big-banner">
        <h2>20000 CHZ ÖDÜL!</h2>
        <p>Doğru Fan Token'ı bulan kazanır!</p>
      </div>

      {/* 🎯 Game Info */}
      <h3>⭐ Level {level}</h3>
      <Progress value={(xp / (level * 100)) * 100} color="warning" size="sm" css={{ mb: "$8" }} />
      {message && <p style={{ color: gameOver ? "#4caf50" : "#f44336", fontWeight: 600 }}>{message}</p>}
      {balance > 0 && <p style={{ color: "#ffd740", fontWeight: 600 }}>🎉 Kazandığınız CHZ: {balance}</p>}

      {/* ▶︎ Token Selection Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(60px,1fr))",
        gap: 12,
        marginTop: 24
      }}>
        {tokens.map((t) => (
          <div
            key={t.address}
            onClick={() => {
              if (!gameOver) {
                if (t.address === secret) {
                  setMessage("🎉 Tebrikler! 20000 CHZ kazandınız!");
                  setBalance(20000);
                  setGameOver(true);
                  gainXp(200);
                } else {
                  setMessage("❌ Yanlış seçim, tekrar deneyin!");
                  gainXp(10);
                }
              }
            }}
            style={{
              cursor: "pointer",
              padding: 8,
              background: "#1e1e1e",
              borderRadius: 8
            }}
          >
            <Image src={t.logoURI} alt={t.symbol} width={40} height={40} />
            <div style={{ fontSize: 10, marginTop: 4 }}>{t.symbol}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ETFPAGE;


