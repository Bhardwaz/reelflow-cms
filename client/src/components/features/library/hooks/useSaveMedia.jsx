import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../service/apiRequest";

const saveMediaApi = (data) => {
    return apiRequest({
        method: 'POST',
        url: '/media',
        data
    });
};

export const useSaveMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveMediaApi,

    retry: 1,
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};
