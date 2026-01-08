import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Edit.css';
import { useReelsData } from '../../context/fetchData';
import { useProductsData } from '../../context/fetchProducts';
import Product from './Product';
import { useGroupsFetchContext } from '../../context/fetchGroups';
import { useEditReel } from '../../hooks/useEditReel';
import { useDeleteReel } from '../../hooks/useDeleteReel';

/* --- 1. Reusable SVG Icons (No external libraries) --- */
const Icons = {
    Back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
    ),
    Share: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
    ),
    Eye: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    ChevronUp: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
    ),
    ChevronDown: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
    ),
};

/* --- 2. Reusable UI Components --- */
const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="control-row">
        <span className="control-label">{label}</span>
        <label className="switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="slider round"></span>
        </label>
    </div>
);

const AccordionItem = ({ title, isOpen, onClick, children, className = "" }) => (
    <div className={`accordion-item ${className}`}>
        <div className="accordion-header" onClick={onClick}>
            <span className="accordion-title">{title}</span>
            {isOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
        </div>
        {isOpen && <div className="accordion-content">{children}</div>}
    </div>
);

/* --- 3. Main Edit Page --- */
export default function Edit() {
    const { id } = useParams();
    const { visibleReels } = useReelsData();
    const { allGroups } = useGroupsFetchContext();
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [videoStatus, setVideoStatus] = useState('published');
    const [title, setTitle] = useState('');
    const { paginatedProducts, page, setPage, PAGE_SIZE, filteredProducts, search, setSearch, products } = useProductsData()
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [hasProduct, setHasProduct] = useState(false)
    const [adminInputForSearch, setAdminInputForSearch] = useState('')
    const navigate = useNavigate()

    const { mutate, isPending, isError, isSuccess, reset } = useEditReel()

    const { mutate: deleteReel, isPending: isDeleting, isError: deleteError, isSuccess: deleteSuccess, reset: deleteReset } = useDeleteReel()

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                reset();
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    // State for Accordions
    const [openSections, setOpenSections] = useState({ settings: true, controls: true, products: true, showProduct: false });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const reel = useMemo(() => {
        return visibleReels?.find(r => r._id === id) || {};
    }, [visibleReels, id]);

    useEffect(() => {
        if (!reel?.productId) {
            setSelectedProduct(null)
            return
        }
        const product = products?.find(p => p.id === reel.productId) || null
        console.log(product, "attached product")
        setSelectedProduct({ id: product?.id, title: product?.title, image: product?.image?.url })
    }, [reel, products])

    useEffect(() => {
        setTitle(reel.title || '');
        setVideoStatus(reel.videoStatus || 'published');
        if (Array.isArray(reel.group)) {
            setSelectedGroups(reel.group);
        }
    }, [reel.group, reel.title, reel.videoStatus]);

    const visibleGroups = useMemo(() => {
        return allGroups?.filter(group => !Array.isArray(reel.group) || !reel.group.includes(group._id));
    }, [allGroups, reel.group]);

    if (!reel._id) return <div className="loading">Reel not found</div>;

    const handleEdit = () => {
        mutate({
            _id: reel?._id,
            payload: {
                title,
                groups: selectedGroups,
                videoStatus,
                productId: selectedProduct?.id,
                hasProduct
            }
        })
    }

    const handleDelete = () => {
        const isConfirmed = window.confirm("Do you really want to delete this reel?")
        if (!isConfirmed) return
        const bunnyVideoId = reel?.bunnyVideoId

        if (!bunnyVideoId) return alert("No video is provided")

        deleteReel(
           { _id: reel?._id},
            {
              onSuccess: () => {
                    alert("Your reel has been deleted")
                    navigate("/reels")
            },
                onError: () => {
                    alert("There is error in deleting this reel")
                }
            }
        )
}

return (
    <div className="edit-container">
        {/* Header */}
        <header className="edit-header">
            <div className="header-left">
                <Link to="/reels" className="back-link">
                    <Icons.Back />
                </Link>
                <div className="header-info">
                    <h1 className="file-title">Edit {reel.title}</h1>
                    <span className="breadcrumbs">My Account / Videos / {id}</span>
                </div>
            </div>

            <div className="header-actions">
                <button
                    className={`delete-btn ${isDeleting ? "deleting" : isSuccess ? "deleted" : ""
                        }`}
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isPending
                        ? "Deleting…"
                        : isSuccess
                            ? "✓ Deleted"
                            : "Delete"}
                </button>

                <button
                    className={`save-btn ${isPending ? "saving" : isSuccess ? "saved" : ""
                        }`}
                    onClick={handleEdit}
                    disabled={isPending}
                >
                    {isPending
                        ? "Saving…"
                        : isSuccess
                            ? "✓ Saved"
                            : "Save"}
                </button>
            </div>

        </header>

        {/* Split Layout */}
        <div className="main-content">

            {/* Left: Video Preview */}

            <aside className="settings-pane">

                <AccordionItem
                    title="SETTINGS"
                    isOpen={openSections.settings}
                    onClick={() => toggleSection('settings')}
                    className="controls-section"
                >
                    <div className="input-group">
                        <label>Title</label>
                        <input
                            type="text"
                            defaultValue={reel.title}
                            className="form-input"
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Set this reel private/public</label>
                        <select
                            className="form-select"
                            value={videoStatus}
                            onChange={e => setVideoStatus(e.target.value)}
                        >
                            <option value="published">Published</option>
                            <option value="private">Private</option>
                        </select>

                    </div>
                </AccordionItem>

                <AccordionItem
                    title="SHOW PRODUCT"
                    isOpen={openSections.showProduct}
                    onClick={() => toggleSection('showProduct')}
                    className="controls-section"
                >
                    <label className="control-row">
                        <span className="control-label"> Show Product </span>
                        <input type="checkbox" onChange={() => setHasProduct(!hasProduct)} />
                    </label>
                </AccordionItem>

                <AccordionItem
                    title="ATTACHED PRODUCT"
                    isOpen={openSections.products}
                    onClick={() => toggleSection('products')}
                    className="controls-section"
                >
                    {
                        selectedProduct ?
                            <div style={{ width: "100%" }}>
                                <img style={{ width: "20%" }} src={selectedProduct?.image} />

                                <p style={{ fontSize: "1.6rem", marginTop: "1rem" }}> {selectedProduct?.title} </p>
                            </div> : <span>
                                No product is attached
                            </span>
                    }
                </AccordionItem>

                <AccordionItem
                    title="Assigned Groups"
                    isOpen={openSections.controls}
                    onClick={() => toggleSection("controls")}
                    className="controls-section"
                >
                    {
                        reel.group?.length > 0 && (
                            <div className="assigned-groups" style={{ display: 'flex', flexDirection: "wrap", gap: "1rem", fontSize: "1.6rem" }}>
                                {reel.group.map(groupId => {
                                    const group = allGroups?.find(g => g._id === groupId);
                                    return group ? <div key={group._id}>
                                        <input key={group._id} type="checkbox"
                                            checked={selectedGroups.includes(group._id)} className="group-badge" value={group.name} onChange={(e) => {
                                                setSelectedGroups(prev =>
                                                    e.target.checked
                                                        ? [...prev, group._id]
                                                        : prev.filter(id => id !== group._id) // ✅ R
                                                );
                                            }} />
                                        <span>{group.name} </span>
                                    </div> : null;
                                })}
                            </div>
                        ) || <p>No groups assigned yet.</p>
                    }
                </AccordionItem>

                <AccordionItem
                    title="GROUPS"
                    isOpen={openSections.controls}
                    onClick={() => toggleSection("controls")}
                    className="controls-section"
                >
                    {visibleGroups?.length > 0 && visibleGroups?.map(group => (
                        <label key={group._id} className="control-row">
                            <span className="control-label">{group.name}</span>

                            <input
                                type="checkbox"
                                checked={selectedGroups.includes(group._id)}
                                onChange={() =>
                                    setSelectedGroups(prev =>
                                        prev.includes(group._id)
                                            ? prev.filter(id => id !== group._id)
                                            : [...prev, group._id]
                                    )
                                }
                            />
                        </label>
                    ))}

                </AccordionItem>

                <div className='admin-search-row'>
                    <input
                        value={adminInputForSearch}
                        onChange={e => setAdminInputForSearch(e.target.value)}
                        placeholder="Search products..."
                    />

                    <button
                        type='button'
                        onClick={() => {
                            setSearch(adminInputForSearch)
                            setPage(1)
                        }}
                    >
                        Search
                    </button>
                </div>

                <table className='reels-table'>
                    <thead>
                        <tr>
                            <th> Sr. no.  </th>
                            <th> Title </th>
                            <th> Description </th>
                            <th> Price </th>
                            <th> Stock </th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            paginatedProducts?.map((p, idx) => (
                                <Product
                                    key={p.id}
                                    idx={idx}
                                    p={p}
                                    onSelect={() => {
                                        selectedProduct?.id === p.id ? setSelectedProduct(null) :
                                            setSelectedProduct({
                                                id: p.id,
                                                title: p.title,
                                                image: p.image?.url
                                            })
                                    }}
                                    isSelected={selectedProduct?.id === p.id}
                                />
                            ))
                        }
                    </tbody>
                </table>

                <div className="buttons-container">
                    <button
                        className="page-btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        ← Prev
                    </button>

                    <span className="page-indicator">{page}</span>

                    <button
                        className="page-btn"
                        disabled={page * PAGE_SIZE >= filteredProducts?.length}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next →
                    </button>
                </div>

            </aside>

            <div className='preview-pane'>
                <div className='video-preview'>
                    <div className="video-card">
                        <div className="video-ratio">
                            <iframe
                                src={reel?.videoUrl}
                                title="Preview"
                                allow="autoplay; fullscreen"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}