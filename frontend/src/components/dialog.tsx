import { useAccount, useReadContract } from "wagmi"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import React, { useState } from "react"
import toast from 'react-hot-toast'
import { asvaStakingAddress_sepolia, stakingABI, myTokenABI, myTokenAddress_sepolia } from "../lib/ABI"
import { parseEther, parseUnits } from "viem"
import { waitForTransactionReceipt, writeContract as writeToContract } from '@wagmi/core'
import { config } from "../lib/wagmiConfig"

interface Props {
    children: React.ReactNode,
    type: 'Stake' | 'Unstake'
}

export function DialogCloseButton({ children, type }: Props) {
    const [amount, setAmount] = useState('0')
    const [loading, setLoading] = useState(false)
    const { address } = useAccount()

    const { data: allowance } = useReadContract({
        abi: myTokenABI,
        address: myTokenAddress_sepolia,
        functionName: 'allowance',
        args: [
            address,
            asvaStakingAddress_sepolia
        ]
    }) as { data: bigint }

    const handleStake = async () => {
        if (parseInt(amount) <= 0) {
            toast.error("Put a valid amount")
            return
        }
        if (!address) {
            toast.error("Wallet address not found. Connect wallet first.");
            return;
        }
        if (!loading) {
            setLoading(true)
            try {
                let id: string
                if (allowance < parseEther(amount)) {
                    id = toast.loading('Processing Approval')
                    const hash = await writeToContract(config, {
                        abi: myTokenABI,
                        address: myTokenAddress_sepolia,
                        functionName: 'approve',
                        args: [
                            asvaStakingAddress_sepolia,
                            BigInt(parseEther(amount))
                        ]
                    })

                    await waitForTransactionReceipt(config, { hash })
                    toast.success("Approval done", { id })
                }
                id = toast.loading("Processing Stake")
                const stakeHash = await writeToContract(config, {
                    abi: stakingABI,
                    address: asvaStakingAddress_sepolia,
                    functionName: 'stake',
                    args: [
                        BigInt(parseUnits(amount, 18)),
                    ],
                })
                await waitForTransactionReceipt(config, { hash: stakeHash })
                toast.success("Your tokens have been staked", { id })
            }
            catch (error) {
                console.log(error)
                toast.dismiss()
                toast.error("Something went wrong")
            } finally {
                setLoading(false)
            }
        }
        setAmount('0')
    }

    const handleUnstake = async () => {
        if (parseInt(amount) <= 0) {
            toast.error("Put a valid amount")
            return
        }
        if (!address) {
            toast.error("Wallet address not found. Connect wallet first.");
            return;
        }
        if (!loading) {
            setLoading(true)
            try {
                const id = toast.loading("Processing Unstake")
                const unstakeHash = await writeToContract(config, {
                    abi: stakingABI,
                    address: asvaStakingAddress_sepolia,
                    functionName: 'unstake',
                    args: [
                        BigInt(parseUnits(amount, 18)),
                    ],
                })
                await waitForTransactionReceipt(config, { hash: unstakeHash })
                toast.success("Your tokens have been unstaked", { id })
            }
            catch (error) {
                console.log(error)
                toast.dismiss()
                toast.error("Something went wrong")
            } finally {
                setLoading(false)
            }
        }
        setAmount('0')
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#A82810] text-white">
                <DialogHeader>
                    <DialogTitle>{type}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2">
                    <div className="grid flex-1 gap-2">
                        <label htmlFor="link">Enter Amount</label>
                        <Input
                            id="link"
                            defaultValue='0'
                            type="number"
                            onChange={(e) => {
                                setAmount(e.target.value)
                            }}
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-center">
                    <DialogClose className="flex justify-center" asChild>
                        <button className='self-center py-2 px-3 rounded-xl w-44 text-black cursor-pointer bg-[#FBC490] hover:bg-[#F67B50] ease-in-out duration-150'

                            onClick={() => { if (type === "Stake") { handleStake() } else { handleUnstake() } }}
                        >
                            {type}
                        </button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
