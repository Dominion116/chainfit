import { useAppKit } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function ConnectButton() {
  const { address, isConnected, open } = useAppKit()

  if (isConnected && address) {
    return (
      <Button variant="outline" className="font-mono text-sm">
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  return (
    <Button onClick={() => open()}>
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  )
}
