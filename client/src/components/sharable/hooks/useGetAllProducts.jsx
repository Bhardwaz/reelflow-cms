import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../service/apiRequest";

// 1. The Fetch Function
const fetchProducts = async () => {
    const response = await apiRequest({
        method: 'GET',
        url: 'media/getAllProducts', // This appends to your baseURL
    });
    // Return the actual list (adjust 'data' based on your backend response structure)
    return response.data; 
};

// 2. The Custom Hook
const useGetAllProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
        
        // Optional: Keep data fresh for 5 minutes (prevents constant refetching)
        staleTime: 1000 * 60 * 5, 
        
        // Optional: Keep in cache for 10 minutes even if unused
        gcTime: 1000 * 60 * 10, 
        
        // Optional: Retry 1 time if it fails
        retry: 1,
    });
};

export default useGetAllProducts;