import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'
import type { Address } from 'viem'

export function useContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    writeContract: (functionName: string, args: any[], value?: bigint) => {
      const config: any = {
        address: CONTRACT_ADDRESS as Address,
        abi: CONTRACT_ABI,
        functionName: functionName as any,
        args: args as any,
      }
      if (value !== undefined) {
        config.value = value
      }
      return writeContract(config)
    },
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
