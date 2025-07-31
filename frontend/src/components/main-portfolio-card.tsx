import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi'
import { stakingABI, asvaStakingAddress_sepolia, myTokenABI, myTokenAddress_sepolia } from '../lib/ABI'
import { formatEther } from 'viem'
import { DialogCloseButton } from './dialog'
import { Separator } from '@radix-ui/react-separator'

const MainPortfolioCard = () => {
    const { address } = useAccount()

    const { data: userStakeBalance, refetch: refetchUserStakeBalance } = useReadContract({
        abi: stakingABI,
        address: asvaStakingAddress_sepolia,
        functionName: 'getUserStake',
        args: [
            address
        ]
    }) as { data: bigint, refetch: () => void }

    const { data: totalStake, refetch: refetchTotalStake } = useReadContract({
        abi: stakingABI,
        address: asvaStakingAddress_sepolia,
        functionName: 'getTotalStake',
    }) as { data: bigint, refetch: () => void }

    const { data: userBalance, refetch: refetchUserBalance } = useReadContract({
        abi: myTokenABI,
        address: myTokenAddress_sepolia,
        functionName: 'balanceOf',
        args: [address]
    }) as { data: bigint, refetch: () => void }

    const { data: tokenSymbol } = useReadContract({
        abi: myTokenABI,
        address: myTokenAddress_sepolia,
        functionName: 'symbol',
    }) as { data: string }

    useWatchContractEvent({
        address: asvaStakingAddress_sepolia,
        abi: stakingABI,
        eventName: 'Staked',
        onLogs() {
            refetchUserStakeBalance()
            refetchTotalStake()
            refetchUserBalance()
        }
    })

    useWatchContractEvent({
        address: asvaStakingAddress_sepolia,
        abi: stakingABI,
        eventName: 'Unstaked',
        onLogs() {
            refetchUserStakeBalance()
            refetchTotalStake()
            refetchUserBalance()
        }
    })

    return (
        <div className='w-[70%] text-lg text-black flex flex-col md:flex-row gap-3'>
            <div className='bg-[#FBAA60] rounded-4xl h-full w-full flex-3/4 flex flex-col text-left py-8 px-5 md:p-10 gap-5'>
                <div className='flex flex-col md:flex-row md:justify-between gap-2 items-center'>
                    <h1 className='text-2xl md:text-3xl'>Your Stake Info</h1>
                    <span className='bg-black text-white text-sm py-1 px-4 rounded-2xl'>Platform total value: {totalStake && formatEther(totalStake)} {tokenSymbol}</span>
                </div>
                <Separator className='h-0.5 bg-black' />
                <div className='text-center mb-5'>
                    <h2 className='text-2xl md:text-4xl tracking-wide font-bold mb-5'>Balance</h2>
                    <span className='font-semibold bg-black/20 text-white py-2 px-7 rounded-3xl'>{userBalance && formatEther(userBalance)} {tokenSymbol}</span>
                </div>
                <div className='text-center'>
                    <h2 className='text-2xl md:text-4xl tracking-wide font-bold mb-5'>Staked Amount</h2>
                    <span className='font-semibold bg-black/20 text-white py-2 px-7 rounded-3xl'>{userStakeBalance && formatEther(userStakeBalance)} {tokenSymbol}</span>
                </div>
            </div>
            <div className='bg-[#A82810] rounded-4xl py-6 px-4 flex-1/4 flex flex-col items-center justify-center gap-3'>
                <DialogCloseButton type='Stake'>
                    <button className='py-2 px-3 rounded-xl w-44 cursor-pointer bg-[#FBC490] hover:bg-[#F67B50] ease-in-out duration-150'>
                        Stake
                    </button>
                </DialogCloseButton>
                <DialogCloseButton type='Unstake'>
                    <button className='py-2 px-3 rounded-xl w-44 cursor-pointer bg-[#FBC490] hover:bg-[#F67B50] ease-in-out duration-150'>Unstake</button>
                </DialogCloseButton>
            </div>
        </div>
    )
}

export default MainPortfolioCard