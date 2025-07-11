import type { Product } from '@/components/ProductCatalog';

export const sampleProducts: Omit<Product, 'id'>[] = [
  // Biscuit
  {
    name: "Good Day",
    price: 25,
    category: "Biscuit",
    subcategory: "",
    brand: "Britannia",
    description: "Delicious coconut cookies",
    inStock: true
  },
]
