# ChainFit - Blockchain E-Commerce Frontend

A modern React e-commerce frontend for ChainFit that connects to Ethereum smart contracts, featuring product catalog, shopping cart, checkout with MetaMask integration, user dashboard, and admin panel.

## Features

- 🛍️ **Product Catalog** - Browse products with category filtering (shirts, trousers, shoes)
- 🛒 **Shopping Cart** - Add/remove items, update quantities, persistent cart storage
- 💳 **Checkout** - MetaMask integration for blockchain payments
- 📊 **User Dashboard** - View order history with real-time status updates
- ⚙️ **Admin Panel** - Manage products, inventory, orders, and withdraw funds (contract owner only)
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design** - Works on all device sizes

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** - Build tool and dev server
- **wagmi** + **viem** - Web3 integration
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **Radix UI** - Accessible component primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Access to an Ethereum network (Mainnet, Sepolia, or local)

### Installation

1. Clone the repository:
```bash
cd chainfit
```

2. Install dependencies:
```bash
npm install
```

3. Configure your smart contract:
   - Open `src/lib/contract.ts`
   - Replace `CONTRACT_ADDRESS` with your deployed contract address
   - Add your contract ABI to the `CONTRACT_ABI` array

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Contract Configuration

Before using the application, you need to configure your smart contract details:

1. **Contract Address**: Update `CONTRACT_ADDRESS` in `src/lib/contract.ts`
2. **Contract ABI**: Add your contract ABI to the `CONTRACT_ABI` array in `src/lib/contract.ts`

### Expected Contract Functions

The frontend expects the following contract functions (adjust as needed):

**Product Management:**
- `getAllProducts()` - Returns array of all products
- `addProduct(name, description, image, category, price, stock)` - Add new product (owner only)
- `updateStock(productId, newStock)` - Update product stock (owner only)

**Order Management:**
- `placeOrder(productIds[], quantities[])` - Place an order (payable)
- `getUserOrders(userAddress)` - Get orders for a user
- `getAllOrders()` - Get all orders (owner only)
- `updateOrderStatus(orderId, status)` - Update order status (owner only)

**Admin Functions:**
- `owner()` - Returns contract owner address
- `getContractBalance()` - Returns contract balance
- `withdraw()` - Withdraw funds (owner only)

### Order Status Enum

The contract should use the following order status values:
- `0` - Pending
- `1` - Confirmed
- `2` - Shipped
- `3` - Delivered
- `4` - Cancelled

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── Layout.tsx   # Main layout with navigation
│   └── ConnectButton.tsx
├── pages/
│   ├── Products.tsx  # Product catalog
│   ├── Cart.tsx      # Shopping cart
│   ├── Checkout.tsx  # Checkout flow
│   ├── Dashboard.tsx # User order history
│   └── Admin.tsx     # Admin panel
├── hooks/
│   ├── useContract.ts    # Contract interaction hooks
│   └── use-toast.ts      # Toast notifications
├── lib/
│   ├── contract.ts  # Contract configuration
│   └── utils.ts     # Utility functions
├── providers/
│   └── Web3Provider.tsx  # Web3 provider setup
└── store/
    └── cartStore.ts  # Shopping cart state
```

## Usage

### As a Customer

1. **Browse Products**: View all available products on the home page
2. **Filter by Category**: Use the category filter to find specific items
3. **Add to Cart**: Click "Add to Cart" on any product
4. **View Cart**: Click the cart icon in the navigation
5. **Checkout**: Connect your wallet and proceed to checkout
6. **Place Order**: Confirm the transaction in MetaMask
7. **Track Orders**: View your order history in the Dashboard

### As an Admin (Contract Owner)

1. **Connect Wallet**: Connect the wallet that deployed the contract
2. **Access Admin Panel**: Navigate to the Admin page
3. **Add Products**: Use the "Add Product" dialog to add new items
4. **Manage Inventory**: Update stock levels directly in the products table
5. **Update Orders**: Change order statuses in the orders table
6. **Withdraw Funds**: Withdraw accumulated funds from the contract

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

You can configure the following in `src/lib/contract.ts`:
- Contract address
- Contract ABI
- Supported chains (in `src/providers/Web3Provider.tsx`)

## Troubleshooting

### MetaMask Not Connecting
- Ensure MetaMask is installed and unlocked
- Check that you're on a supported network
- Try refreshing the page

### Contract Calls Failing
- Verify the contract address is correct
- Ensure the ABI matches your contract
- Check that function names match your contract
- Verify you have sufficient ETH for gas fees

### Products Not Loading
- Check that `getAllProducts()` function exists in your contract
- Verify the function returns data in the expected format
- Check browser console for errors

## License

MIT
