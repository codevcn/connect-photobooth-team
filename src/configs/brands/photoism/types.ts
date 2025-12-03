export type TMediaType = 'IMAGE' | 'VIDEO'

export type TGetCustomerMediaResponse = {
  data: {
    picFile: {
      id: number
      name: string
      alterName: string
      path: string
      del: boolean
      fileType: TMediaType
    }
    vidFile: {
      id: number
      name: string
      alterName: string
      path: string
      del: boolean
      fileType: TMediaType
    }
  }
}
