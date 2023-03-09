import api from '@/api';

const getStores = async (payload: any): Promise <any>  => {
  return api({
    url: "storeLookup", 
    method: "post",
    data: payload,
    cache: true
  });
}

const getLocation = async (payload: any): Promise <any>  => {
  return api({
    url: "postcodeLookup", 
    method: "post",
    data: payload,
    cache: true
  });
}

export const FacilityService = {
  getStores,
  getLocation
}