import { TProduct, TProductVariant, TProductSurface, TProductMockup } from '@/utils/types/api'
import {
  TBaseProduct,
  TClientProductVariant,
  TPrintAreaInfo,
  TProductVariantSurface,
  TProductSize,
  TSurfaceType,
  TProductCategory,
} from '@/utils/types/global'

/**
 * ProductAdapter - Chuyển đổi dữ liệu sản phẩm từ API sang cấu trúc Client
 */
export class ProductAdapter {
  /**
   * Convert một product từ API sang TBaseProduct
   */
  static toClientProduct(apiProduct: TProduct): TBaseProduct | null {
    // Validate product
    if (apiProduct.status !== 'active') return null
    if (apiProduct.variants.length === 0) return null
    if (apiProduct.surfaces.length === 0) return null

    return {
      id: apiProduct.id,
      url: apiProduct.base_image_url,
      name: apiProduct.name,
      description: apiProduct.description,
      detailImages: apiProduct.detail_img,
      variants: this.toClientVariants(apiProduct),
      inNewLine: false,
      printAreaList: this.toPrintAreaList(apiProduct),
      variantSurfaces: this.toVariantSurfaces(apiProduct.mockups),
    }
  }

  /**
   * Convert danh sách products từ API sang TBaseProduct[]
   */
  static toClientProducts(apiProducts: TProduct[]): TBaseProduct[] {
    const clientProducts: TBaseProduct[] = []
    for (const product of apiProducts) {
      const clientProduct = this.toClientProduct(product)
      if (clientProduct) {
        clientProducts.push(clientProduct)
      }
    }
    return clientProducts
  }

  /**
   * Convert variants từ API sang TClientProductVariant[]
   */
  private static toClientVariants(apiProduct: TProduct): TClientProductVariant[] {
    const category = this.extractCategory(apiProduct.attributes_json)

    return apiProduct.variants.map((variant) => this.toClientVariant(variant, apiProduct, category))
  }

  /**
   * Convert một variant sang TClientProductVariant
   */
  private static toClientVariant(
    variant: TProductVariant,
    product: TProduct,
    category?: TProductCategory
  ): TClientProductVariant {
    return {
      id: variant.id,
      name: product.name,
      size: variant.size.toUpperCase() as TProductSize,
      color: {
        title: variant.color,
        value: variant.color,
      },
      priceAmountOneSide: parseFloat(variant.price_amount_oneside),
      priceAmountBothSide: parseFloat(variant.price_amount_bothside),
      currency: variant.currency,
      stock: variant.stock_qty,
      category,
    }
  }

  /**
   * Convert surfaces sang print area list
   */
  private static toPrintAreaList(apiProduct: TProduct): TPrintAreaInfo[] {
    // Sort surfaces với 'front' đầu tiên
    const sortedSurfaces = [...apiProduct.surfaces].sort((a, b) =>
      a.code === 'front' ? -1 : b.code === 'front' ? 1 : 0
    )

    const printAreas: TPrintAreaInfo[] = []
    for (const surface of sortedSurfaces) {
      if (surface.code === 'front' || surface.code === 'back') {
        printAreas.push(this.toPrintAreaInfo(surface, apiProduct.base_image_url))
      }
    }
    return printAreas
  }

  /**
   * Convert surface sang TPrintAreaInfo
   */
  private static toPrintAreaInfo(
    surface: TProductSurface,
    fallbackImageUrl: string
  ): TPrintAreaInfo {
    return {
      id: surface.id,
      area: {
        printX: surface.print_areas.x_px,
        printY: surface.print_areas.y_px,
        printW: surface.print_areas.width_px,
        printH: surface.print_areas.height_px,
        widthRealPx: surface.print_areas.width_real_px,
        heightRealPx: surface.print_areas.height_real_px,
      },
      surfaceType: surface.code as TSurfaceType,
      imageUrl: surface.preview_image_url || fallbackImageUrl,
    }
  }

  /**
   * Convert mockups sang variant surfaces
   */
  private static toVariantSurfaces(mockups: TProductMockup[]): TProductVariantSurface[] {
    return mockups.map((mockup) => ({
      variantId: mockup.variant_id,
      surfaceId: mockup.surface_id,
      imageURL: mockup.mockup_url,
    }))
  }

  /**
   * Extract category từ attributes_json
   */
  private static extractCategory(
    attributes: TProduct['attributes_json']
  ): TProductCategory | undefined {
    return attributes.category as TProductCategory | undefined
  }
}
