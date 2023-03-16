import api from '@/api';

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