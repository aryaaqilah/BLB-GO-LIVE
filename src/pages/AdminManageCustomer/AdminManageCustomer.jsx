import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { AuthContext } from "../../contexts/AuthContext";

const ValidationMessage = ({ isValid, message, isTouched }) => {
  if (isTouched && isValid === false) return <p style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}>{message}</p>;
  return null;
};

const AdminManageCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: admin } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();
  const hasFetched = useRef(false);

  const [formData, setFormData] = useState({ Name: "", Email: "", Password: "", ConfirmPassword: "" });
  const [isTouched, setIsTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({ Name: false, Email: false, Password: false, ConfirmPassword: false });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const validatePassword = (password) => /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]{8,}$/.test(password);

  const validateField = (name, value) => {
    if (name === "Name") return value.length > 8 && /^[a-zA-Z ]+$/.test(value);
    if (name === "Email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (name === "Password") return validatePassword(value);
    if (name === "ConfirmPassword") return value === formData.Password && validatePassword(formData.Password);
    return true;
  };

  useEffect(() => {
    if (!id || hasFetched.current === id) return;
    const fetchCustomerData = async () => {
      showLoading("Mengambil data...");
      try {
        const res = await fetch(`http://localhost:5000/api/users/admin/customers/${id}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({ Name: data.Name || "", Email: data.Email || "", Password: "", ConfirmPassword: "" });
          setValidationErrors({ Name: true, Email: true, Password: true, ConfirmPassword: true });
          hasFetched.current = id;
        } else navigate("/admin/customers");
      } finally { hideLoading(); }
    };
    fetchCustomerData();
  }, [id, navigate, showLoading, hideLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const isValid = validateField(name, value);
    if (name === "Password" || name === "ConfirmPassword") {
      const isMatch = name === "Password" ? value === formData.ConfirmPassword : value === formData.Password;
      const passValid = name === "Password" ? isValid : validatePassword(formData.Password);
      setValidationErrors((prev) => ({ ...prev, Password: name === "Password" ? isValid : prev.Password, ConfirmPassword: isMatch && passValid }));
    } else setValidationErrors((prev) => ({ ...prev, [name]: isValid }));
  };

  useEffect(() => {
    const isNameOk = validationErrors.Name;
    const isEmailOk = validationErrors.Email;
    if (id) setIsButtonDisabled(!(isNameOk && isEmailOk && formData.Name.trim() !== "" && formData.Email.trim() !== ""));
    else {
      const isPassOk = validationErrors.Password;
      const isConfirmOk = validationErrors.ConfirmPassword;
      setIsButtonDisabled(!(isNameOk && isEmailOk && isPassOk && isConfirmOk && Object.values(formData).every((v) => v.trim() !== "")));
    }
  }, [formData, validationErrors, id]);

  const handleSave = async () => {
    showLoading("Menyimpan...");
    const url = id ? `http://localhost:5000/api/users/admin/customers/${id}` : `http://localhost:5000/api/users/admin/customers`;
    const payload = { Name: formData.Name, Email: formData.Email };
    if (!id) payload.Password = formData.Password;

    try {
      const res = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (res.ok) {
        await fetch("http://localhost:5000/api/changelogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            AdminId: admin._id,
            TargetId: id || resData._id,
            TargetType: 'User',
            TargetName: formData.Name,
            Action: id ? 'Update' : 'Create'
          }),
        });
        showAlert(id ? "Data diperbarui!" : "Kustomer ditambahkan!");
        navigate("/admin/customers");
      } else showAlert(resData.error || "Gagal menyimpan");
    } catch { showAlert("Kesalahan koneksi"); }
    finally { hideLoading(); }
  };

  return (
    <div className="FloristManageBouquetContainer">
      <button className="TernaryBackButton" onClick={() => navigate(-1)}><FaArrowLeft /></button>
      <h2 className="FloristManageBouquetTitle">{id ? "Edit Kustomer" : "Tambah Kustomer"}</h2>
      <div className="FloristManageBouquetForm">
        <input style={{ display: 'none' }} type="text" name="fake-username" /><input style={{ display: 'none' }} type="password" name="fake-password" />
        <div className="FloristInputGroup">
          <label>Nama Lengkap</label>
          <input type="text" name="Name" value={formData.Name} autoComplete="off" onChange={handleInputChange} onBlur={(e) => setIsTouched(p => ({ ...p, Name: true }))} />
          <ValidationMessage isValid={validationErrors.Name} isTouched={isTouched.Name} message="Nama > 8 karakter & hanya huruf." />
        </div>
        <div className="FloristInputGroup">
          <label>Email</label>
          <input type="email" name="Email" value={formData.Email} autoComplete="new-email" onChange={handleInputChange} onBlur={(e) => setIsTouched(p => ({ ...p, Email: true }))} />
          <ValidationMessage isValid={validationErrors.Email} isTouched={isTouched.Email} message="Format email tidak valid." />
        </div>
        {!id && (
          <><div className="FloristInputGroup">
              <label>Password</label>
              <input type="password" name="Password" value={formData.Password} autoComplete="new-password" onChange={handleInputChange} onBlur={(e) => setIsTouched(p => ({ ...p, Password: true }))} />
              <ValidationMessage isValid={validationErrors.Password} isTouched={isTouched.Password} message="Password min. 8 karakter & Alfanumerik." />
            </div>
            <div className="FloristInputGroup">
              <label>Konfirmasi Password</label>
              <input type="password" name="ConfirmPassword" value={formData.ConfirmPassword} autoComplete="new-password" onChange={handleInputChange} onBlur={(e) => setIsTouched(p => ({ ...p, ConfirmPassword: true }))} />
              <ValidationMessage isValid={validationErrors.ConfirmPassword} isTouched={isTouched.ConfirmPassword} message="Konfirmasi password harus sama." />
            </div></>
        )}
        {id && <p className="p3" style={{ color: '#888', fontStyle: 'italic', marginTop: '-10px' }}>* Password tidak dapat diubah oleh Admin.</p>}
        <div className="FloristActionCenter" style={{ marginTop: '2rem' }}>
          <button className="FloristSubmitBtn" onClick={handleSave} disabled={isButtonDisabled} style={{ opacity: isButtonDisabled ? 0.5 : 1 }}>{id ? "Simpan Perubahan" : "Buat Kustomer"}</button>
        </div>
      </div>
    </div>
  );
};

export default AdminManageCustomer;