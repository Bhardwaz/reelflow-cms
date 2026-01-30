import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiRequest } from '../../../service/apiRequest';


const updateCardsSettings = async ({ widgetId, newSettings }) => {
    console.log(widgetId, newSettings, "new data in updateCard settings")
    return apiRequest({
        method: "PATCH",
        url: `/widgets/cards/settings/${widgetId}`,
        data: newSettings
    })
}

export const useCarouselSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCardsSettings,

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

export default useCarouselSettings;