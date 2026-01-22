import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../service/apiRequest";
import { useWidgetStore } from "../../../../stores/useWidgetStore";
import toast from "react-hot-toast";

const removeMedia = async ({ widgetId, mediaId }) => {
    return apiRequest({
         method: 'DELETE', 
         url: `media/${widgetId}/media/${mediaId}`, 
         data: undefined
    });
};

const useRemoveMedia = () => {
    const removeMediaFromWidget = useWidgetStore((state) => state.removeMediaFromWidget);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeMedia,
        
        onSuccess: (data, variables) => {
            removeMediaFromWidget(variables.widgetId, variables.zustandId);
            queryClient?.invalidateQueries({ queryKey: ['widgets'] })
            toast.success("Video removed successfully");
        },
        
        onError: (error) => {
            console.error("Failed to remove video:", error);
            toast.error(error.response?.data?.message || "Failed to delete video. Please try again.");
        },
    });
};

export default useRemoveMedia;