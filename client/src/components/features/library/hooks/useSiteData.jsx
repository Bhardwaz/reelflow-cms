import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../../service/apiRequest';

const fetchSiteData = async () => {
    return await apiRequest({
        method: "GET", 
        url: '/site'
    })
};

export const useSiteData = () => {
    return useQuery({
        queryKey: ['site-data'],
        queryFn: fetchSiteData,

        staleTime: 1000 * 60 * 5,
        
        retry: 1,
    });
};