import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaSearch, FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { AuthContext } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";

const SectionError = ({ onRetry }) => (
  <div style={{ textAlign: 'center', padding: '3rem' }}>
    <p className="p1 txt-color-ternary" style={{ marginBottom: '1.5rem' }}>Oops... terjadi kesalahan silakan coba lagi</p>
    <button className="RoundedButtonPrimary" onClick={onRetry}>Coba Lagi</button>
  </div>
);

const SectionLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>
);

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate(); // Inisialisasi navigate

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
    return item.Name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  // Fungsi Hapus (Placeholder)
  const handleDelete = (id) => {
    showAlert({
      msg: `Apakah Anda yakin ingin menghapus ${activeTab} ini?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: () => {
        console.log("Menghapus ID:", id);
        // Logic hit API DELETE di sini
      }
    });
  };

  return (
    <div className="FloristDashboardContainer">
      <h1 className="FloristDashboardTitle">Stok</h1>

      <div className="FloristTabContainer">
        <button className={`FloristTabItem ${activeTab === "Buket" ? "FloristTabActive" : ""}`} onClick={() => handleTabChange("Buket")}>Buket</button>
        <button className={`FloristTabItem ${activeTab === "Item" ? "FloristTabActive" : ""}`} onClick={() => handleTabChange("Item")}>Item</button>
      </div>

      <div className="FloristOrdersTableSection">
        <div className="FloristOrdersHeader" style={{ justifyContent: 'flex-end' }}>
          <div className="FloristSearchWrapper">
            <FaSearch className="FloristSearchIcon" />
            <input 
              type="text" 
              placeholder={`Cari ${activeTab.toLowerCase()}...`} 
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
                  {activeTab === "Buket" ? (
                    <tr>
                      <th style={{ width: "50px" }}><input type="checkbox" /></th>
                      <th className="p2 weight-semibold">Nama Buket</th>
                      <th className="p2 weight-semibold">Rincian Komponen</th>
                      <th className="p2 weight-semibold">Harga Jual</th>
                      <th className="p2 weight-semibold">Stok Buket</th>
                      <th className="p2 weight-semibold" style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  ) : (
                    <tr>
                      <th style={{ width: "50px" }}><input type="checkbox" /></th>
                      <th className="p2 weight-semibold">Nama Item</th>
                      <th className="p2 weight-semibold">Asset Dasar</th>
                      <th className="p2 weight-semibold">Harga Satuan</th>
                      <th className="p2 weight-semibold">Stok Item</th>
                      <th className="p2 weight-semibold" style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {displayedItems.length > 0 ? displayedItems.map((item) => (
                    <tr key={item._id}>
                      <td><input type="checkbox" /></td>
                      <td className="p2 weight-semibold">{item.Name}</td>
                      <td className="p2">
                        {activeTab === "Buket" ? (
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-background-dark)' }}>
                            {item.ProductDetail?.map(d => `${d.ItemId?.Name} (x${d.Quantity})`).join(", ") || "-"}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#888' }}>
                            {item.ComponentId?.Name || "Komponen Fisik"}
                          </div>
                        )}
                      </td>
                      <td className="p2">{formatCurrency(item.Price)}</td>
                      <td className="p2 weight-bold">{activeTab === "Buket" ? item.Quantity : item.Stok}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', cursor: 'pointer' }}>
                          <FaRegTrashAlt className="InventoryActionIcon" onClick={() => handleDelete(item._id)} />
                          
                          {/* TOMBOL EDIT TERHUBUNG */}
                          <FaRegEdit 
                            className="InventoryActionIcon" 
                            onClick={() => navigate(`/inventory/edit/${item._id}`)} 
                          />
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
                <button className="FloristPagArrow" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><FaChevronLeft /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={`FloristPagNum ${currentPage === i + 1 ? "FloristPagActive" : ""}`} onClick={() => setCurrentPage(i + 1)}>{String(i + 1).padStart(2, '0')}</button>
                ))}
                <button className="FloristPagArrow" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><FaChevronRight /></button>
              </div>

              <div className="InventoryActionButtons">
                <button className="InventoryBtnDelete">Hapus</button>
                
                {/* TOMBOL TAMBAH TERHUBUNG */}
                <button 
                  className="InventoryBtnAdd" 
                  onClick={() => navigate("/inventory/add")}
                >
                  Tambah
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;