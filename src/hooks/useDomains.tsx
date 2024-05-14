export const isKEWL = () => {
   return  window.location.host === 'www.kewl.exchange' || window.location.host === 'www.kewlswap.com' || window.location.host === '127.0.0.1:3000'
}


export const isIMON = () => {
    console.log("IMON",window.location.host)
    return  window.location.host === 'www.kewl.exchange' || window.location.host === 'www.kewlswap.com' || window.location.host === 'www.imon.ai' || window.location.host === 'imon.ai' || window.location.host === '127.0.0.1:3000' || window.location.host === 'latest.imon.ai' || window.location.host === 'https://imon-git-main-imon.vercel.app/'  || window.location.host === 'https://imon-git-main-imon.vercel.app'   
 }

export const isCHZDomains  = () =>{
   return  window.location.host === 'www.chz.domains' || window.location.host === 'chz.domains' || window.location.host === 'localhost:3000'
 }


export const isPonyGames  = () =>{
   return  window.location.host === 'www.ponygames.xyz' || window.location.host === 'ponygames.xyz' || window.location.host === '192.168.1.95:3000' || window.location.host === '192.168.1.96:3000'
 }
