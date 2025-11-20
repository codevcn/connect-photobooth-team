import { getFetchProvinces, getFetchDistricts, getFetchWards } from './api/address.api'
import {
  AddressAdapter,
  TClientProvince,
  TClientDistrict,
  TClientWard,
} from './adapter/address.adapter'

class AddressService {
  constructor() {}

  async fetchProvinces(): Promise<TClientProvince[]> {
    const response = await getFetchProvinces()
    const apiProvinces = response.data?.data || []
    return AddressAdapter.toClientProvinces(apiProvinces)
  }

  async fetchDistricts(provinceId: number): Promise<TClientDistrict[]> {
    const response = await getFetchDistricts(provinceId)
    const apiDistricts = response.data?.data || []
    return AddressAdapter.toClientDistricts(apiDistricts)
  }

  async fetchWards(districtId: number): Promise<TClientWard[]> {
    const response = await getFetchWards(districtId)
    const apiWards = response.data?.data || []
    return AddressAdapter.toClientWards(apiWards)
  }
}

export const addressService = new AddressService()
