import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiRequest } from '../../../../service/apiRequest';

const toggleLive = async ({ widgetId, isLive }) => {
    return apiRequest({
        method: "POST",
        url: `/widgets/goLive/${widgetId}`,
        data: { isLive }
    })
}

export const useToggleLive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleLive,

        onSuccess: (data, variables) => {
            const statusText = variables.isLive ? "Live" : "Offline";
            toast.success(`Widget is now ${statusText}!`);
            queryClient.invalidateQueries({ queryKey: ['live'] });
        },

        onError: (error) => {
            console.error("Failed to toggle status:", error);
            const message = error.response?.data?.message || "Failed to update status";
            toast.error(message);
        }
    });
};

export default useToggleLive;