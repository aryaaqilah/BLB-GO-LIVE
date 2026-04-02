import { useState, useEffect } from 'react';
import PrimaryLogoLight from '../../assets/Logo/Logo_Primary_Dark.png';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { useAlert } from "../../contexts/AlertContext";
import { useNavigate } from "react-router-dom";


const ValidationMessage = ({ field, isValid, message, isTouched }) => {
    if (isTouched && isValid === false) {
        return (
            <p className='validation-error' style={{ color: 'red', fontSize: '0.8em', marginTop: '5px', marginLeft: '50px' }}>
                {message}
            </p>
        );
    }
    return null;
};

export default function Register() {
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [isTouched, setIsTouched] = useState({});

    const [validationErrors, setValidationErrors] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    
    const [isLoading, setIsLoading] = useState(false);
    
    
    const [submitErrorsList, setSubmitErrorsList] = useState([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    
    const API_URL = `${process.env.REACT_APP_API_URL}/api/users`; 

    

    const validatePassword = (password) => {
        const alphanumericRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]{8,}$/;
        return alphanumericRegex.test(password);
    };

    const validateField = (name, value) => {
        let isValid = true;
        let errorMessage = null;

        
        if (name === 'name') {
            const onlyLettersRegex = /^[a-zA-Z ]+$/;
            if (value.length <= 8) {
                isValid = false;
                errorMessage = "Nama harus lebih dari 8 huruf.";
            } else if (!onlyLettersRegex.test(value)) {
                isValid = false;
                errorMessage = "Nama hanya boleh mengandung huruf.";
            }
        } else if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = "Format email tidak valid (harus mengandung '@' dan '.' setelahnya).";
            }
        } else if (name === 'password') {
            if (!validatePassword(value)) {
                isValid = false;
                errorMessage = "Password minimal 8 karakter dan harus Alfanumerik (mengandung huruf dan angka).";
            }
        } else if (name === 'confirmPassword') {
            if (value !== formData.password) {
                isValid = false;
                errorMessage = "Konfirmasi password tidak sama dengan Password.";
            } else if (!validatePassword(formData.password)) {
                isValid = false;
                errorMessage = "Password utama tidak valid.";
            }
        }
        
        return { isValid, errorMessage };
    };
    
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        
        setSubmitErrorsList([]); 
        
        
        const { isValid } = validateField(name, value);
        
        
        if (name === 'password' || name === 'confirmPassword') {
            const confirmedValid = name === 'password' ? value === formData.confirmPassword : value === formData.password;
            const passwordValid = name === 'password' ? isValid : validatePassword(formData.password);

            setValidationErrors(prevErrors => ({
                ...prevErrors,
                'password': name === 'password' ? isValid : prevErrors.password,
                'confirmPassword': confirmedValid && passwordValid
            }));
        } else {
            setValidationErrors(prevErrors => ({
                ...prevErrors,
                [name]: isValid
            }));
        }
    };

    const handleInputBlur = (e) => {
        const { name } = e.target;
        setIsTouched(prevTouched => ({
            ...prevTouched,
            [name]: true
        }));
    };

    
    useEffect(() => {
        const isFormComplete = Object.values(formData).every(value => value.trim() !== '');
        const allFieldsValid = Object.values(validationErrors).every(isValid => isValid === true);
        setIsButtonDisabled(!(isFormComplete && allFieldsValid));
    }, [formData, validationErrors]);

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitErrorsList([]); 
        setIsLoading(true); 
        
        
        setIsTouched({ name: true, email: true, password: true, confirmPassword: true });
        
        
        const errors = [];
        for (const key in formData) {
            const { isValid, errorMessage } = validateField(key, formData[key]);
            if (!isValid && errorMessage) {
                
                if (!errors.includes(errorMessage)) {
                    errors.push(errorMessage);
                }
            }
        }

        if (errors.length > 0) {
            
            if (errors.length === 1) {
                setSubmitErrorsList([errors[0]]);
            } else {
                setSubmitErrorsList(["Terdapat beberapa kesalahan. Mohon periksa kembali semua field."]);
            }
            setIsLoading(false);
            return; 
        }

        
        if (!isButtonDisabled) {
            try {
                
                const { confirmPassword, ...dataToSubmit } = formData;

                const finalDataToSubmit = {
                    Name: dataToSubmit.name,
                    Email: dataToSubmit.email,
                    Password: dataToSubmit.password,
                };

                
                
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(finalDataToSubmit), 
                });

                const responseData = await response.json();

                if (response.ok) {
                    
                    
                    navigate("/login");
                    showAlert("Data Berhasil Disimpan!");
                } else {
                    
                    const serverErrorMessage = responseData.message || responseData.error || "Gagal menyimpan data ke server.";
                    setSubmitErrorsList([`Server Error: ${serverErrorMessage}`]);
                    console.error("Penyimpanan Gagal:", responseData);
                }

            } catch (error) {
                
                console.error("Network Error:", error);
                setSubmitErrorsList(["Terjadi kesalahan koneksi. Pastikan server berjalan di ${process.env.REACT_APP_API_URL}."]);
            } finally {
                setIsLoading(false); 
            }
        } else {
            setIsLoading(false); 
        }
    };

    
    return (
        <div className='RegisterSection'>
            <form className='RegisterForm' onSubmit={handleSubmit} noValidate>
                <img src={PrimaryLogoLight} alt="Primary Logo" className='RegisterLogo' />
                
                {/* Tampilkan Error Submit Global (Poin 6) */}
                {submitErrorsList.length > 0 && (
                    <div style={{ padding: '10px', backgroundColor: '#fdd', border: '1px solid red', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>
                        {submitErrorsList[0]}
                    </div>
                )}
                
                <div className='RegisterInputGroup'>
                    {/* Input Nama */}
                    <div className='RegisterInput'>
                        <FaUser className='RegisterIcon' />
                        <input
                            type="text"
                            placeholder='Nama'
                            className='RegisterInputTextfield'
                            name='name'
                            value={formData.name}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                        />
                    </div>
                    <ValidationMessage
                        isValid={validationErrors.name}
                        message="Nama harus > 8 huruf dan hanya huruf."
                        isTouched={isTouched.name}
                    />
                    {/* ... (INPUT LAINNYA TETAP SAMA) ... */}
                    
                    <div className='RegisterInput'>
                        <FaEnvelope className='RegisterIcon' />
                        <input type="email" placeholder='Email' className='RegisterInputTextfield' name='email' value={formData.email} onChange={handleInputChange} onBlur={handleInputBlur} />
                    </div>
                    <ValidationMessage isValid={validationErrors.email} message="Email harus valid (format: user@domain.com)." isTouched={isTouched.email} />

                    <div className='RegisterInput'>
                        <FaLock className='RegisterIcon' />
                        <input type="password" placeholder='Password' className='RegisterInputTextfield' name='password' value={formData.password} onChange={handleInputChange} onBlur={handleInputBlur} />
                    </div>
                    <ValidationMessage isValid={validationErrors.password} message="Password min. 8 karakter, harus Alfanumerik (huruf & angka)." isTouched={isTouched.password} />

                    <div className='RegisterInput'>
                        <FaLock className='RegisterIcon' />
                        <input type="password" placeholder='Konfirmasi Password' className='RegisterInputTextfield' name='confirmPassword' value={formData.confirmPassword} onChange={handleInputChange} onBlur={handleInputBlur} />
                    </div>
                    <ValidationMessage isValid={validationErrors.confirmPassword} message="Konfirmasi Password harus sama dengan Password." isTouched={isTouched.confirmPassword} />
                </div>

                <div className='AlignCenter'>
                    <button
                        className='button-primary-fill'
                        type='submit'
                        
                        disabled={isButtonDisabled || isLoading} 
                    >
                        {/* Tampilkan teks berbeda saat loading */}
                        {isLoading ? 'Memproses...' : 'Buat'}
                    </button>
                    <p className='p1'>sudah punya akun? <a href="/login" className='p1 txt-color-primary'>masuk ke akun saya</a></p>
                </div>
            </form>
        </div>
    );
} 