import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialSettings = {
  previewAnimation: true,
  autoPlay: false,
  autoPlayInterval: 3000,
  loop: true,

  navigation: {
    showNavigation: true,
    showDots: true,    
    navColor: '#000000', 
    baseColor: "#EF4444",
    highlightColor: "#171717"
  },

  header: {
    show: true,
    text: '',
    fontSize: 24,           
    fontWeight: 'bold',      
    alignment: 20,          
    isGradient: false,
  },

  description: {
    show: false,
    text: '',
    fontSize: 16,            
    fontWeight: 'normal',    
    color: '#666666',
    alignment: 20,                   
    maxWidth: 100,           
    lineHeight: 1.5,      
  },

  cardSettings: {
    showProductInfo: true,
    hoverEffect: 'scale',
    paddingTop: 5,
    paddingBottom: 5,
  },

  modal: {
   isAutoPlay: false,
   autoPlayInterval: 3000,
   ctaText: "",
   ctaColor: "#000",
   ctaTextColor: "#fff",
  },

  responsive: {
    mobile: {
      cardsNumber: 1,
    },
    desktop: {
      cardsNumber: 3,
    },
  },
};

export const useCarouselStore = create(devtools((set, get) => ({
  settings: initialSettings,
  
  updateSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value }
    })),
  
  initializeSettings: savedSettings => {
    if(!savedSettings) return
    set(state => {
      return {
        settings: {
          ...initialSettings,
          ...savedSettings,
          
          navigation: { ...initialSettings.navigation, ...savedSettings.navigation },
          responsive: { ...initialSettings.responsive, ...savedSettings?.responsive},

          modal: { ...initialSettings.modal, ...savedSettings.modal },
          header: { ...initialSettings.header, ...savedSettings.header },
          description: {...initialSettings.description, ...savedSettings.description},
          cardSettings: { ...initialSettings.cardSettings, ...savedSettings.cardSettings }
        }
      }
    })
  },
  
  updateNestedSetting: (path, value) =>
    set((state) => {
      const keys = path.split('.');
      const newSettings = { ...state.settings };  
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return { settings: newSettings };
    }),
  
  resetSettings: () => set({ settings: initialSettings }),
})));