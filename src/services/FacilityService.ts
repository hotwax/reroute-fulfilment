import api from '@/api';

const getNearByStores = async (payload: any): Promise <any>  => {
  return api({
    url: "storeLookup", 
    method: "post",
    data: payload,
    cache: true
  });
}

const getLatLong = async (payload: any): Promise <any>  => {
  return api({
    url: "postcodeLookup", 
    method: "post",
    data: payload,
    cache: true
  });
}

export const FacilityService = {
  getNearByStores,
  getLatLong
}