import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useContract } from '@/hooks/useContract'
import { useToast } from '@/hooks/use-toast'
import { CATEGORIES, ORDER_STATUS, ORDER_STATUS_LABELS } from '@/lib/contract'
import { parseEther, formatEther } from 'viem'
import { Plus, Loader2, DollarSign } from 'lucide-react'

interface Product {
  id: bigint
  name: string
  description: string
  category: number
  price: bigint
  stock: bigint
  imageUrl: string
  active: boolean
}

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

export function Admin() {
  const { address, isConnected } = useAccount()
  const { writeContract, isPending, isConfirming } = useContract()
  const { toast } = useToast()

  // Check if user is owner
  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  })

  // Get product count
  const { data: productCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'productCount',
  })

  // Get order count
  const { data: orderCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'orderCount',
  })

  // Fetch all products
  const { data: productsData } = useReadContracts({
    contracts: productCount
      ? Array.from({ length: Number(productCount) }, (_, i) => ({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getProduct' as const,
          args: [BigInt(i + 1)] as const,
        }))
      : [],
    query: {
      enabled: !!productCount && Number(productCount) > 0,
    },
  })

  // Fetch all orders
  const { data: ordersData } = useReadContracts({
    contracts: orderCount
      ? Array.from({ length: Number(orderCount) }, (_, i) => ({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getOrder' as const,
          args: [BigInt(i + 1)] as const,
        }))
      : [],
    query: {
      enabled: !!orderCount && Number(orderCount) > 0,
    },
  })

  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '0',
    stock: '',
  })
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [updatingProducts, setUpdatingProducts] = useState<Record<number, { price: string; stock: string; active: boolean }>>({})

  useEffect(() => {
    if (productsData) {
      const fetchedProducts = productsData
        .map((result) => {
          if (result.status === 'success' && result.result) {
            return result.result as Product
          }
          return null
        })
        .filter((p): p is Product => p !== null)
      setProducts(fetchedProducts)
    }
  }, [productsData])

  useEffect(() => {
    if (ordersData) {
      const fetchedOrders = ordersData
        .map((result) => {
          if (result.status === 'success' && result.result) {
            return result.result as Order
          }
          return null
        })
        .filter((o): o is Order => o !== null)
        .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
      setOrders(fetchedOrders)
    }
  }, [ordersData])

  // Check if connected address is the owner
  const isAdmin = isConnected && address && ownerAddress && address.toLowerCase() === String(ownerAddress).toLowerCase()

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Please connect your wallet</h2>
        <p className="text-muted-foreground">Connect your wallet to access the admin panel.</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You must be the contract owner to access this page.</p>
      </div>
    )
  }

  const { data: contractBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getContractBalance',
  })

  const handleAddProduct = async () => {
    try {
      await writeContract(
        'addProduct',
        [
          newProduct.name,
          newProduct.description,
          parseInt(newProduct.category),
          parseEther(newProduct.price),
          BigInt(newProduct.stock),
          newProduct.imageUrl,
        ]
      )
      toast({
        title: 'Product Added',
        description: 'The product has been added successfully.',
      })
      setIsAddProductOpen(false)
      setNewProduct({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        category: '0',
        stock: '',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add product.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateProduct = async (productId: number, price: string, stock: string, active: boolean) => {
    try {
      await writeContract('updateProduct', [
        BigInt(productId),
        parseEther(price),
        BigInt(stock),
        active,
      ])
      toast({
        title: 'Product Updated',
        description: 'Product has been updated successfully.',
      })
      // Clear the updating state for this product
      setUpdatingProducts((prev) => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update product.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateOrderStatus = async (orderId: bigint, newStatus: number) => {
    try {
      await writeContract('updateOrderStatus', [orderId, newStatus])
      toast({
        title: 'Order Status Updated',
        description: 'The order status has been updated.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update order status.',
        variant: 'destructive',
      })
    }
  }

  const handleWithdraw = async () => {
    try {
      await writeContract('withdrawFunds', [])
      toast({
        title: 'Withdrawal Initiated',
        description: 'Funds are being withdrawn to your wallet.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to withdraw funds.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Contract Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contractBalance ? formatEther(contractBalance as bigint) : '0'} ETH
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleWithdraw} disabled={isPending || isConfirming} className="w-full">
              {(isPending || isConfirming) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw Funds'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </div>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Add a new product to your store</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (ETH)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.0001"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat, index) => (
                            <SelectItem key={cat} value={String(index)}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddProduct} disabled={isPending || isConfirming}>
                      {(isPending || isConfirming) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Product'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const updating = updatingProducts[Number(product.id)] || {
                    price: formatEther(product.price),
                    stock: String(Number(product.stock)),
                    active: product.active,
                  }
                  return (
                    <TableRow key={Number(product.id)}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.0001"
                          value={updating.price}
                          onChange={(e) =>
                            setUpdatingProducts({
                              ...updatingProducts,
                              [Number(product.id)]: { ...updating, price: e.target.value },
                            })
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={updating.stock}
                          onChange={(e) =>
                            setUpdatingProducts({
                              ...updatingProducts,
                              [Number(product.id)]: { ...updating, stock: e.target.value },
                            })
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={updating.active ? 'true' : 'false'}
                          onValueChange={(value) =>
                            setUpdatingProducts({
                              ...updatingProducts,
                              [Number(product.id)]: { ...updating, active: value === 'true' },
                            })
                          }
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateProduct(
                              Number(product.id),
                              updating.price,
                              updating.stock,
                              updating.active
                            )
                          }
                          disabled={isPending || isConfirming}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage and update order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={Number(order.id)}>
                    <TableCell className="font-mono">#{Number(order.id)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {String(order.buyer).slice(0, 6)}...{String(order.buyer).slice(-4)}
                    </TableCell>
                    <TableCell>{formatEther(order.totalPrice)} ETH</TableCell>
                    <TableCell>
                      <Select
                        value={String(order.status)}
                        onValueChange={(value) => handleUpdateOrderStatus(order.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORDER_STATUS).map(([key, value]) => (
                            <SelectItem key={key} value={String(value)}>
                              {ORDER_STATUS_LABELS[value as keyof typeof ORDER_STATUS_LABELS]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, order.status)}
                        disabled={isPending || isConfirming}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
