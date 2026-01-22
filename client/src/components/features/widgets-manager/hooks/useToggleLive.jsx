import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiRequest } from '../../../../service/apiRequest';
import { useWidgetStore } from '../../../../stores/useWidgetStore';

const toggleLive = async ({ widgetId }) => {
    return apiRequest({
        method: "PATCH",
        url: `/widgets/goLive/${widgetId}`,
    })
}

export const useToggleLive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleLive,

        onSuccess: (data, variables) => {
            console.log(data)
            
            const { widgetId } = variables;
            const { widgetsData, setWidgetsData } = useWidgetStore.getState();

            const updatedWidgets = widgetsData.map(widget => {
                if (widget._id === widgetId) {
                    return { ...widget, isLive: !widget.isLive };
                }
                return widget;
            });
            setWidgetsData(updatedWidgets);

            const statusMsg = data?.meta || "Status Updated Successfully";
            toast.success(statusMsg)
            queryClient.invalidateQueries({ queryKey: ['widgets'] });
        },

        onError: (error) => {
            console.error("Failed to toggle status:", error);
            const message = error.response?.data?.message || "Failed to update status";
            toast.error(message);
        }
    });
};

export default useToggleLive;