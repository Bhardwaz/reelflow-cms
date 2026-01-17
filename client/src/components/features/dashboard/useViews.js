import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../service/apiRequest';

// API Call Function
const fetchStats = async () => {
  return apiRequest({
    method: "GET",
    url: "/bunny/media/views",
  });
};

export const useViews = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
    
    refetchOnWindowFocus: false,
    
    staleTime: 1000 * 60 * 5, 
    
    gcTime: 1000 * 60 * 30, 
    
    retry: 1
  });
};

export default useViews;