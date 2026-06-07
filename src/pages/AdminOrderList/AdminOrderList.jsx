import React, { useState, useEffect, useCallback, useContext } from "react";
import { FaSearch, FaRegTrashAlt, FaRegEdit, FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { AuthContext } from "../../contexts/AuthContext";

const AdminOrderList = () => {
  const navigate = useNavigate();
  const { user: admin } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = useCallback(async () => {
    showLoading("Memuat semua pesanan...");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/admin/list`);
      const data = await res.json();
      if (res.ok) setOrders(data);
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDelete = (id) => {
    showAlert({
      msg: `Hapus pesanan #${id.slice(-6).toUpperCase()}?`,
      confirmText: "Hapus",
      onConfirm: async () => {
        showLoading("Menghapus...");
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/admin/${id}`, { method: "DELETE" });
          if (res.ok) {
            await fetch(`${process.env.REACT_APP_API_URL}/api/changelogs`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                AdminId: admin._id,
                TargetId: id,
                TargetType: 'Order',
                TargetName: `Order #${id.slice(-6).toUpperCase()}`,
                Action: 'Delete'
              }),
            });
            showAlert("Pesanan berhasil dihapus");
            fetchOrders();
          }
        } finally {
          hideLoading();
        }
      },
    });
  };

  const statusLabels = { 0: "Menunggu", 1: "Berhasil", 2: "Diproses", 3: "Dikirim", 4: "Selesai", 5: "Batal" };
  const filteredData = orders.filter((o) => o._id.toLowerCase().includes(searchQuery.toLowerCase()) || o.UserId?.Name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.ShopId?.Name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const displayedItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="FloristDashboardContainer">
      <h1 className="FloristDashboardTitle">Semua Pesanan</h1>
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
              <tr><th>ID</th><th>Customer</th><th>Toko</th><th>Status</th><th>Total</th><th style={{ textAlign: 'center' }}>Aksi</th></tr>
            </thead>
            <tbody>
              {displayedItems.map((o) => (
                <tr key={o._id}>
                  <td className="p2 weight-bold">#{o._id.slice(-6).toUpperCase()}</td>
                  <td className="p2">{o.UserId?.Name || "Guest"}</td>
                  <td className="p2">{o.ShopId?.Name || "Shop"}</td>
                  <td className="p2">{statusLabels[o.Status]}</td>
                  <td className="p2">Rp {o.Total?.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      <FaEye className="InventoryActionIcon" onClick={() => navigate(`/order-detail/${o._id}`)} />
                      <FaRegEdit className="InventoryActionIcon" onClick={() => navigate(`/admin/orders/edit/${o._id}`)} />
                      <FaRegTrashAlt className="InventoryActionIcon" style={{ color: '#d9534f' }} onClick={() => handleDelete(o._id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderList;