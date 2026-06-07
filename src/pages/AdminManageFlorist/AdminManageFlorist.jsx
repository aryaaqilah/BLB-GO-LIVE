import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { AuthContext } from "../../contexts/AuthContext";

const AdminManageFlorist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: admin } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hasFetched = useRef(false);

  const [provinceData, setProvinceData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [districtData, setDistrictData] = useState([]);

  const [formData, setFormData] = useState({ Name: "", Email: "", Password: "", PhoneNumber: "", ProvinceId: "", CityId: "", DistrictId: "", PostalCodeId: "", AddressDetail: "" });

  const loadAllData = useCallback(async () => {
    showLoading("Menyiapkan data...");
    setIsInitialLoading(true);
    try {
      const [resProv, resCity, resDist] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/provinces`),
        fetch(`${process.env.REACT_APP_API_URL}/api/cities`),
        fetch(`${process.env.REACT_APP_API_URL}/api/districts`)
      ]);
      setProvinceData(await resProv.json());
      setCityData(await resCity.json());
      setDistrictData(await resDist.json());
      if (id) {
        const resShop = await fetch(`${process.env.REACT_APP_API_URL}/api/shops/${id}`);
        const shop = await resShop.json();
        if (resShop.ok) {
          setFormData({
            Name: shop.Name || "", Email: shop.Email || "", PhoneNumber: shop.PhoneNumber || "", Password: "",
            ProvinceId: shop.Address?.ProvinceId?._id || shop.Address?.ProvinceId || "",
            CityId: shop.Address?.CityId?._id || shop.Address?.CityId || "",
            DistrictId: shop.Address?.DistrictId?._id || shop.Address?.DistrictId || "",
            PostalCodeId: shop.Address?.PostalCodeId || "", AddressDetail: shop.Address?.Detail || ""
          });
        }
      }
    } finally {
      setIsInitialLoading(false);
      hideLoading();
    }
  }, [id, showLoading, hideLoading]);

  useEffect(() => {
    if (!hasFetched.current) {
      loadAllData();
      hasFetched.current = true;
    }
  }, [loadAllData]);

  const handleSave = async () => {
    const { Name, Email, ProvinceId, CityId, DistrictId, PostalCodeId, AddressDetail, Password } = formData;
    if (!Name || !Email || !ProvinceId || !CityId || !DistrictId || !PostalCodeId || !AddressDetail) return showAlert("Lengkapi data!");
    if (!id && !Password) return showAlert("Password wajib!");

    showLoading("Menyimpan...");
    const payload = { ...formData };
    if (id && !Password) delete payload.Password;

    try {
      const url = id ? `${process.env.REACT_APP_API_URL}/api/shops/${id}` : `${process.env.REACT_APP_API_URL}/api/shops/admin/register`;
      const res = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (res.ok) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/changelogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            AdminId: admin._id,
            TargetId: id || resData._id,
            TargetType: 'Shop',
            TargetName: formData.Name,
            Action: id ? 'Update' : 'Create'
          }),
        });
        showAlert("Data Florist Berhasil Disimpan!");
        navigate("/admin/florists");
      } else showAlert(resData.error || "Gagal menyimpan");
    } catch { showAlert("Kesalahan koneksi"); }
    finally { hideLoading(); }
  };

  if (isInitialLoading) return <div style={{ minHeight: "100vh" }}></div>;

  return (
    <div className="FloristManageBouquetContainer">
      <button className="TernaryBackButton" onClick={() => navigate(-1)}><FaArrowLeft /></button>
      <h2 className="FloristManageBouquetTitle">{id ? "Edit Toko Florist" : "Tambah Toko Florist"}</h2>
      <div className="FloristManageBouquetForm">
        <div className="FloristInputGroup"><label>Nama Toko</label><input type="text" value={formData.Name} onChange={e => setFormData({...formData, Name: e.target.value})} /></div>
        <div className="FloristInputGroup"><label>Email Toko</label><input type="email" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} /></div>
        <div className="FloristInputGroup"><label>Nomor Telepon</label><input type="text" value={formData.PhoneNumber} onChange={e => setFormData({...formData, PhoneNumber: e.target.value})} /></div>
        <div className="FloristInputGroup"><label>{id ? "Password Baru" : "Password"}</label><input type="password" value={formData.Password} onChange={e => setFormData({...formData, Password: e.target.value})} /></div>
        <hr style={{margin: '30px 0', border: '0.5px solid #eee'}} />
        <div className="FloristInputGroup"><label>Provinsi</label><select value={formData.ProvinceId} onChange={e => setFormData({...formData, ProvinceId: e.target.value})} className="AddressSelect"><option value="">-- Pilih --</option>{provinceData.map(p => (<option key={p._id} value={p._id}>{p.provinsi_name}</option>))}</select></div>
        <div style={{display: 'flex', gap: '20px'}}><div className="FloristInputGroup" style={{flex: 1}}><label>Kota</label><select value={formData.CityId} onChange={e => setFormData({...formData, CityId: e.target.value})} className="AddressSelect"><option value="">-- Pilih --</option>{cityData.filter(c => (c.provinsi_id?._id || c.provinsi_id) === formData.ProvinceId).map(c => (<option key={c._id} value={c._id}>{c.city_name}</option>))}</select></div><div className="FloristInputGroup" style={{flex: 1}}><label>Kecamatan</label><select value={formData.DistrictId} onChange={e => setFormData({...formData, DistrictId: e.target.value})} className="AddressSelect"><option value="">-- Pilih --</option>{districtData.filter(d => (d.city_id?._id || d.city_id) === formData.CityId).map(d => (<option key={d._id} value={d._id}>{d.district_name}</option>))}</select></div></div>
        <div className="FloristInputGroup"><label>Kode Pos</label><input type="text" value={formData.PostalCodeId} onChange={e => setFormData({...formData, PostalCodeId: e.target.value})} /></div>
        <div className="FloristInputGroup"><label>Detail Alamat</label><textarea value={formData.AddressDetail} onChange={e => setFormData({...formData, AddressDetail: e.target.value})} style={{minHeight: '80px'}} /></div>
        <div className="FloristActionCenter" style={{ marginTop: '2rem' }}><button className="FloristSubmitBtn" onClick={handleSave}>Simpan Data Florist</button></div>
      </div>
    </div>
  );
};

export default AdminManageFlorist;