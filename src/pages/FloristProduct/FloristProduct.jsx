import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaSearch, FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";

const SectionError = ({ onRetry }) => (
  <div style={{ textAlign: 'center', padding: '3rem' }}>
    <p className="p1 txt-color-ternary" style={{ marginBottom: '1.5rem' }}>Oops... terjadi kesalahan silakan coba lagi</p>
    <button className="rounded-button-primary" onClick={onRetry}>Coba Lagi</button>
  </div>
);

const SectionLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
    <div className="spinner"></div>
  </div>
);

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();

  const [activeTab, setActiveTab] = useState("Buket");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8;

  const [productState, setProductState] = useState({ data: [], loading: true, error: false });
  const [itemState, setItemState] = useState({ data: [], loading: true, error: false });

  const fetchProducts = useCallback(async () => {
    if (!user?._id) return;
    setProductState(prev => ({ ...prev, loading: true, error: false }));
    try {
      const res = await fetch(`http://localhost:5000/api/products/florist/${user._id}`);
      const data = await res.json();
      if (res.ok) setProductState({ data, loading: false, error: false });
      else throw new Error();
    } catch {
      setProductState({ data: [], loading: false, error: true });
    }
  }, [user?._id]);

  const fetchItems = useCallback(async () => {
    if (!user?._id) return;
    setItemState(prev => ({ ...prev, loading: true, error: false }));
    try {
      const res = await fetch(`http://localhost:5000/api/items/florist/${user._id}`);
      const data = await res.json();
      if (res.ok) setItemState({ data, loading: false, error: false });
      else throw new Error();
    } catch {
      setItemState({ data: [], loading: false, error: true });
    }
  }, [user?._id]);

  useEffect(() => {
    fetchProducts();
    fetchItems();
  }, [fetchProducts, fetchItems]);

  const currentData = activeTab === "Buket" ? productState.data : itemState.data;
  const isCurrentLoading = activeTab === "Buket" ? productState.loading : itemState.loading;
  const isCurrentError = activeTab === "Buket" ? productState.error : itemState.error;

  const filteredData = currentData.filter((item) => {
    const name = activeTab === "Buket" ? item.Name : item.ComponentId?.Name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  return (
    <div className="FloristDashboardContainer">
      <h1 className="FloristDashboardTitle">Stok</h1>

      <div className="FloristTabContainer">
        <button 
          className={`FloristTabItem ${activeTab === "Buket" ? "FloristTabActive" : ""}`} 
          onClick={() => handleTabChange("Buket")}
        >
          Buket
        </button>
        <button 
          className={`FloristTabItem ${activeTab === "Item" ? "FloristTabActive" : ""}`} 
          onClick={() => handleTabChange("Item")}
        >
          Item
        </button>
      </div>

      <div className="FloristOrdersTableSection">
        <div className="FloristOrdersHeader" style={{ justifyContent: 'flex-end' }}>
          {/* REFACTORED SEARCH BAR */}
          <div className="FloristSearchWrapper">
            <FaSearch className="FloristSearchIcon" />
            <input 
              type="text" 
              placeholder="Cari produk atau item..." 
              className="FloristSearchInput" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isCurrentLoading ? <SectionLoading /> : isCurrentError ? <SectionError onRetry={activeTab === "Buket" ? fetchProducts : fetchItems} /> : (
          <>
            <div className="FloristTableResponsive">
              <table className="FloristMainTable">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}><input type="checkbox" /></th>
                    <th className="p2 weight-semibold">{activeTab === "Buket" ? "Produk" : "Nama Item"}</th>
                    <th className="p2 weight-semibold">Gambar</th>
                    <th className="p2 weight-semibold">Deskripsi</th>
                    <th className="p2 weight-semibold">Stok</th>
                    <th className="p2 weight-semibold" style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.length > 0 ? displayedItems.map((item) => (
                    <tr key={item._id}>
                      <td><input type="checkbox" /></td>
                      <td className="p2 weight-semibold">{activeTab === "Buket" ? item.Name : item.ComponentId?.Name}</td>
                      <td className="p2" style={{ fontSize: '0.75rem', color: '#888' }}>
                        {activeTab === "Buket" ? item.Image?.split('/').pop() : item.ComponentId?.Asset?.split('/').pop()}
                      </td>
                      <td className="p2" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeTab === "Buket" ? item.Memo : "Komponen Florist"}
                      </td>
                      <td className="p2">{item.Quantity}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', cursor: 'pointer' }}>
                          <FaRegTrashAlt className="InventoryActionIcon" />
                          <FaRegEdit className="InventoryActionIcon" />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "3rem" }}>Data tidak ditemukan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="InventoryFooterContainer">
              <div className="FloristPagination">
                <button className="FloristPagArrow" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><FaChevronLeft /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`FloristPagNum ${currentPage === i + 1 ? "FloristPagActive" : ""}`} 
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                ))}
                <button className="FloristPagArrow" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><FaChevronRight /></button>
              </div>

              <div className="InventoryActionButtons">
                <button className="InventoryBtnDelete">Hapus</button>
                <button className="InventoryBtnAdd">Tambah</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;