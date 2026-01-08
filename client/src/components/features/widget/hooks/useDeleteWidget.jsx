import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../service/apiRequest";
import { useWidgetStore } from "../../../../stores/useWidgetStore";
import toast from "react-hot-toast";

const deleteWidgetApi = async (widgetId) => {
    return apiRequest({
        method: "DELETE",
        url: `/widgets/${widgetId}`,
        data: undefined 
    });
};

const useDeleteWidget = () => {
    const queryClient = useQueryClient();
    const removeWidgetFromStore = useWidgetStore((state) => state.removeWidgetFromStore);

    return useMutation({
        mutationFn: deleteWidgetApi,

        onSuccess: (data, widgetId) => {
            removeWidgetFromStore(widgetId);
            queryClient.invalidateQueries({ queryKey: ['widgets'] });

            toast.success("Widget deleted successfully");
        },

        onError: (error) => {
            console.error("Delete widget failed:", error);
            toast.error(error.response?.data?.message || "Failed to delete widget");
        }
    });
};

export default useDeleteWidget;