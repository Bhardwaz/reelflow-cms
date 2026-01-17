import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../service/apiRequest";
import toast from "react-hot-toast";

const deleteMedia = async (mediaId) => {
  return apiRequest({
    method: "DELETE",
    url: `/media/${mediaId}`,
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedia,
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] }); 
      toast.success("Media deleted successfully")
    },
    
    onError: (error) => {
      console.error("Failed to delete media:", error);
      toast.error("Could not delete media")
    }
  });
};