import { TAddressProvince, TAddressDistrict, TAddressWard } from '@/utils/types/api'

/**
 * Client-side address types
 */
export type TClientProvince = {
  id: number
  name: string
  districtCount: number
}

export type TClientDistrict = {
  id: number
  name: string
  provinceId: number
  wardCount: number
}

export type TClientWard = {
  code: string
  name: string
  districtId: number
  provinceId: number
}

/**
 * AddressAdapter - Chuyển đổi dữ liệu địa chỉ từ API sang cấu trúc Client
 */
export class AddressAdapter {
  /**
   * Convert TAddressProvince sang TClientProvince
   */
  static toClientProvince(apiProvince: TAddressProvince): TClientProvince {
    return {
      id: apiProvince.id,
      name: apiProvince.name,
      districtCount: apiProvince.district_count,
    }
  }

  /**
   * Convert TAddressProvince[] sang TClientProvince[]
   */
  static toClientProvinces(apiProvinces: TAddressProvince[]): TClientProvince[] {
    return apiProvinces.map((province) => this.toClientProvince(province))
  }

  /**
   * Convert TAddressDistrict sang TClientDistrict
   */
  static toClientDistrict(apiDistrict: TAddressDistrict): TClientDistrict {
    return {
      id: apiDistrict.id,
      name: apiDistrict.name,
      provinceId: apiDistrict.province_id,
      wardCount: apiDistrict.ward_count,
    }
  }

  /**
   * Convert TAddressDistrict[] sang TClientDistrict[]
   */
  static toClientDistricts(apiDistricts: TAddressDistrict[]): TClientDistrict[] {
    return apiDistricts.map((district) => this.toClientDistrict(district))
  }

  /**
   * Convert TAddressWard sang TClientWard
   */
  static toClientWard(apiWard: TAddressWard): TClientWard {
    return {
      code: apiWard.code,
      name: apiWard.name,
      districtId: apiWard.district_id,
      provinceId: apiWard.province_id,
    }
  }

  /**
   * Convert TAddressWard[] sang TClientWard[]
   */
  static toClientWards(apiWards: TAddressWard[]): TClientWard[] {
    return apiWards.map((ward) => this.toClientWard(ward))
  }

  /**
   * Format address string từ các thành phần
   */
  static formatFullAddress(
    address1: string,
    ward?: TClientWard | null,
    district?: TClientDistrict | null,
    province?: TClientProvince | null
  ): string {
    const parts = [address1]

    if (ward) parts.push(ward.name)
    if (district) parts.push(district.name)
    if (province) parts.push(province.name)

    return parts.filter(Boolean).join(', ')
  }

  /**
   * Tìm province theo ID
   */
  static findProvinceById(
    provinces: TClientProvince[],
    id: number
  ): TClientProvince | undefined {
    return provinces.find((p) => p.id === id)
  }

  /**
   * Tìm district theo ID
   */
  static findDistrictById(
    districts: TClientDistrict[],
    id: number
  ): TClientDistrict | undefined {
    return districts.find((d) => d.id === id)
  }

  /**
   * Tìm ward theo code
   */
  static findWardByCode(wards: TClientWard[], code: string): TClientWard | undefined {
    return wards.find((w) => w.code === code)
  }
}
