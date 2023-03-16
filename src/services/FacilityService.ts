import { api } from '@/adapter';

const getStores = async (payload: any): Promise <any>  => {
  // TODO implement caching
  return api({
    url: "storeLookup", 
    method: "post",
    data: payload,
  });
}

const getLocation = async (payload: any): Promise <any>  => {
  // TODO implement caching
  return api({
    url: "postcodeLookup", 
    method: "get",
    params: payload,
  });
}

export const FacilityService = {
  getStores,
  getLocation
}