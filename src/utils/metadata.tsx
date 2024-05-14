import { uriToHttp, uriToIMONProxy } from ".";

const BASE64_ENCODING_STRING = "data:application/json;base64,";
const IPFS_STRING = "ipfs://"

export const parseMetadata = async(contractAddress : any, tokenId : any, assetURI : any ) : any => {
    let success = false;
    let message = ""
    let metadata = ""
    let image = ""
    let animation = ""
    let is_embedded = false

    console.log("ERSAN")
    if(assetURI.toString()===""){
        success = false;
        message = "Metadata is empty!";
    }

    console.log("ASSET URI",assetURI,"TOKEN",contractAddress,"ID",tokenId)

    if (assetURI.includes(BASE64_ENCODING_STRING)) {
        try{
            let metadataStr = assetURI.substring(BASE64_ENCODING_STRING.length, assetURI.length - 0);
            let metadataJSON = JSON.parse(decodeURIComponent(atob(metadataStr)));
            image = metadataJSON.image
            is_embedded = true
            metadata = metadataJSON
            success = true;
            message = "BASE64:METADATA:SUCCEED"
        }catch(e){
            success = false;
            message = "BASE64:METADATA:FAILED"
        }
    } else if (assetURI.includes(IPFS_STRING)) {
        const regex = /{id}/g;
        const fixedURI = assetURI.replace(regex, tokenId);
        console.log("fixedURI URI",fixedURI)

        let httpURI = uriToHttp(fixedURI);
        let requestURI = fixedURI.includes(tokenId) ? httpURI[0] : httpURI[1]

        console.log("REQUEST URI",requestURI)
        const metadataJSON = await (await fetch(requestURI)).json();
        try{
            image = metadataJSON?.image
            is_embedded = false
            metadata = metadataJSON
            success = true;
        }catch{
            success = false;
            message = "IPFS:METADATA:FAILED"
        }
    }else{
        const metadataJSON = await (await fetch(uriToIMONProxy(assetURI +"?v=2"))).json();
        console.log("IMONPROXY",metadataJSON)
        try{
            image = metadataJSON?.image
            is_embedded = false
            metadata = metadataJSON
            success = true;
        }catch{
            success = false;
            message = "IPFS:METADATA:FAILED"
        }
    }

    if(!image){
        image = ""
    }
    if(!animation){
        animation = ""
    }
    if(success){
        if(image.length > 0 && image.includes(IPFS_STRING)){
            let imageIndex = image.includes(tokenId) ? 0 : 1
            image = uriToHttp(image)[imageIndex]
        }
        if(animation.length > 0 && animation && animation.includes(IPFS_STRING)){
            let animationIndex = animation.includes(tokenId) ? 0 : 1
            animation = uriToHttp(animation)[animationIndex]
        }
    }

    return {
        success:success,
        message:message,
        is_embedded:is_embedded,
        animation:animation,
        metadata:metadata,
        image:image,
    }
}