export interface Subcategory {
  name: string
  key: string
}

export interface Category {
  id: string
  name: string
  key: string
  subcategories: Subcategory[]
  active: boolean
  createdAt: Date
}
