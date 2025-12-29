# Contract Setup Instructions

## Step 1: Add Your Contract Address

Open `src/lib/contract.ts` and replace the placeholder address:

```typescript
export const CONTRACT_ADDRESS = "0xYourContractAddressHere"
```

## Step 2: Add Your Contract ABI

Replace the empty `CONTRACT_ABI` array with your contract's ABI:

```typescript
export const CONTRACT_ABI = [
  {
    "inputs": [...],
    "name": "functionName",
    "outputs": [...],
    "stateMutability": "...",
    "type": "function"
  },
  // ... more functions
] as const
```

## Step 3: Verify Function Names

The frontend uses these function names. Make sure your contract has matching functions or update the code:

### Product Functions
- `getAllProducts()` - Should return array of products
- `addProduct(name, description, image, category, price, stock)` - Add product
- `updateStock(productId, newStock)` - Update stock

### Order Functions
- `placeOrder(productIds[], quantities[])` - Place order (payable)
- `getUserOrders(userAddress)` - Get user's orders
- `getAllOrders()` - Get all orders
- `updateOrderStatus(orderId, status)` - Update status

### Admin Functions
- `owner()` - Get contract owner
- `getContractBalance()` - Get contract balance
- `withdraw()` - Withdraw funds

## Step 4: Verify Data Structures

### Product Structure
```typescript
{
  id: number,
  name: string,
  description: string,
  price: bigint, // in wei
  image: string,
  category: number, // 0=shirts, 1=trousers, 2=shoes
  stock: number,
  active: boolean
}
```

### Order Structure
```typescript
{
  id: bigint,
  customer: address,
  totalAmount: bigint, // in wei
  status: number, // 0-4
  timestamp: bigint,
  productIds: bigint[],
  quantities: bigint[]
}
```

## Step 5: Configure Network

Update the chains in `src/providers/Web3Provider.tsx` if needed:

```typescript
import { mainnet, sepolia, localhost } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia], // Add your network here
  // ...
})
```

## Testing

After configuration:
1. Start the dev server: `npm run dev`
2. Connect MetaMask to the correct network
3. Test product loading, cart, and checkout
4. If you're the owner, test admin functions

