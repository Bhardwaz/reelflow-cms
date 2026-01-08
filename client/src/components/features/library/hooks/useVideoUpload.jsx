import toast from "react-hot-toast";
import axios from "axios";

const requestVideoUpload = async (title) => {
  const res = await axios.post('/api/v1/media/videoRequest', { title },
    {
      headers: {
        "Content-Type": "application/json",
      }
    }
  )
  return res.data.data
}

const uploadVideoToBunny = async (uploadUrl, file, authData, onProgress) => {
  const v = await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": "application/octet-stream",
      // Authorization: authData.authorizationSignature,
      // AuthorizationExpire: authData.authorizationExpire,
      "AccessKey": "e54f3468-4dc7-4940-a5e1ed461ca1-5f78-409b",
    },
    onUploadProgress: (e) => {
      if (!e.total) return;
      const percent = Math.round((e.loaded * 100) / e.total);
      onProgress(percent);
    },
  });
};

async function useVideoUpload(title, media, setProgress, mutate, productName, productId) {
  try {
    if (!media || !media.file) {
      toast.error("No media file found");
      return;
    }
    if (!title) {
      toast.error("Video title is missing");
      return;
    }

    const videoFile = media.file

    const serverPromise = requestVideoUpload(title);

    const { videoId, uploadUrl, authorizationSignature, authorizationExpire } = await toast.promise(
      serverPromise,
      {
        loading: 'Initializing upload...',
        success: 'Initialized!',
        error: (err) => `Init failed: ${err.response?.data?.message || err.message}`
      }
    );

    await toast.promise(
      uploadVideoToBunny(uploadUrl, videoFile, { authorizationSignature, authorizationExpire }, setProgress),
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
      title
    });

  } catch (error) {
    console.error("Upload Service Error:", error);
    // preventing undefined as error
    const msg = error.response?.data?.message || error.message || "Unknown error occurred";
    toast.error(msg);
  }
};

export default useVideoUpload