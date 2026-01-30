import { create } from 'zustand';

const initialSettings = {
  position: 'bottom-right',
  size: 7,
  borderRadius: 12,
  margin: 20,
  circle: false,

  mobile: {
    position: 'bottom-right',
    size: 5,
    margin: 10,
    borderRadius: 12,
    circle: false
  }
};

export const usePipStore = create((set) => ({
  settings: initialSettings,

  activeSection: 'general',
  setActiveSection: (section) => set({ activeSection: section }),

  updateSetting: (key, value, isMobile) => set((state) => {
    if (isMobile) {
      return {
        settings: {
          ...state.settings,
          mobile: { ...state.settings.mobile, [key]: value }
        }
      };
    }
    return {
      settings: { ...state.settings, [key]: value }
    };
  }),

  initializeSettings: (savedSettings) => {
    if (!savedSettings) return;
    
    set((state) => {
      return {
        settings: {
          ...initialSettings, 
          ...savedSettings,   

          mobile: { 
            ...initialSettings.mobile, 
            ...savedSettings.mobile 
          }
        }
      };
    });
  }, 
  
  resetSettings: () => set({ settings: initialSettings })
}));