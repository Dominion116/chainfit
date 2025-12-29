import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'
import { ORDER_STATUS_LABELS } from '@/lib/contract'
import { formatEther } from 'viem'
import { Loader2, Package } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Order {
  id: bigint
  buyer: string
  productId: bigint
  quantity: bigint
  totalPrice: bigint
  status: number
  timestamp: bigint
  shippingAddress: string
}

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get user order IDs
  const { data: orderIds } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getUserOrders',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Fetch all order details
  const { data: ordersData } = useReadContracts({
    contracts: orderIds
      ? (orderIds as bigint[]).map((orderId) => ({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getOrder' as const,
          args: [orderId] as const,
        }))
      : [],
    query: {
      enabled: !!orderIds && (orderIds as bigint[]).length > 0,
    },
  })

  useEffect(() => {
    if (ordersData) {
      const fetchedOrders = ordersData
        .map((result) => {
          if (result.status === 'success' && result.data) {
            return result.data as Order
          }
          return null
        })
        .filter((o): o is Order => o !== null)
        .sort((a, b) => Number(b.timestamp) - Number(a.timestamp)) // Sort by newest first
      setOrders(fetchedOrders)
      setIsLoading(false)
    } else if (orderIds && (orderIds as bigint[]).length === 0) {
      setOrders([])
      setIsLoading(false)
    }
  }, [ordersData, orderIds])

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Please connect your wallet</h2>
        <p className="text-muted-foreground">Connect your wallet to view your order history.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Your order history will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View and track your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={Number(order.id)}>
                    <TableCell className="font-mono">#{Number(order.id)}</TableCell>
                    <TableCell>
                      {new Date(Number(order.timestamp) * 1000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>Product #{Number(order.productId)}</TableCell>
                    <TableCell>{Number(order.quantity)}</TableCell>
                    <TableCell>{formatEther(order.totalPrice)} ETH</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 1
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 2
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 3
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || 'Unknown'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
