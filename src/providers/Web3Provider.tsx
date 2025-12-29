import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitProvider } from '@reown/appkit/react'

const queryClient = new QueryClient()

// Get project ID from environment or use placeholder
// Sign up at https://cloud.reown.com to get your project ID
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

// Configure Reown AppKit with Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId,
  networks: [mainnet, sepolia],
})

const wagmiConfig = wagmiAdapter.wagmiConfig

// Metadata for the app
const metadata = {
  name: 'ChainFit',
  description: 'Blockchain E-Commerce Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://chainfit.com',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : 'https://chainfit.com/logo.png'],
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider
          adapters={[wagmiAdapter]}
          networks={[mainnet, sepolia]}
          projectId={projectId}
          metadata={metadata}
        >
          {children}
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export { wagmiConfig }
