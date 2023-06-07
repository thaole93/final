export interface ProductItem {
    userId: string
    productId: string
    name: string
    releaseDate: string
    price: number
    currency: string
    description: string
    released: boolean
    createdAt: string
    productUrl?: string
}
