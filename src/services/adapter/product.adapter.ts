import { TProduct, TProductVariant, TProductSurface, TProductMockup } from '@/utils/types/api'
import {
  TBaseProduct,
  TClientProductVariant,
  TPrintAreaInfo,
  TProductVariantSurface,
  TSurfaceType,
  TProductCategory,
  TProductAttributes,
  TColorAttribute,
  TMaterialAttribute,
  TScentAttribute,
  TSizeAttribute,
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

    const clientVariants = this.toClientVariants(apiProduct)

    return {
      id: apiProduct.id,
      url: apiProduct.base_image_url,
      name: apiProduct.name,
      description: apiProduct.description,
      detailImages: apiProduct.detail_img,
      variants: clientVariants,
      inNewLine: false,
      printAreaList: this.toPrintAreaList(apiProduct),
      variantSurfaces: this.toMockups(apiProduct.mockups),
      mergedAttributes: buildProductAttributes(apiProduct.variants),
      slug: apiProduct.slug,
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
    const attrs = variant.attributes_json || {}

    return {
      id: variant.id,
      name: product.name,
      attributes: attrs,
      priceAmountOneSide: parseFloat(variant.price_amount_oneside),
      priceAmountBothSide: variant.price_amount_bothside
        ? parseFloat(variant.price_amount_bothside)
        : null,
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
   * Convert mockups với transform_json sang variant surfaces
   */
  private static toMockups(mockups: TProductMockup[]): TProductVariantSurface[] {
    return mockups.map((mockup) => ({
      variantId: mockup.variant_id,
      surfaceId: mockup.surface_id,
      imageURL: mockup.mockup_url,
      transform: mockup.transform_json || {},
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

/**
 * Helper: Tìm hoặc tạo color trong material (khi không có scent)
 */
function getOrCreateColorInMaterial(
  material: TMaterialAttribute,
  colorValue: string,
  colorTitle?: string | null,
  hex?: string | null
): TColorAttribute {
  if (!material.colors) material.colors = []
  let color = material.colors.find((c) => c.value === colorValue)
  if (!color) {
    color = {
      value: colorValue,
      displayValue: colorTitle ?? colorValue,
      title: colorTitle ?? colorValue,
      hex: hex ?? undefined,
      displayType: hex ? 'swatch' : 'label',
      sizes: [],
    }
    material.colors.push(color)
  }
  return color
}

/**
 * Helper: Thêm size vào material nếu chưa tồn tại
 */
function addSizeToMaterial(
  material: TMaterialAttribute,
  sizeValue: string,
  sizeTitle?: string | null
): void {
  if (!material.sizes) material.sizes = []
  const exists = material.sizes.some((s) => s.value === sizeValue)
  if (!exists) {
    material.sizes.push({
      value: sizeValue,
      displayValue: sizeTitle ?? sizeValue,
      title: sizeTitle ?? sizeValue,
    })
  }
}

/**
 * Helper: Tìm hoặc tạo scent trong material
 */
function getOrCreateScent(
  material: TMaterialAttribute,
  scentValue: string,
  scentTitle?: string | null
): TScentAttribute {
  let scent = material.scents!.find((s) => s.value === scentValue)
  if (!scent) {
    scent = {
      value: scentValue,
      displayValue: scentTitle ?? scentValue,
      title: scentTitle ?? scentValue,
      colors: [],
    }
    material.scents!.push(scent)
  }
  return scent
}

/**
 * Helper: Tìm hoặc tạo color trong scent
 */
function getOrCreateColor(
  scent: TScentAttribute,
  colorValue: string,
  colorTitle?: string | null,
  hex?: string | null
): TColorAttribute {
  let color = scent.colors!.find((c) => c.value === colorValue)
  if (!color) {
    color = {
      value: colorValue,
      displayValue: colorTitle ?? colorValue,
      title: colorTitle ?? colorValue,
      hex: hex ?? undefined,
      displayType: hex ? 'swatch' : 'label',
      sizes: [],
    }
    scent.colors!.push(color)
  }
  return color
}

/**
 * Helper: Thêm size vào color nếu chưa tồn tại
 */
function addSizeToColor(
  color: TColorAttribute,
  sizeValue: string,
  sizeTitle?: string | null
): void {
  const exists = color.sizes!.some((s) => s.value === sizeValue)
  if (!exists) {
    color.sizes!.push({
      value: sizeValue,
      displayValue: sizeTitle ?? sizeValue,
      title: sizeTitle ?? sizeValue,
    })
  }
}

/**
 * Helper: Thêm size vào scent nếu chưa tồn tại
 */
function addSizeToScent(
  scent: TScentAttribute,
  sizeValue: string,
  sizeTitle?: string | null
): void {
  if (!scent.sizes) scent.sizes = []
  const exists = scent.sizes.some((s) => s.value === sizeValue)
  if (!exists) {
    scent.sizes.push({
      value: sizeValue,
      displayValue: sizeTitle ?? sizeValue,
      title: sizeTitle ?? sizeValue,
    })
  }
}

/**
 * Helper: Xử lý variant có scent
 */
function processVariantWithScent(
  material: TMaterialAttribute,
  attrs: TProductVariant['attributes_json']
): void {
  const { scent, scentTitle, color, colorTitle, hex, size, sizeTitle } = attrs
  
  const scentObj = getOrCreateScent(material, scent!, scentTitle)

  if (color !== null && color !== undefined) {
    // Case: material + scent + color [+ size]
    const colorObj = getOrCreateColor(scentObj, color, colorTitle, hex)
    if (size) {
      addSizeToColor(colorObj, size, sizeTitle)
    }
  } else if (size) {
    // Case: material + scent + size (NO COLOR)
    addSizeToScent(scentObj, size, sizeTitle)
  }
}

/**
 * Helper: Xử lý variant không có scent
 */
function processVariantWithoutScent(
  material: TMaterialAttribute,
  attrs: TProductVariant['attributes_json']
): void {
  const { color, colorTitle, hex, size, sizeTitle } = attrs

  if (color !== null && color !== undefined) {
    // Case: material + color [+ size] (NO SCENT)
    const colorObj = getOrCreateColorInMaterial(material, color, colorTitle, hex)
    if (size) {
      addSizeToColor(colorObj, size, sizeTitle)
    }
  } else if (size) {
    // Case: material + size (NO SCENT, NO COLOR)
    addSizeToMaterial(material, size, sizeTitle)
  }
}

/**
 * Helper: Track titles từ variants
 */
function trackTitles(
  attrs: TProductVariant['attributes_json'],
  titles: {
    material: string | null
    scent: string | null
    color: string | null
    size: string | null
  }
): void {
  if (!titles.material && attrs.materialTitle) titles.material = attrs.materialTitle
  if (!titles.scent && attrs.scentTitle) titles.scent = attrs.scentTitle
  if (!titles.color && attrs.colorTitle) titles.color = attrs.colorTitle
  if (!titles.size && attrs.sizeTitle) titles.size = attrs.sizeTitle
}

/**
 * Build hierarchical product attributes từ variants
 * Hierarchy: material → scent → color → size
 */
function buildProductAttributes(variants: TProductVariant[]): TProductAttributes {
  const materialsMap = new Map<string, TMaterialAttribute>()
  const titles = { material: null, scent: null, color: null, size: null } as {
    material: string | null
    scent: string | null
    color: string | null
    size: string | null
  }

  for (const variant of variants) {
    const attrs = variant.attributes_json
    if (!attrs.material) continue

    trackTitles(attrs, titles)

    // Get or create material
    if (!materialsMap.has(attrs.material)) {
      materialsMap.set(attrs.material, {
        value: attrs.material,
        displayValue: attrs.materialTitle ?? attrs.material,
        title: attrs.materialTitle ?? attrs.material,
        scents: [],
      })
    }

    const material = materialsMap.get(attrs.material)!

    // Process variant based on scent presence
    if (attrs.scent) {
      processVariantWithScent(material, attrs)
    } else {
      processVariantWithoutScent(material, attrs)
    }
  }

  return {
    materials: {
      title: titles.material || 'Chất liệu',
      options: Array.from(materialsMap.values()),
    },
    scents: titles.scent ? { title: titles.scent, options: [] } : undefined,
    colors: titles.color ? { title: titles.color, options: [] } : undefined,
    sizes: titles.size ? { title: titles.size, options: [] } : undefined,
  }
}
