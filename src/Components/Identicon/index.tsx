import jazzicon from '@metamask/jazzicon'
import React,{ useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'

export default function Identicon  ({ size, account }: { size?: number,account?:string }){
  const iconSize = size ?? 24
  const icon = useMemo(() => account && jazzicon(iconSize, parseInt(account.toString().slice(2, 10), 16)), [account, iconSize])
  const iconRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const current = iconRef.current
    if (icon) {
      current?.appendChild(icon)
      return () => {
        try {
          current?.removeChild(icon)
        } catch (e) {
        }
      }
    }
    return
  }, [icon, iconRef])

  return (
        <span className={"flex items-center justify-center"} ref={iconRef} />
  )
}
