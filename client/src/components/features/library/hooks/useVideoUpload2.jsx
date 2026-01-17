import toast from "react-hot-toast";
import axios from "axios";
import * as tus from "tus-js-client";

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
        // 🔒 MAPPING BACKEND VALUES TO TUS HEADERS
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

async function useVideoUpload2(title, media, setProgress, mutate, productName, productId, productImage) {
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
    const serverPromise = requestVideoUpload(title);

    const { 
        videoId, 
        LibraryId,            
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
            libraryId: LibraryId, 
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
      productName: productName || "",
      productId: productId || "",
      productImage: productImage || "",
      title
    });

  } catch (error) {
    console.error("Upload Service Error:", error);
    const msg = error.response?.data?.message || error.message || "Unknown error occurred";
    toast.error(msg);
  }
};

export default useVideoUpload2;