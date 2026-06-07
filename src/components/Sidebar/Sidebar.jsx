import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { FaSignOutAlt, FaBars, FaTimes, FaUser } from "react-icons/fa"; 
import Logo from "../../assets/Logo/Logo_Primary_Light.png";
import "./Sidebar.css";
import { label } from "three/tsl";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const isAdmin = user?.userType === 'admin';

  const menuItems = isAdmin ? [
    { to: "/admin/customers", label: "Kustomer" },
    { to: "/admin/florists", label: "Florist" },
    { to: "/admin/orders", label: "Pesanan" },
    { to: "/admin/history", label: "Riwayat"}
  ] : [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/inventory", label: "Stok" },
    { to: "/manage-orders", label: "Pesanan" },
    { to: "/customization", label: "Kustomisasi" },
  ];

  const handleLogoutAction = () => {
    setIsNavOpen(false);
    showAlert({
      msg: isAdmin 
        ? "Apakah anda yakin ingin mengakhiri sesi administrasi?" 
        : "Apakah anda yakin ingin mengakhiri sesi merangkai bunga hari ini?",
      confirmText: "Keluar",
      cancelText: "Kembali",
      onConfirm: () => {
        logout();
        navigate("/login");
      },
    });
  };

  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const closeNav = () => setIsNavOpen(false);

  return (
    <>
      <div className="SidebarMobileHeader">
        <img src={Logo} alt="Logo" className="SidebarMobileLogo" />
        <button className="SidebarMenuToggle" onClick={toggleNav}>
          {isNavOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <nav className={`SidebarContainerNav ${isNavOpen ? "bloom" : ""}`}>
        <div className="SidebarTopSection">
          <div className="SidebarLogoContainer">
            <img src={Logo} alt="Logo" />
          </div>

          <div className="SidebarProfileSection">
            <FaUser className="SidebarUserIcon" />
            <div className="SidebarUserInfo">
              <h4 className="p2 weight-semibold">{user?.Name || (isAdmin ? "Admin Root" : "Alexa Rawles")}</h4>
              <p className="p3">{user?.email || (isAdmin ? "admin@mail.com" : "alexarawles@gmail.com")}</p>
            </div>
          </div>

          <div className="SidebarLinkList">
            {menuItems.map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                className={({ isActive }) => isActive ? "SidebarTab active" : "SidebarTab"}
                onClick={closeNav}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <button className="SidebarLogoutBtn" onClick={handleLogoutAction}>
          <FaSignOutAlt /> Keluar
        </button>
      </nav>

      {isNavOpen && <div className="SidebarOverlay" onClick={closeNav}></div>}
    </>
  );
};

export default Sidebar;