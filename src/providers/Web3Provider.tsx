import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitProvider } from '@reown/appkit/react'
import { http } from 'wagmi'

const queryClient = new QueryClient()

// Reown AppKit Project ID
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '35c18b84fd9706f0b560fe2ae76bf72c'

// Configure Reown AppKit with Wagmi adapter for Base Mainnet
const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId,
  networks: [base],
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
          networks={[base]}
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
