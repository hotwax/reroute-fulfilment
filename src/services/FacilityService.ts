import api from '@/api';

const getFacilities = async (payload: any): Promise <any>  => {
  return api({
   // TODO: We can replace this with any API
    url: "/solr-query", 
    method: "post",
    data: payload
  });
}

export const FacilityService = {
  getFacilities
}