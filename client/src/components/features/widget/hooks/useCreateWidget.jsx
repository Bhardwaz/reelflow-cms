  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import axios from 'axios';
  import toast from 'react-hot-toast';
  import { apiRequest } from '../../../../service/apiRequest';
  import { useWidgetStore } from '../../../../stores/useWidgetStore';
import { useNavigate } from 'react-router-dom';


  const createWidget = async (widgetData) => {
      return apiRequest({
          method: "POST",
          url: "/widgets",
          data: widgetData
      })
  }

  export const useCreateWidget = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const resetWizard = useWidgetStore(state => state.resetWizard)

    return useMutation({
      mutationFn: createWidget,
      
      onSuccess: (data) => {
        toast.success("Widget created successfully!");
        queryClient.invalidateQueries({ queryKey: ['widgets'] });
        resetWizard()
        navigate('/');
      },

      onError: (error) => {
        console.error("Failed to create widget:", error);
        const message = error.response?.data?.message || "Failed to create widget";
        toast.error(message);
      }
    });
  };

  export default useCreateWidget;