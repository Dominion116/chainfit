import { useAccount, useConnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  if (isConnected && address) {
    return (
      <Button variant="outline" className="font-mono text-sm">
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  const metaMaskConnector = connectors.find((c) => c.id === 'metaMask' || c.id === 'injected')

  return (
    <Button
      onClick={() => {
        if (metaMaskConnector) {
          connect({ connector: metaMaskConnector })
        }
      }}
    >
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  )
}

