// src/components/Head.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const Head: React.FC = () => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <link rel="icon" href="/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#FFFFFF" />
      <meta name="description" content="KEWL - KEWL EXCHANGE" />
      <link rel="apple-touch-icon" href="/logo192.png" />
      <link rel="manifest" href="/manifest.json" />
      <title>KEWL - KEWL EXCHANGE</title>
      <link rel="canonical" href="https://kewl.exchange/" />
      <meta property="og:locale" content="en-us" />
      <meta property="og:type" content="article" />
      <meta property="og:title" content="KEWL - KEWL EXCHANGE" />
      <meta property="og:description" content="Join the fully community-driven revolution of decentralized finance on the blockchain with the power of revolutionary technology." />
      <meta property="og:url" content="https://kewl.exchange/" />
      <meta property="og:site_name" content="kewl" />
      <meta property="article:publisher" content="https://twitter.com/kewlswap" />
      <meta property="og:image" content="https://kewl.exchange/images/imon-logo.png" />
      <meta property="og:image:secure_url" content="https://kewl.exchange/images/imon-logo.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content="Join the fully community-driven revolution of decentralized finance on the blockchain with the power of revolutionary technology." />
      <meta name="twitter:title" content="KEWL - KEWL EXCHANGE" />
      <meta name="twitter:site" content="@kewlswap" />
      <meta name="twitter:image" content="https://kewl.exchange/images/imon-logo.png" />
      <meta name="twitter:creator" content="@kewlswap" />
      <meta name="author" content="kewl" />
      <meta name="publisher" content="kewl" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="use-credentials" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"/>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-K7BR8D3QQB"></script>
     
    </Helmet>
  );
};

export default Head;
