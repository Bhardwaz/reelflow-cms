import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useWidgetStore = create(
  devtools(
    persist(
      (set) => ({
        // payload for Apis - we are storing it just because of user choose from 3 screens and we do not want to lose user's choices if he drops in between but we are resetting this payload on success of api

        selectedWidget: null,
        selectedMediaItems: [],
        selectedPage: '',
        
        selectedWidgetId: null,
        isLive: true,
        widgetsData: [],

        setSelectedWidget: (widgetType) => set({ selectedWidget: widgetType }),
        setSelectedWidgetId: (_id) => set({ selectedWidgetId: _id }),
        setSelectedPage: (page) => set({ selectedPage: page }),
        setIsLive: (status) => set({ isLive: status }),
        setWidgetsData: (data) => set({ widgetsData: data }),

        removeWidgetFromStore: (widgetId) => set((state) => ({
            widgetsData: state.widgetsData.filter((w) => w._id !== widgetId),
            selectedWidgetId: state.selectedWidgetId === widgetId ? null : state.selectedWidgetId
        })),

        removeMediaFromWidget: (widgetId, mediaId) => set((state) => {
            const updatedWidgets = state.widgetsData.map((widget) => {
                if (widget._id === widgetId) {
                    return {
                        ...widget,
                        items: widget.items.filter((item) => {
                            const currentItemId = item.mediaId?._id || item.mediaId;
                            return currentItemId !== mediaId;
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
          selectedPage: ''
        }),
      }),
      {
        name: 'widget-wizard-storage',
      }
    )
  )
);