import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../../service/apiRequest';

const fetchVideos = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  
  return apiRequest({
    method: "GET",
    url: '/media',
    filters
  })
};

// 2. The Hook
export const useFetchLibrary = (filters = {}) => {
  return useQuery({
    queryKey: ['videos', filters],
    queryFn: () => fetchVideos(filters),
  });
};