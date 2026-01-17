import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "../../../../service/apiRequest";

export const fetchWidgets = async () => {
    return apiRequest({
        method: "GET",
        url: '/widgets',
    });
};

export const useFetchWidgets = () => {
    return useQuery({
        queryKey: ['widgets'],
        queryFn: fetchWidgets,
        
        select: (response) => response?.data || [],

        staleTime: 1000 * 60 * 1,
        refetchOnWindowFocus: false,
    });
};

export default useFetchWidgets;