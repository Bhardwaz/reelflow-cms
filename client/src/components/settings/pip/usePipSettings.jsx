import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiRequest } from '../../../service/apiRequest';


const updatePipSettings = async ({ widgetId, newSettings }) => {
    console.log(widgetId, newSettings, "new data in updateCard settings")
    return apiRequest({
        method: "PATCH",
        url: `/widgets/pip/settings/${widgetId}`,
        data: newSettings
    })
}

export const usePipSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePipSettings,

        onSuccess: (data) => {
            toast.success("Settings updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['widgets'] });
        },

        onError: (error) => {
            console.error("Failed to update settings:", error);
            const message = error.response?.data?.message || error?.code || "Failed to update settings";
            toast.error(message);
        }
    });
};

export default usePipSettings;