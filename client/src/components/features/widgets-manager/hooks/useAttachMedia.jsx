import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiRequest } from '../../../../service/apiRequest';
import { useWidgetStore } from '../../../../stores/useWidgetStore';

const attachMedia = async (widgetData) => {
    return apiRequest({
        method: "POST",
        url: "/widgets/attach",
        data: widgetData
    })
}

export const useAttachMedia = () => {
    const queryClient = useQueryClient();
    const resetAttachMedias = useWidgetStore(state => state.resetAttachMedias)

    return useMutation({
        mutationFn: attachMedia,

        onSuccess: (data) => {
            toast.success("Media attached successfully!");
            queryClient.invalidateQueries({ queryKey: ['attach-media'] });
            resetAttachMedias()
        },

        onError: (error) => {
            console.error("Failed to attach media items:", error);
            const message = error.response?.data?.message || "Failed to attach media items";
            toast.error(message);
        }
    });
};

export default useAttachMedia;