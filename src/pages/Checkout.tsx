import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cartStore'
import { useContract } from '@/hooks/useContract'
import { useToast } from '@/hooks/use-toast'
import { parseEther } from 'viem'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function Checkout() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { items, getTotal, clearCart } = useCartStore()
  const { writeContract, isPending, isConfirming, isConfirmed, error } = useContract()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Please connect your wallet</h2>
        <p className="text-muted-foreground">You need to connect your wallet to proceed with checkout.</p>
      </div>
    )
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const handleCheckout = async () => {
    if (!address) return

    try {
      setProcessing(true)
      const totalAmount = parseEther(getTotal())
      const productIds = items.map((item) => BigInt(item.productId))
      const quantities = items.map((item) => BigInt(item.quantity))

      // Adjust function name and parameters based on your contract
      await writeContract('placeOrder', [productIds, quantities], totalAmount)

      toast({
        title: 'Transaction Submitted',
        description: 'Your order is being processed. Please wait for confirmation.',
      })
    } catch (err: any) {
      toast({
        title: 'Transaction Failed',
        description: err?.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      })
      setProcessing(false)
    }
  }

  if (isConfirmed) {
    clearCart()
    toast({
      title: 'Order Placed!',
      description: 'Your order has been successfully placed.',
    })
    setTimeout(() => {
      navigate('/dashboard')
    }, 2000)
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Review your order before placing it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center border-b pb-4">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} × {item.price} ETH
                  </div>
                </div>
                <div className="font-medium">
                  {(parseFloat(item.price) * item.quantity).toFixed(4)} ETH
                </div>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg pt-4">
              <span>Total</span>
              <span>{getTotal()} ETH</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>Pay with MetaMask</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Wallet Address</span>
                <span className="font-mono text-sm">{address}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount</span>
                <span className="font-bold">{getTotal()} ETH</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {error && (
              <div className="text-sm text-destructive w-full">
                Error: {error.message}
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={isPending || isConfirming || processing}
            >
              {(isPending || isConfirming || processing) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                'Place Order'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You will be asked to confirm this transaction in your wallet.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

