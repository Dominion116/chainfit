import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createConfig, http } from 'wagmi'

const queryClient = new QueryClient()

// Configure wagmi
const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const wagmiConfig = wagmiAdapter.wagmiConfig

// Configure Reown AppKit
const metadata = {
  name: 'ChainFit',
  description: 'Blockchain E-Commerce Platform',
  url: 'https://chainfit.com',
  icons: ['https://chainfit.com/logo.png'],
}

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId: 'YOUR_PROJECT_ID', // Get this from https://cloud.reown.com
  metadata,
  features: {
    analytics: true,
  },
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {appKit}
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export { wagmiConfig }
