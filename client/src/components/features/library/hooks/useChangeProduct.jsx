import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast'

export const useChangeProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mediaId, updateData }) => {
      const response = await axios.patch(
        `/api/v1/media/changeProduct/${mediaId}`, 
        updateData
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] }); 
      queryClient.invalidateQueries({ queryKey: ['media'] });
      
      console.log("Product updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update product:", error);
      toast.success("Failed in changing product")
    }
  });
};