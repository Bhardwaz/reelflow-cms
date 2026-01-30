import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useWidgetStore = create(
  devtools(
      (set) => ({
        // payload for Apis - we are storing it just because of user choose from 3 screens and we do not want to lose user's choices if he drops in between but we are resetting this payload on success of api

        selectedWidget: null,
        selectedMediaItems: [],
        heading: '',

        selectedWidgetId: null,
        attachMediaItemsToWidget: [],
        attachMediaItemsWidgetType: null,
        isLive: true,
        widgetsData: [],

        toggleAttachMediaItems: (mediaItem) => set((state) => {
          const exists = state.attachMediaItemsToWidget.some((item) => item._id === mediaItem._id);

          let updatedList;
          if (exists) {
            updatedList = state.attachMediaItemsToWidget.filter((item) => item._id !== mediaItem._id);
          } else {
            updatedList = [...state.attachMediaItemsToWidget, mediaItem];
          }

          return { attachMediaItemsToWidget: updatedList };
        }),

        setSelectedWidget: (widgetType) => set({ selectedWidget: widgetType }),
        setSelectedWidgetId: (_id) => set({ selectedWidgetId: _id }),
        selectAttachMediaItemsWidgetType: (widgetType) => set({ attachMediaItemsWidgetType: widgetType }),
        setHeading: (heading) => set({ heading: heading }),
        setIsLive: (status) => set({ isLive: status }),
        setWidgetsData: (data) => set({ widgetsData: data }),

        removeWidgetFromStore: (widgetId) => set((state) => ({
          widgetsData: state.widgetsData.filter((w) => w._id !== widgetId),
          selectedWidgetId: state.selectedWidgetId === widgetId ? null : state.selectedWidgetId
        })),

          removeMediaFromWidget: (widgetId, mediaId) => set((state) => {
            console.log(widgetId, mediaId, "in zustand widget id and mediaid")
            if (!mediaId) return state;

            const updatedWidgets = state.widgetsData.map((widget) => {
              if (widget._id === widgetId) {
                return {
                  ...widget,
                  items: widget.items.filter((item) => {
                    const innerId = item?._id;
                    return innerId !== mediaId
                  })
                };
              }
              return widget;
            });
            return { widgetsData: updatedWidgets };
          }),

        toggleMediaSelection: (mediaItem) => set((state) => {
          const exists = state.selectedMediaItems.some((item) => item._id === mediaItem._id);

          let updatedList;
          if (exists) {
            updatedList = state.selectedMediaItems.filter((item) => item._id !== mediaItem._id);
          } else {
            updatedList = [...state.selectedMediaItems, mediaItem];
          }

          return { selectedMediaItems: updatedList };
        }),

        resetWizard: () => set({
          selectedWidget: null,
          selectedMediaItems: [],
          heading: ''
        }),

        resetAttachMedias: () => set({
          selectedWidgetId: null,
          attachMediaItemsToWidget: [],
          attachMediaItemsWidgetType: '',
        })
      }),
      {
        name: 'widget-wizard-storage',
        partialize: (state) => ({
          selectedWidget: state.selectedWidget,
          selectedMediaItems: state.selectedMediaItems,
          heading: state.heading,
        }),
      }
    )
);