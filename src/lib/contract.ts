// Contract configuration
// TODO: Replace with your actual contract ABI and address
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" // Replace with your contract address

export const CONTRACT_ABI = [
  // TODO: Add your contract ABI here
  // Example structure:
  // {
  //   "inputs": [...],
  //   "name": "functionName",
  //   "outputs": [...],
  //   "stateMutability": "...",
  //   "type": "function"
  // }
] as const

// Product categories
export const CATEGORIES = ["shirts", "trousers", "shoes"] as const
export type Category = typeof CATEGORIES[number]

// Order status enum (should match your contract)
export const ORDER_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: 4,
} as const

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
} as const

