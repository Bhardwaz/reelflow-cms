import '../widgets-manager/WidgetManager.css';
import { GripVertical, Eye, Trash2 } from "lucide-react"

const List = ({ handlePreviewClick, selectedVideo, video, handleDelete }) => {
    if (video?.isDeleted) return
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
                style={{
                    backgroundImage: video?.productImage?.startsWith('http')
                        ? `url(${video.productImage})`
                        : undefined,
                    backgroundColor: !video.productImage?.startsWith('http')
                        ? (video.productImage || '#e5e7eb')
                        : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <div className="vm-item-info">
                <div className="vm-item-title">{video.productName}</div>
                <div className="vm-item-product">
                    <div
                        className="vm-product-mini"
                        style={{
                            backgroundImage: video.thumb?.startsWith('http')
                                ? `url(${video.thumb})`
                                : undefined,
                            backgroundColor: !video.thumb?.startsWith('http')
                                ? (video.thumb || '#e5e7eb')
                                : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>
                    <span className='flex flex-col gap-2'>
                      <p>{video.title}</p>
                      <p>{video.productName}</p>  
                    </span>
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