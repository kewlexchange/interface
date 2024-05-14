// src/components/Head.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const PonyGamesHead: React.FC = () => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <link rel="icon" href="/ponygames.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#FFFFFF" />
      <meta name="description" content="Pony Games - Elevate Your Gaming Experience with Our Route to Triumph and Beyond!" />
      <link rel="apple-touch-icon" href="/logo192.png" />
      <link rel="manifest" href="/manifest.json" />
      <title>Pony Games - Elevate Your Gaming Experience with Our Route to Triumph and Beyond!</title>
      <link rel="canonical" href="https://ponygames.xyz/" />
      <meta property="og:locale" content="en-us" />
      <meta property="og:type" content="article" />
      <meta property="og:title" content="Pony Games - Elevate Your Gaming Experience with Our Route to Triumph and Beyond!" />
      <meta property="og:description" content="Pony Games - Elevate Your Gaming Experience with Our Route to Triumph and Beyond!" />
      <meta property="og:url" content="https://ponygames.xyz/" />
      <meta property="og:site_name" content="ponygamesxyz" />
      <meta property="article:publisher" content="https://twitter.com/ponygamesxyz" />
      <meta property="og:image" content="https://ponygames.xyz/images/ponygames-logo.png" />
      <meta property="og:image:secure_url" content="https://ponygames.xyz/images/ponygames-logo.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content="Pony Games - Elevate Your Gaming Experience with Our Route to Triumph and Beyond!" />
      <meta name="twitter:title" content="Pony Games" />
      <meta name="twitter:site" content="@ponygamesxyz" />
      <meta name="twitter:image" content="https://ponygames.xyz/images/ponygames-logo.png" />
      <meta name="twitter:creator" content="@ponygamesxyz" />
      <meta name="author" content="ponygames.xyz" />
      <meta name="publisher" content="ponygames.xyz" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="use-credentials" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"/>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-K7BR8D3QQB"></script>
    </Helmet>
  );
};

export default PonyGamesHead;
