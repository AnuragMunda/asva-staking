import React from "react"
import { ConnectButton } from '@rainbow-me/rainbowkit'

const MainHeader = () => {
  return (
    <div className="flex justify-between p-5">
        <span className="text-2xl text-white md:text-3xl font-bold tracking-wider">Asva Staking</span>
        <ConnectButton />
    </div>
  )
}

export default MainHeader