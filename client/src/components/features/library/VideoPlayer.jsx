import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import 'videojs-contrib-quality-levels';
import 'videojs-http-source-selector'; 

function VideoJSPlayer(props) {
    const playerRef = useRef(null);
    const videoRef = useRef(null);
    const { options, onReady } = props;

    useEffect(() => {
        if (!videoRef.current) return;

        if (!playerRef.current) {
            const videoElement = document.createElement('video-js');

            videoElement.classList.add('vjs-big-play-centered', 'vjs-fill'); 
            videoRef.current.appendChild(videoElement);

            const player = playerRef.current = videojs(videoElement, options, () => {
                videojs.log('player is ready');
                onReady && onReady(player);
            });
            
            playerRef.current = player;
        } 
        
        else {
            const player = playerRef.current;
            player.src(options.sources);
            player.autoplay(options.autoplay);
        }

    }, [options, onReady]); 

    useEffect(() => {
        const player = playerRef.current;
        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player className="w-full h-full">
            <div ref={videoRef} className="w-full h-full" />
        </div>
    );
}

export default VideoJSPlayer;