import React, { useState, useEffect, useCallback } from "react";
import { FaHistory, FaSearch } from "react-icons/fa";
import { useLoading } from "../../contexts/LoadingContext";

const AdminChangeLog = () => {
  const { showLoading, hideLoading } = useLoading();
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = useCallback(async () => {
    showLoading("Memuat riwayat...");
    try {
      const res = await fetch("http://localhost:5000/api/changelogs");
      const data = await res.json();
      if (res.ok) setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredData = logs.filter((l) => 
    l.TargetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.AdminId?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="FloristDashboardContainer">
      <h1 className="FloristDashboardTitle">Riwayat Aktivitas</h1>
      <div className="FloristOrdersTableSection">
        <div className="FloristOrdersHeader" style={{ justifyContent: 'flex-end' }}>
          <div className="FloristSearchWrapper">
            <FaSearch className="FloristSearchIcon" />
            <input 
              type="text" 
              placeholder="Cari aktivitas..." 
              className="FloristSearchInput" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        <div className="FloristTableResponsive">
          <table className="FloristMainTable">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Aksi</th>
                <th>Tipe</th>
                <th>Nama Target</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((log) => (
                <tr key={log._id}>
                  <td className="p3">{new Date(log.CreatedAt).toLocaleString('id-ID')}</td>
                  <td className="p2 weight-bold">{log.AdminId?.username || "System"}</td>
                  <td className="p2">
                    <span style={{ 
                        color: log.Action === 'Delete' ? 'red' : log.Action === 'Create' ? 'green' : 'orange',
                        fontWeight: 'bold' 
                    }}>
                        {log.Action}
                    </span>
                  </td>
                  <td className="p2">{log.TargetType}</td>
                  <td className="p2">{log.TargetName}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "3rem" }}>Belum ada riwayat.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminChangeLog;