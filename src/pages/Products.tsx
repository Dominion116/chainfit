import { useState } from 'react'
import { useReadContractData } from '@/hooks/useContract'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIES } from '@/lib/contract'
import type { Category } from '@/lib/contract'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatEther } from 'viem'

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

export function Products() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)

  // Read products from contract
  // Note: This assumes your contract has a getProducts() or similar function
  // You may need to adjust based on your actual contract structure
  const { data: products, isLoading } = useReadContractData('getAllProducts', [])

  const filteredProducts = products
    ? (products as Product[]).filter((product: Product) => {
        if (!product.active) return false
        if (selectedCategory === 'all') return true
        const categoryMap: Record<Category, number> = {
          shirts: 0,
          trousers: 1,
          shoes: 2,
        }
        return product.category === categoryMap[selectedCategory]
      })
    : []

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently out of stock.',
        variant: 'destructive',
      })
      return
    }

    addItem({
      productId: Number(product.id),
      name: product.name,
      price: formatEther(product.price),
      image: product.image,
      category: CATEGORIES[product.category] || 'unknown',
    })

    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Products</h1>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: Product) => (
            <Card key={Number(product.id)}>
              <CardHeader>
                <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-muted-foreground">No Image</div>
                  )}
                </div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{formatEther(product.price)} ETH</span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.stock}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

