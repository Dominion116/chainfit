import { useState } from 'react'
import { useAccount, useReadContractData } from 'wagmi'
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
import { Plus, Loader2, Settings, DollarSign } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: bigint
  image: string
  category: number
  stock: number
  active: boolean
}

interface Order {
  id: bigint
  customer: string
  totalAmount: bigint
  status: number
  timestamp: bigint
}

export function Admin() {
  const { address, isConnected } = useAccount()
  const { writeContract, isPending, isConfirming } = useContract()
  const { toast } = useToast()

  // Check if user is owner (adjust function name based on your contract)
  const { data: isOwner } = useReadContractData('owner', [])
  const { data: products } = useReadContractData('getAllProducts', [])
  const { data: allOrders } = useReadContractData('getAllOrders', [])
  const { data: contractBalance } = useReadContractData('getContractBalance', [])

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '0',
    stock: '',
  })
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)

  // Check if connected address is the owner
  const isAdmin = isConnected && address && isOwner && address.toLowerCase() === String(isOwner).toLowerCase()

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

  const handleAddProduct = async () => {
    try {
      await writeContract(
        'addProduct',
        [
          newProduct.name,
          newProduct.description,
          newProduct.image,
          parseInt(newProduct.category),
          parseEther(newProduct.price),
          BigInt(newProduct.stock),
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
        image: '',
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

  const handleUpdateStock = async (productId: number, newStock: number) => {
    try {
      await writeContract('updateStock', [BigInt(productId), BigInt(newStock)])
      toast({
        title: 'Stock Updated',
        description: 'Product stock has been updated.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update stock.',
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
      await writeContract('withdraw', [])
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
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products && (products as Product[]).map((product: Product) => (
                  <TableRow key={Number(product.id)}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{formatEther(product.price)} ETH</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={product.stock}
                        onChange={(e) => {
                          const newStock = parseInt(e.target.value) || 0
                          handleUpdateStock(Number(product.id), newStock)
                        }}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStock(Number(product.id), Number(product.stock))}
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
                {allOrders && (allOrders as Order[]).map((order: Order) => (
                  <TableRow key={Number(order.id)}>
                    <TableCell className="font-mono">#{Number(order.id)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {String(order.customer).slice(0, 6)}...{String(order.customer).slice(-4)}
                    </TableCell>
                    <TableCell>{formatEther(order.totalAmount)} ETH</TableCell>
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

