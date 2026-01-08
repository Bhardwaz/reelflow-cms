import axios from "axios";
import toast from "react-hot-toast";

const useImageUpload = async (title, mediaState, setProgress, mutate, productName, productId, mediaType) => {
    
    // 1. Get the raw file from your state
    const rawFile = mediaState.file; 

    if (!rawFile) {
        console.error("No raw file found!");
        toast.error("Please select a file first");
        return;
    }

    try {
        console.log("Starting Proxy Upload...");

        // 2. Prepare FormData (Required for sending files to Backend)
        const formData = new FormData();
        formData.append('file', rawFile); // 'file' must match upload.single('file') in backend

        // 3. Send to YOUR Backend Proxy Route
        // Note: We use the standard axios instance here. 
        // It WILL include your Auth Token, which is good because this is your own server.
        const res = await axios.post('http://localhost:3000/api/v1/media/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if(setProgress) setProgress(percentCompleted);
                }
            }
        });

        // 4. Extract the BunnyCDN URL returned by your backend
        const { url, bunnyImageId } = res.data.data;

        console.log("Upload success. Saving Metadata...");

        // 5. Save the rest of the data (Title, Product, etc.) to your DB
        mutate({
            mediaType,
            bunnyImageId, 
            url, // The public URL from Bunny
            title,
            productId,
            productName,
        });

        toast.success("Image uploaded successfully!");

    } catch (error) {
        console.error("Upload failed", error);
        
        // Helper to extract the specific error message from the backend if available
        const message = error.response?.data?.message || error.message || "Upload failed";
        toast.error(message);
    }
}

export default useImageUpload;