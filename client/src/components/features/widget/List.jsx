import './WidgetsManager.css';
import { GripVertical, Eye, Trash2 } from "lucide-react"

const List = ({handlePreviewClick, selectedVideo, video, handleDelete }) => {
    const isSelected = selectedVideo?._id === video._id;

    console.log(video._id, "video id")

    return (
            <div
                key={video._id}
                className={`vm-list-item ${selectedVideo?._id === video._id ? 'selected' : ''}`}
                onClick={handlePreviewClick}
            >
                <div className="vm-drag-handle">
                    <GripVertical size={20} />
                </div>

                <div
                    className="vm-item-thumb"
                    style={{ backgroundColor: video.thumb }}
                />

                <div className="vm-item-info">
                    <div className="vm-item-title">{video.productName}</div>
                    <div className="vm-item-product">
                        <div
                            className="vm-product-mini"
                            style={{ backgroundColor: video.thumb }}
                        ></div>
                        <span>{video.title}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="vm-item-actions">
                    <div
                        className="vm-action-icon"
                        title="Preview"
                        onClick={(e) => handlePreviewClick(e, video)}
                    >
                        <Eye size={18} />
                    </div>
                    <div
                        className="vm-action-icon delete"
                        title="Delete"
                        onClick={(e) => handleDelete(e, video._id)}
                    >
                        <Trash2 size={18} />
                    </div>
                </div>
            </div>
    )
}

export default List