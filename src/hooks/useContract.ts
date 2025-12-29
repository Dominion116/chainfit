import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'
import { Address } from 'viem'

export function useContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    writeContract: (functionName: string, args: any[], value?: bigint) => {
      return writeContract({
        address: CONTRACT_ADDRESS as Address,
        abi: CONTRACT_ABI,
        functionName,
        args,
        value,
      })
    },
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useReadContractData(functionName: string, args?: any[]) {
  return useReadContract({
    address: CONTRACT_ADDRESS as Address,
    abi: CONTRACT_ABI,
    functionName,
    args,
  })
}

