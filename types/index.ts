export type StampShape = 'circle' | 'rectangle' | 'oval' | 'square'
export type StampColor = 'blue' | 'red' | 'black' | 'green' | 'purple'
export type OrderStatus = 'pending' | 'processing' | 'printing' | 'shipped' | 'delivered'

export interface StampRequirements {
  companyName: string
  line2?: string
  line3?: string
  phone?: string
  email?: string
  website?: string
  shape: StampShape
  size: number
  color: StampColor
  style: 'classic' | 'modern' | 'minimal' | 'decorative'
  customText?: string
  logoSvg?: string
  stampType?: 'address' | 'seal' | 'logo-left' | 'signature' | 'premium'
}

export interface GeneratedStamp {
  id: string
  svg: string
  designName: string
  requirements: StampRequirements
}

export interface CartItem {
  id: string
  stamp: GeneratedStamp
  quantity: number
  price: number
}

export interface CustomerDetails {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerState: string
  customerPincode: string
  stampSvg: string
  stampRequirements: string
  stampShape: string
  stampSize: number
  stampColor: string
  quantity: number
  price: number
  total: number
  status: OrderStatus
  paymentId?: string
  createdAt: string
  updatedAt: string
}
