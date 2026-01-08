import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../service/apiRequest";
import { useWidgetStore } from "../../../../stores/useWidgetStore"; // 1. Import Store
import toast from "react-hot-toast"; // 2. Import Toast (assuming react-hot-toast)

const removeMedia = async ({ widgetId, mediaId }) => {
    return apiRequest({
         method: 'DELETE', 
         url: `media/${widgetId}/media/${mediaId}`, 
         data: undefined
    });
};

const useRemoveMedia = () => {
    const removeMediaFromWidget = useWidgetStore((state) => state.removeMediaFromWidget);

    return useMutation({
        mutationFn: removeMedia,
        
        onSuccess: (data, variables) => {
            // Updating global store ( crucial for preventing 404s on UI refresh)
            removeMediaFromWidget(variables.widgetId, variables.mediaId);
            
            // Success Toast
            toast.success("Video removed successfully");
        },
        
        onError: (error) => {
            console.error("Failed to remove video:", error);
            
            // Error Toast
            toast.error(error.response?.data?.message || "Failed to delete video. Please try again.");
        },
    });
};

export default useRemoveMedia;