import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected, metaMask } from 'wagmi/connectors'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'

const queryClient = new QueryClient()

// Configure chains - you can add more or change this
const config = createConfig({
  chains: [mainnet, sepolia, localhost],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http(),
  },
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export { config }

