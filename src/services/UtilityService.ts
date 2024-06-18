import { api } from '@/adapter';

const getAssociatedStates = async (payload: any): Promise <any>  => {
  return api({
    url: "getStatesForRerouteOrder",
    method: "post",
    data: payload,
  });
}

const getGeoLocation = async (payload: any): Promise <any>  => {
  // TODO implement caching
  return api({
    url: "postcodeLookup", 
    method: "get",
    params: payload,
  });
}

export const UtilityService = {
  getAssociatedStates,
  getGeoLocation
}