import { api } from '@/adapter';

const getAssociatedStates = async (payload: any): Promise <any>  => {
  return api({
    url: "getAssociatedStateList", 
    method: "post",
    data: payload,
  });
}

export const UtilityService = {
  getAssociatedStates
}