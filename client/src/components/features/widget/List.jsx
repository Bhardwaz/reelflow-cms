import '../widgets-manager/WidgetManager.css';
import { GripVertical, Eye, Trash2 } from "lucide-react"

const List = ({ handlePreviewClick, selectedItem, item, handleDelete }) => {
    if (item?.mediaId?.isDeleted) return
    const isSelected = selectedItem?._id === item._id;

    console.log(item._id, "video id")

    return (
        <div
            key={item._id}
            className={`vm-list-item ${isSelected ? 'selected' : ''}`}
            onClick={handlePreviewClick}
        >
            <div className="vm-drag-handle">
                <GripVertical size={20} />
            </div>

            <div
                className="vm-item-thumb"
                style={{
                    backgroundImage: item?.mediaId?.productImage?.startsWith('http')
                        ? `url(${item?.mediaId?.productImage})`
                        : "",
                    backgroundColor: !item?.mediaId?.productImage?.startsWith('http')
                        ? (item?.mediaId?.productImage || '#e5e7eb')
                        : "",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <div className="vm-item-info">
                <div className="vm-item-title">{item?.mediaId?.productName}</div>
                <div className="vm-item-product">
                    <div
                        className="vm-product-mini"
                        style={{
                            backgroundImage: item?.mediaId?.thumbnailUrl.startsWith('http')
                                ? `url(${item?.mediaId?.thumbnailUrl})`
                                : undefined,
                            backgroundColor: !item?.mediaId?.thumbnailUrl.startsWith('http')
                                ?  '#e5e7eb'
                                : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>
                    <span className='flex flex-col gap-2'>
                      <p>{item?.mediaId?.title}</p>
                      <p>{item?.mediaId?.productName}</p>  
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="vm-item-actions">
                <div
                    className="vm-action-icon"
                    title="Preview"
                    onClick={(e) => handlePreviewClick(e, item)}
                >
                    <Eye size={18} />
                </div>
                <div
                    className="vm-action-icon delete"
                    title="Delete"
                    onClick={(e) => handleDelete(e, item?.mediaId?._id, item?._id)} // here data is nested - one id we need for clearing up zustand store and one for deleting item from widget
                >
                    <Trash2 size={18} />
                </div>
            </div>
        </div>
    )
}

export default List