import { useEffect, useState } from 'react';
import { useSiteData } from '../components/features/library/hooks/useSiteData';

export const useAppBridge = (siteId) => {
    const [app, setApp] = useState(null);

    useEffect(() => {
         if(!siteId){
            return
         }
         
        // const queryParams = new URLSearchParams(window.location.search);
        // let site = queryParams.get('site');
        
        if (window.joonwebApp) {
            setApp(window.joonwebApp);
            return;
        }

        const initialize = () => {
            if (typeof window.JoonWebAppBridge !== 'undefined' && !window.joonwebApp) {
                try {
                    const host = new URLSearchParams(window.location.search)
                    const bridgeInstance = new window.JoonWebAppBridge({
                        apiKey: import.meta.env.VITE_JOONWEB_API_KEY,
                        host: host.get('host'),
                        site: siteId
                    });

                    // if (bridgeInstance.actions?.TitleBar) {
                    //     bridgeInstance.actions.TitleBar.create(bridgeInstance, {
                    //         title: 'Shoppable Videos'
                    //     });
                    // }

                    window.joonwebApp = bridgeInstance;
                    setApp(bridgeInstance);
                    console.log('✅ App Bridge initialized successfully');

                } catch (err) {
                    console.error("❌ AppBridge Init Failed:", err);
                }
            }
        };

        const SCRIPT_URL = "https://apps.joonweb.com/app-bridge.js";
        let script = document.querySelector(`script[src="${SCRIPT_URL}"]`);

        if (!script) {
            script = document.createElement("script");
            script.src = SCRIPT_URL;
            script.async = true;
            script.onload = initialize;
            document.head.appendChild(script);
        } else {
            if (typeof window.JoonWebAppBridge !== 'undefined') {
                initialize();
            } else {
                script.addEventListener('load', initialize);
            }
        }

        return () => {
            if (script) script.removeEventListener('load', initialize);
        };

    }, [siteId]);

    return app;
};