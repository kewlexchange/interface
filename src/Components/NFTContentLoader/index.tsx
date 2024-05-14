import React from "react"
import ContentLoader from "react-content-loader"

const NFTContentLoader = (props) => (
  <ContentLoader 
    speed={2}
    width={400}
    height={460}
    viewBox="0 0 400 460"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="0" y="0" rx="19" ry="19" width="234" height="355" />
  </ContentLoader>
)

export default NFTContentLoader