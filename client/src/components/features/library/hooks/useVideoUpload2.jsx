import toast from "react-hot-toast";
import axios from "axios";
import * as tus from "tus-js-client";
import { validateVideoFile } from "../../../../service/videoValidation";

const requestVideoUpload = async (title) => {
  const res = await axios.post('/api/v1/media/videoRequest', { title },
    { headers: { "Content-Type": "application/json" } }
  )
  return res.data.data
}

const uploadVideoToBunnyTUS = (file, authData, onProgress) => {
  return new Promise((resolve, reject) => {

    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000],
      metadata: {
        filetype: file.type,
        title: file.name,
      },
      headers: {
        AuthorizationSignature: authData.signature,
        AuthorizationExpire: authData.expireTime,
        VideoId: authData.videoId,
        LibraryId: authData.libraryId,
      },
      onError: (error) => {
        console.error("TUS Error:", error);
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percent = Math.round((bytesUploaded / bytesTotal) * 100);
        onProgress(percent);
      },
      onSuccess: () => {
        resolve();
      },
    });

    upload.start();
  });
};

async function useVideoUpload2(title, media, setProgress, mutate, productName, productId, productImage, options = {}) {
  console.log("use video upload entered");
  const {
    require9to16 = false,
    maxSizeMB = 150,
    maxDurationSec = 120,
    showReelsWarning = false
  } = options;

  try {
    if (!media || !media.file) {
      toast.error("No media file found");
      return;
    }
    if (!title) {
      toast.error("Video title is missing");
      return;
    }

    const videoFile = media.file;

    const validationToast = toast.loading("Checking video...");

    const validationResult = await validateVideoFile(videoFile, maxSizeMB, maxDurationSec)
      .catch(error => {
        toast.dismiss(validationToast);

        switch (error.type) {
          case "SIZE_LIMIT":
            toast.error(error.message, {
              duration: 5000,
              icon: '📏'
            });
            break;

          case "DURATION_LIMIT":
            toast.error(error.message, {
              duration: 5000,
              icon: '⏱️'
            });
            break;

          case "ASPECT_RATIO":
            toast.error(error.message, {
              duration: 6000,
              icon: '📱'
            });
            break;

          case "INVALID_TYPE":
            toast.error(error.message, {
              duration: 5000,
              icon: '❌'
            });
            break;

          default:
            toast.error(error.message || "Invalid video file")
        }

        throw error;
      })

    toast.dismiss(validationToast);

    // if (showReelsWarning && validationResult?.is9to16) {
    //   toast(t => (
    //     <div className="flex items-start">
    //       <div className="mr-3 text-yellow-500 text-xl">⚠️</div>

    //       <div>
    //         <p className="font-semibold">Not optimal for Video Section</p>

    //         <p className="text-sm text-gray-600">
    //           Video is {validationResult.resolution} ({validationResult.isVertical ? 'Vertical' : 'Horizontal'})
    //           <br />
    //           For best results, use 9:16 aspect ratio (1080×1920)
    //         </p>

    //         <button
    //           onClick={() => toast.dismiss(t.id)}
    //           className="mt-2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded"
    //         >
    //           Upload Anyway
    //         </button>
    //       </div>
    //     </div>
    //   ), {
    //     duration: 8000,
    //     position: "top-center"
    //   })
    // } else if (validationResult.is9to16) {
    //   toast.success(`✅ Perfect video format! ${validationResult.formattedSize}, ${validationResult.formattedDuration}`, {
    //     duration: 3000,
    //     icon: '🎬'
    //   });
    // } else {
    //   toast.success(`Video validated! ${validationResult.formattedSize}, ${validationResult.formattedDuration}`, {
    //     duration: 3000,
    //     icon: '✅'
    //   });
    // }


    // step 2 -- initializing upload
    const serverPromise = requestVideoUpload(title);

    const {
      videoId,
      libraryId,
      collectionId,
      authorizationSignature,
      authorizationExpire,
    } = await toast.promise(
      serverPromise,
      {
        loading: 'Initializing upload...',
        success: 'Initialized!',
        error: (err) => `Init failed: ${err.response?.data?.message || err.message}`
      }
    );

    // 2. PASS TO TUS (Renaming to keep it clean)
    await toast.promise(
      uploadVideoToBunnyTUS(
        videoFile,
        {
          videoId,
          libraryId,
          collectionId,
          signature: authorizationSignature,
          expireTime: authorizationExpire
        },
        setProgress
      ),
      {
        loading: <b>Uploading to Server...</b>,
        success: <b>Upload Completed!</b>,
        error: <b>Upload failed to CDN</b>,
      }
    );

    mutate({
      mediaType: 'Video',
      videoId,
      libraryId,
      collectionId,
      productName: productName || "",
      productId: productId || "",
      productImage: productImage || "",
      title,
      fileSizeMB: validationResult.fileSizeMB,
      duration: validationResult.duration,
      dimensions: validationResult.dimensions
    });

  } catch (error) {
    console.error("Upload Service Error:", error);
    const msg = error.response?.data?.message || error.message || "Unknown error occurred";
    toast.error(msg);
  }
};

export default useVideoUpload2;