import React, { useState, useEffect, useCallback, useContext } from "react";
import { FaSearch, FaRegTrashAlt, FaRegEdit, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { AuthContext } from "../../contexts/AuthContext";

const AdminCustomerList = () => {
  const navigate = useNavigate();
  const { user: admin } = useContext(AuthContext);
  const { showAlert } = { ...useAlert() };
  const { showLoading, hideLoading } = useLoading();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCustomers = useCallback(async () => {
    showLoading("Memuat data kustomer...");
    try {
      const res = await fetch("http://localhost:5000/api/users/admin/customers");
      const data = await res.json();
      if (res.ok) setCustomers(data);
      else setCustomers([]);
    } catch (err) {
      setCustomers([]);
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createLog = async (targetId, name, action) => {
    try {
      await fetch("http://localhost:5000/api/changelogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminId: admin._id,
          TargetId: targetId,
          TargetType: 'User',
          TargetName: name,
          Action: action
        }),
      });
    } catch (err) {
      console.error("Log failed", err);
    }
  };

  const handleDelete = (id, name) => {
    showAlert({
      msg: `Hapus kustomer "${name}"?`,
      confirmText: "Hapus",
      onConfirm: async () => {
        showLoading("Menghapus...");
        try {
          const res = await fetch(`http://localhost:5000/api/users/admin/customers/${id}`, { 
            method: "DELETE" 
          });
          if (res.ok) {
            await createLog(id, name, 'Delete');
            showAlert("Kustomer berhasil dihapus");
            fetchCustomers();
          }
        } finally {
          hideLoading();
        }
      },
    });
  };

  const filteredData = customers.filter((c) => 
    c.Name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.Email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="FloristDashboardContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="FloristDashboardTitle">Kustomer</h1>
        <button className="InventoryBtnAdd" onClick={() => navigate("/admin/customers/add")}><FaPlus /> Tambah Kustomer</button>
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
              <tr><th>Nama</th><th>Email</th><th style={{ textAlign: 'center' }}>Aksi</th></tr>
            </thead>
            <tbody>
              {displayedItems.length > 0 ? displayedItems.map((c) => (
                <tr key={c._id}>
                  <td className="p2 weight-bold">{c.Name}</td>
                  <td className="p2">{c.Email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      <FaRegEdit className="InventoryActionIcon" onClick={() => navigate(`/admin/customers/edit/${c._id}`)} />
                      <FaRegTrashAlt className="InventoryActionIcon" style={{ color: '#d9534f' }} onClick={() => handleDelete(c._id, c.Name)} />
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="3" style={{ textAlign: "center", padding: "3rem" }}>Data tidak ditemukan.</td></tr>}
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

export default AdminCustomerList;