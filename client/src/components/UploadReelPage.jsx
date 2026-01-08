import { useEffect, useState } from "react";
import "./UploadReelPage.css";
import { requestUpload, uploadVideoToBunny } from "../../service/bunny";
import axios from "axios";
import { useGroupsFetchContext } from "../../context/fetchGroups";
import { useCreateGroup } from "../../hooks/useCreateGroup";
import { useDeleteGroup } from "../../hooks/useDeleteGroup";

function UploadReelPage() {
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [status, setStatus] = useState("private");
  const [videoGroup, setVideoGroup] = useState("");
  const [errors, setErrors] = useState({});

  const [progress, setProgress] = useState(0);
  const [groupInput, setGroupInput] = useState(false);
  const [selectedGroupIds, setSelectedGroupdIds] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const { allGroups } = useGroupsFetchContext();
  const [groups, setGroups] = useState([]);

  const { mutate: createGroup, isPending: isCreating, isError: isCreateError, isSuccess: isCreateSuccess, reset: resetCreate } = useCreateGroup();
  const { mutate: deleteGroup, isPending: isDeleting, isError: isDeleteError, isSuccess: isDeleteSuccess, reset: resetDelete } = useDeleteGroup();

  useEffect(() => { setGroups(allGroups); }, [allGroups]);

  const handleUpload = async () => {
    try {
      setUploadStatus("uploading");
      if (title?.length < 3) {
        setErrors(prev => ({ ...prev, title: "Title must be at least 3 characters" }));
        return;
      }
      const { videoId, uploadUrl } = await requestUpload(title);
      await uploadVideoToBunny(uploadUrl, videoFile, setProgress);
      await axios.post("http://localhost:3000/api/v1/reels", { videoId, groupIds: selectedGroupIds, title, status });

      setTitle(""); setStatus("private"); setVideoFile(null); setSelectedGroupdIds([]); setProgress(0);
      setUploadStatus("success");
      setTimeout(() => setUploadStatus("idle"), 1500);
    } catch (error) {
      console.log(error);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 2000);
    }
  };

  const handleGroupCreation = async () => {
    try {
      createGroup(videoGroup, { onSuccess: (data) => setGroups(prev => [...prev, data.data]) });
      setVideoGroup(""); setGroupInput(false);
    } catch (error) { console.log(error); }
  };

  const handleDelete = async (_id) => {
    try {
      deleteGroup(_id, { onSuccess: (data) => setGroups(groups?.filter(g => g._id !== data?._id)) });
    } catch (error) { console.log(error); }
  };

  const toggleGroup = (groupId) => {
    setSelectedGroupdIds(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
  };

  useEffect(() => {
    if (isDeleteSuccess || isDeleteError) {
      const timer = setTimeout(() => resetDelete(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDeleteSuccess, isDeleteError, resetDelete]);

  useEffect(() => {
    if (isCreateSuccess || isCreateError) {
      const timer = setTimeout(() => resetCreate(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCreateSuccess, isCreateError, resetCreate]);

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload Reel</h1>
        <p>Publish and manage your video content</p>
      </div>

      <div className="upload-card">
        {/* Section 1: Basic Info */}
        <div className="form-section">
          <div className="input-row">
            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                className={errors.title ? "error" : ""}
                placeholder="Enter video title"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors({}); }}
              />
              {errors.title && <span className="error-text">⚠️ {errors.title}</span>}
            </div>

            <div className="input-group">
              <label>Video Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="private">Private</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Groups */}
        <div className="form-section">
          <div className="section-header">
            <label>Groups</label>
            <button className="btn-text" onClick={() => setGroupInput(!groupInput)}>
              {groupInput ? "Cancel" : "+ Create Group"}
            </button>
          </div>

          {groupInput && (
            <div className="group-creator">
              <input
                value={videoGroup}
                onChange={e => setVideoGroup(e.target.value)}
                placeholder="New group name..."
              />
              <button className="btn-secondary" onClick={handleGroupCreation} disabled={isCreating}>
                {isCreating ? "..." : "Create"}
              </button>
            </div>
          )}

          <div className="groups-grid">
            {groups?.map(group => (
              <div className={`group-item ${selectedGroupIds.includes(group._id) ? 'active' : ''}`} key={group._id}>
                <div className="group-info" onClick={() => toggleGroup(group._id)}>
                  <input type="checkbox" checked={selectedGroupIds.includes(group._id)} readOnly />
                  <span>{group.name}</span>
                </div>
                <button className="btn-delete" onClick={() => handleDelete(group._id)}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: File Upload */}
        <div className="form-section">
          <label>Video File</label>
          <div className="file-drop-zone">
            <input
              type="file"
              accept="video/*"
              id="video-upload"
              onChange={e => setVideoFile(e.target.files[0])}
              hidden
            />
            <label htmlFor="video-upload" className="file-label">
              {videoFile ? (
                <span className="file-name">Selected: {videoFile.name}</span>
              ) : (
                <>
                  <span className="icon">📁</span>
                  <span>Click to select video</span>
                </>
              )}
            </label>
          </div>

          {progress > 0 && (
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-text">{progress}% uploaded</span>
            </div>
          )}
        </div>

        <button
          className={`upload-btn ${uploadStatus}`}
          onClick={handleUpload}
          disabled={!videoFile || uploadStatus === "uploading"}
        >
          {uploadStatus === "uploading" && "Processing..."}
          {uploadStatus === "success" && "✓ Success"}
          {uploadStatus === "error" && "✕ Failed"}
          {uploadStatus === "idle" && "Publish Reel"}
        </button>
      </div>

      {/* Global Notifications (Toast Style) */}
      <div className="toast-container">
        {/* Group Success */}
        {(isCreateSuccess || isDeleteSuccess) && (
          <div className="toast success">Action completed successfully ✓</div>
        )}

        {/* Upload Success */}
        {uploadStatus === "success" && (
          <div className="toast success">Video Upload Success ✓</div>
        )}

        {/* Error Handling (Backend down/Failures) */}
        {(isCreateError || isDeleteError || uploadStatus === "error") && (
          <div className="toast error">
            <span>✕</span>
            {isCreateError && "Failed to create group. Server error."}
            {isDeleteError && "Could not delete group."}
            {uploadStatus === "error" && "Video upload failed."}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadReelPage;