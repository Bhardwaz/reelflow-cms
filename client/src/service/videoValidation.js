export const validateVideoFile = (file, maxSizeMB = 150, maxDurationSec = 120, require9to16 = false) => {
     console.log("entering into validating file");
    return new Promise((resolve, reject) => {
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > maxSizeMB) {
            return reject({
                type: "SIZE_LIMIT",
                message: `File size ${fileSizeMB.toFixed(2)}MB exceeds limit of ${maxSizeMB}MB`,
                fileSizeMB,
                maxSizeMB
            });
        }

        const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
        if (!allowedTypes.includes(file.type)) {
            return reject({
                type: "INVALID_TYPE",
                message: `File type ${file.type} not supported. Use MP4, MOV, AVI, MKV, or WebM`,
                allowedTypes
            });
        }

        const video = document.createElement('video');

        video.addEventListener('loadedmetadata', () => {
            const duration = video.duration;
            const width = video.videoWidth;
            const height = video.videoHeight;

            const aspectRatio = width / height;
            const is9to16 = Math.abs(aspectRatio - (9 / 16)) < 0.05; // 5% tolerance
            const isVertical = height > width;

            if (duration > maxDurationSec) {
                window.URL.revokeObjectURL(video.src);
                reject({
                    type: "DURATION_LIMIT",
                    message: `Video duration ${duration.toFixed(2)}s exceeds limit of ${maxDurationSec}s`,
                    duration,
                    maxDurationSec
                });
                return; // ✅ Returns from event handler
            }

            if (require9to16 && !is9to16) {
                window.URL.revokeObjectURL(video.src);
                reject({
                    type: "ASPECT_RATIO",
                    message: `Video is ${width}×${height} (${isVertical ? 'Vertical' : 'Horizontal'}). Needs 9:16 ratio for Reels`,
                    width,
                    height,
                    aspectRatio,
                    isVertical
                });
                return; // ✅ Returns from event handler
            }

            window.URL.revokeObjectURL(video.src);
            resolve({
                duration,
                fileSizeMB,
                dimensions: { width, height },
                aspectRatio,
                is9to16,
                isVertical,
                formattedDuration: formatDuration(duration),
                formattedSize: `${fileSizeMB.toFixed(2)} MB`,
                resolution: `${width}×${height}`,
                valid: true,
                warnings: !is9to16 ? [`Aspect ratio ${(aspectRatio).toFixed(2)}:1 (recommended: 9:16)`] : []
            });
        });

        video.addEventListener('error', () => {
            window.URL.revokeObjectURL(video.src);
            reject({
                type: "INVALID_VIDEO",
                message: "Cannot read video metadata. File may be corrupted."
            });
        });

        const timeout = setTimeout(() => {
            window.URL.revokeObjectURL(video.src);
            reject({
                type: "TIMEOUT",
                message: "Video validation timed out. File may be too large or corrupted."
            });
        }, 10000);

        video.addEventListener('loadedmetadata', () => clearTimeout(timeout), { once: true });

        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
    });
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};