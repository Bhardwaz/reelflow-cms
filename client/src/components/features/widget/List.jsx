import '../widgets-manager/WidgetManager.css';
import { GripVertical, Eye, Trash2 } from "lucide-react"

const List = ({ video, selectedItem, handleDelete, handlePreviewClick, setSelectedVideo }) => {
    if (video?.mediaId?.isDeleted) return
    const isSelected = selectedItem?._id === video?._id;
       
    const { mediaType, productImage, productName, thumbnailUrl, title, url } = video.mediaId || video

    return (
        <div
            key={video?._id}
            className={`vm-list-item ${isSelected ? 'selected' : ''}`}
            onClick={handlePreviewClick}
        >
            <div className="vm-drag-handle">
                <GripVertical size={20} />
            </div>

            <div
                className="vm-item-thumb"
                style={{
                    backgroundImage: productImage?.startsWith('http')
                        ? `url(${productImage})`
                        : "",
                    backgroundColor: productImage?.startsWith('http')
                        ? (productImage || '#e5e7eb')
                        : "",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <div className="vm-item-info">
                <div className="vm-item-title">{productName}</div>
                <div className="vm-item-product">
                    <div
                        className="vm-product-mini"
                        style={{
                            backgroundImage: thumbnailUrl.startsWith('http')
                                ? `url(${thumbnailUrl})`
                                : undefined,
                            backgroundColor: thumbnailUrl.startsWith('http')
                                ?  '#e5e7eb'
                                : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>
                    <span className='flex flex-col gap-2'>
                      <p>{title}</p> 
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
                    onClick={(e) => handleDelete(e, video?.mediaId?._id, video?._id)} // here data is nested - one id we need for clearing up zustand store and one for deleting item from widget
                >
                    <Trash2 size={18} />
                </div>
            </div>
        </div>
    )
}

export default List