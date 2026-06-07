import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import { FaSearch, FaRegTrashAlt, FaRegEdit, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { AuthContext } from "../../contexts/AuthContext";

const AdminFloristList = () => {
  const navigate = useNavigate();
  const { user: admin } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();
  const [florists, setFlorists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchFlorists = useCallback(async () => {
    showLoading("Memuat data florist...");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/shops/admin/list`);
      const data = await res.json();
      if (res.ok) setFlorists(data);
      else setFlorists([]);
    } catch (err) {
      setFlorists([]);
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  useEffect(() => {
    fetchFlorists();
  }, [fetchFlorists]);

  const handleDelete = (id, name) => {
    showAlert({
      msg: `Hapus Florist "${name}"?`,
      confirmText: "Hapus",
      onConfirm: async () => {
        showLoading("Menghapus...");
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/shops/admin/${id}`, { method: "DELETE" });
          if (res.ok) {
            await fetch(`${process.env.REACT_APP_API_URL}/api/changelogs`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                AdminId: admin._id,
                TargetId: id,
                TargetType: 'Shop',
                TargetName: name,
                Action: 'Delete'
              }),
            });
            showAlert("Florist berhasil dihapus");
            fetchFlorists();
          }
        } finally {
          hideLoading();
        }
      },
    });
  };

  const filteredData = florists.filter((f) => f.Name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="FloristDashboardContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="FloristDashboardTitle">Florist</h1>
        <button className="InventoryBtnAdd" onClick={() => navigate("/admin/florists/add")}><FaPlus /> Tambah Florist</button>
      </div>
      <div className="FloristOrdersTableSection">
        <div className="FloristOrdersHeader" style={{ justifyContent: 'flex-end' }}>
          <div className="FloristSearchWrapper">
            <FaSearch className="FloristSearchIcon" />
            <input type="text" placeholder="Cari..." className="FloristSearchInput" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>
        <div className="FloristTableResponsive">
          <table className="FloristMainTable">
            <thead>
              <tr><th>Nama Toko</th><th>Email</th><th>No. Telepon</th><th style={{ textAlign: 'center' }}>Aksi</th></tr>
            </thead>
            <tbody>
              {displayedItems.length > 0 ? displayedItems.map((f) => (
                <tr key={f._id}>
                  <td className="p2 weight-bold">{f.Name}</td>
                  <td className="p2">{f.Email}</td>
                  <td className="p2">{f.PhoneNumber}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      <FaRegEdit className="InventoryActionIcon" onClick={() => navigate(`/admin/florists/edit/${f._id}`)} />
                      <FaRegTrashAlt className="InventoryActionIcon" style={{ color: '#d9534f' }} onClick={() => handleDelete(f._id, f.Name)} />
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="4" style={{ textAlign: "center", padding: "3rem" }}>Belum ada data florist.</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="InventoryFooterContainer">
            <div className="FloristPagination">
              <button className="FloristPagArrow" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><FaChevronLeft /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`FloristPagNum ${currentPage === i + 1 ? "FloristPagActive" : ""}`} onClick={() => setCurrentPage(i + 1)}>{String(i + 1).padStart(2, '0')}</button>
              ))}
              <button className="FloristPagArrow" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><FaChevronRight /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFloristList;