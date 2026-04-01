import "./Payment.css";
import { useEffect, useState, useRef, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useLoading } from "../../contexts/LoadingContext";
import { useAlert } from "../../contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { get as getDb } from "idb-keyval";
import { clear } from "idb-keyval";

function MainSection({
  selectedProduct,
  addressData,
  adminFee,
  discountData,
  modelScene,
}) {
  
  const formatRupiah = (number) => {
    if (number === undefined || number === null || isNaN(number))
      return "Rp. 0";
    return "Rp. " + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  
  
  
  

  
  const shippingFee = 10000;

  
  const adminFeeAmount = adminFee[0]?.Fee || 0;

  
  const productPrice = selectedProduct?.price || 0;

  
  const discountPercentage = discountData[0]?.Percentage || 0;
  const discountMax = discountData[0]?.Maximum || 0;
  const calculatedDiscount = Math.min(
    Math.floor(discountPercentage * productPrice),
    discountMax
  );

  
  const totalOrder =
    productPrice + shippingFee + adminFeeAmount - calculatedDiscount;

  const tempProvince = addressData.ProvinceId;
  const tempCity = addressData.CityId;
  const tempDistrict = addressData.DistrictId;
  const tempPostalCode = addressData.PostalCodeId;
  const tempRecipientNumber = addressData.RecipientNumber;

  const tempQuestion = selectedProduct.question;
  const tempAnswer = selectedProduct.answer;

  const [model, setModel] = useState([]);

  const [currentModelPath, setCurrentModelPath] = useState("");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const { showLoading, hideLoading } = useLoading();

  const [showPayment, setShowPayment] = useState(false);

  

  const [navigateBack, setNavigateBack] = useState(true);

  const handleGoBack = () => {
    if (navigateBack) {
      navigate(-1);
    }
    else {      
      window.history.replaceState({ fromPayment: true }, "", "/profile");
      navigate("/profile", {
        state: { fromPayment: true },
        replace: true
      });
    }
  };

  const handleCardSelect = async () => {

    showLoading("Memproses pembayaran...");
    if (!user) {
      showAlert("Silakan login terlebih dahulu untuk melakukan pembelian.");
      navigate("/login");
      return;
    }
    try {
      
      const response = await fetch(
        `http://localhost:5000/api/provinces/${tempProvince}`
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil data provinsi");
      }
      const dataProv = await response.json();

      const response2 = await fetch(
        `http://localhost:5000/api/cities/${tempCity}`
      );
      if (!response2.ok) {
        throw new Error("Gagal mengambil data kota");
      }
      const dataCity = await response2.json();
      

      const response3 = await fetch(
        `http://localhost:5000/api/districts/${tempDistrict}`
      );
      if (!response3.ok) {
        throw new Error("Gagal mengambil data kecamatan");
      }
      const dataDistrict = await response3.json();

      
      
      

      
      const addressPayload = {
        RecipientName: addressData.RecipientName,
        RecipientNumber: addressData.RecipientNumber, 
        ProvinceId: dataProv._id,
        CityId: dataCity._id,
        DistrictId: dataDistrict._id, 
        PostalCodeId: tempPostalCode,
        Detail: addressData.Detail,
      };
      
      const addressRes = await fetch("http://localhost:5000/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressPayload),
      });

      const savedAddress = await addressRes.json();

      if (!addressRes.ok) {
        throw new Error(savedAddress.message || "Gagal menyimpan alamat");
      }
      

      //SECTION POST DELIVERY =========================================================================
      const date = new Date();
      date.setDate(date.getDate() + 3);
      

      const deliveryPayload = {
        ShippingCode: "To be inputed ["+date.getTime()+"]",
        Service: "To be inputed",
        EstimatedArrival: date,
        TrackingLink: "To be inputed",
        Notes: addressData.Note || "No notes available",
        Price : shippingFee
      };

      
      const deliveryRes = await fetch("http://localhost:5000/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryPayload),
      });

      const savedDelivery = await deliveryRes.json();

      if (!deliveryRes.ok) {
        throw new Error(savedAddress.message || "Gagal menyimpan delivery");
      }
      

      //SECTION POST 3D MODEL =========================================================================
      let finalData = selectedProduct;
      let currentModelUrl = selectedProduct.modelUrl || "";

      let modelUrl = "";

      if (selectedProduct.isCustomizable && modelScene) {
        
        const result = await handleSaveAndExport();
        
        modelUrl = result.modelUrl;
        if (!result.success) {
          
        }
      }

      const resModel = await fetch("http://localhost:5000/api/design3d/");
      const dataModel = await resModel.json();
      const modelId = dataModel.reverse().slice(0, 1)[0]._id;
      

      
      
      

      const modelUpdatePayload = {
        ModelId: modelId,
        Path: modelUrl,
      };

      

      const modelRes = await fetch(
        `http://localhost:5000/api/design3d/${dataModel._id}/add-path`,
        {
          method: "PUT", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modelUpdatePayload),
        }
      );

      const savedModel = await modelRes.json();

      

      //SECTION POST ITEMS
      let collectedIds = [{}];
      
      const postItems = async (itemsData) => {
        
        for (const itemArray of itemsData) {
          const item = itemArray[0];
          if (!item || item.Quantity <= 0) {
            
            continue;
          }
          
          const payload = {
            ItemId: itemArray[0].ItemId,
            Quantity: itemArray[0].Quantity,
          };

          
          

          try {
            const response = await fetch("http://localhost:5000/api/productdetails", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const savedItems = await response.json();
            const newId = savedItems._id;
            if (newId) {
              collectedIds.push({ tempId: newId });
              
            }
            console.log(
              `✅ Berhasil simpan ComponentId: ${payload.ItemId}`
            );
          } catch (error) {
            console.error(`❌ Gagal simpan ${payload.ItemId}:`, error);
          }
        }
      };

      if (selectedProduct.isCustomizable === true){
          await postItems(selectedProduct.items);
      }
      

      
      
      const testItem = [{ id: "567890" }];
      

      
      let productIdTemp = "";
      if (selectedProduct.isCustomizable) {
        const tempIdArray = collectedIds
        .filter(item => item.tempId) 
        .map(item => item.tempId);

      
        const productPayload = {
          Name: selectedProduct.title,
          Price: productPrice,
          
          Image: selectedProduct.thumbnail,
          ThreeDModel: modelId,
          Memo: selectedProduct.pesan,
          ProductDetail: 
            tempIdArray
            
          ,
          ShopId : selectedProduct.ShopId,
          IsCustomized : 1
        };

        

        const productRes = await fetch("http://localhost:5000/api/products/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });

        const savedProduct = await productRes.json();
        if (!productRes.ok) throw new Error("Gagal memproses pesanan");

        

        productIdTemp = savedProduct._id;
      } else {
        productIdTemp = selectedProduct.key;
      }

      
      
      
      
      
      

      
      const orderPayload = {
        Status: 0,
        AddressId: savedAddress._id, 
        DeliveryId: savedDelivery._id,
        ProductId: productIdTemp,
        ProductPrice: productPrice,
        AdministrationFee: adminFee[0]._id,
        
        
        Total: totalOrder,
        ShopId : selectedProduct.ShopId,
        Token : null,
        StatusPembayaran : 2,
        UserId : user._id
      };
      
      const orderRes = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const savedOrder = await orderRes.json();
      if (!orderRes.ok) throw new Error("Gagal memproses pesanan");

      
      const midtransRes = await fetch("http://localhost:5000/api/payment/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: savedOrder._id,
          amount: totalOrder,
          customer: {
            name: user.Name,
            email: user.Email,
          },
        }),
      });

      const midtransData = await midtransRes.json();

      

      if (!midtransRes.ok) {
        throw new Error("Gagal membuat transaksi pembayaran");
      }

      const updateToken = await fetch(
        `http://localhost:5000/api/orders/${savedOrder._id}/token`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token : String(midtransData.token) }),
        }
      );

      const tokenJson = await updateToken.json();
      

      if (!window.snap) {
        showAlert("Payment gateway belum siap");
        return;
      }
      setShowPayment(true);
      
      hideLoading();
      setNavigateBack(false);
      

      setTimeout(() => {

        window.snap.embed(midtransData.token, {
          embedId: "snap-container",

          onSuccess: async function () {
            try {
              showAlert("Pembayaran berhasil!");

              const StatusTemp = 0;

              const response = await fetch(
                `http://localhost:5000/api/orders/${savedOrder._id}/status-pembayaran`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ StatusPembayaran: StatusTemp }),
                }
              );

            await fetch(
              `http://localhost:5000/api/orders/${savedOrder._id}/update-status-order`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ Status: 1 }),
              }
            );

              if (!response.ok) {
                throw new Error("Gagal update status pembayaran");
              }

              

              await clear();

              navigate("/profile", {
                replace: true,
                state: null,
              });

            } catch (error) {
              console.error("❌ Error onSuccess:", error);
              showAlert("Terjadi kesalahan setelah pembayaran");
            }
          },

          onPending: function () {
            showAlert("Menunggu pembayaran...");

            const StatusTemp = 2;

            fetch(
              `http://localhost:5000/api/orders/${savedOrder._id}/status-pembayaran`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ StatusPembayaran: StatusTemp }),
              }
            );



            clear();

            navigate("/profile", {
              replace: true,
              state: null,
            });
          },

          onError: async function () {
            showAlert("Pembayaran gagal!");

            const StatusTemp = 1;

            try {
              await fetch(
                `http://localhost:5000/api/orders/${savedOrder._id}/status-pembayaran`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ StatusPembayaran: StatusTemp }),
                }
              );

              const updateStock = async (items, type) => {
                const res = await fetch(
                  "http://localhost:5000/api/items/update-stock",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items, type }),
                  }
                );

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
              };

              await updateStock(selectedProduct.items, "increase");

              clear();
              window.location.replace("/");
              navigate("/profile", {
                replace: true,
                state: null,
              });

            } catch (error) {
              console.error("❌ Error onError:", error);
              showAlert("Gagal rollback stok");
            }
          },

          onClose: function () {
            showAlert("Kamu menutup pembayaran.");

            const StatusTemp = 2;

            fetch(
              `http://localhost:5000/api/orders/${savedOrder._id}/status-pembayaran`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ StatusPembayaran: StatusTemp }),
              }
            );

            clear();
            window.location.replace("/");
            navigate("/profile", {
              replace: true,
              state: null,
            });
          },
        });

      },100);
      


    

      const userUpdatePayload = {
        OrderId: savedOrder._id, 
      };

      
      

      
      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
      
      

      
      
      
      
      
      
      
      
      
      
      
    } catch (error) {
      console.error("Error Transaction:", error);
      showAlert("Terjadi kesalahan: " + error.message);
    }
  };
  const handleSaveAndExport = async () => {
    
    const name = selectedProduct?.title || "Customized Bouquet";
    const finalQuestion = selectedProduct?.question; 
    const finalAnswer = selectedProduct?.answer; 

    
    const designData = {
      path: "test-path",
      question: finalQuestion,
      answer: finalAnswer,
      
    };

    try {
      
      const saveRes = await fetch("http://localhost:5000/api/design3d/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designData),
      });

      const savedData = await saveRes.json();
      if (!saveRes.ok)
        throw new Error(savedData.message || "Gagal simpan metadata");

      const newDesignId = savedData._id || savedData.designId;
      

      
      if (!modelScene) throw new Error("modelScene tidak ditemukan!");

      

      const exporter = new GLTFExporter();
      const options = { binary: false, embedImages: true, onlyVisible: true };

      
      const exportResult = await new Promise((resolve, reject) => {
        exporter.parse(
          modelScene,
          (result) => resolve(result),
          (error) => reject(error),
          options
        );
      });

      
      const outputJSON = JSON.stringify(exportResult, null, 2);
      const blob = new Blob([outputJSON], { type: "application/json" });
      const formData = new FormData();
      formData.append("model", blob, `${newDesignId}.gltf`);

      
      const exportRes = await fetch(
        `http://localhost:5000/api/design3d/${newDesignId}/export`,
        {
          method: "POST",
          body: formData,
        }
      );

      const exportData = await exportRes.json();
      if (!exportRes.ok)
        throw new Error(exportData.message || "Gagal upload file GLTF");

      

      if (exportData.success) {
        
        setCurrentModelPath(exportData.modelUrl);
      }
      setCurrentModelPath(exportData.modelUrl);
      

      
      return {
        success: true,
        designId: newDesignId,
        modelUrl: exportData.modelUrl,
      };
    } catch (err) {
      console.error("❌ Error dalam proses Save & Export:", err);
      showAlert(err.message);
      return { success: false };
    }
  };
  return (
    <div>
      <section className="PaymentSection">
        <div className="box"></div>
        <div className="PaymentContainer">
          <div className="Confirmation-Back-Container" style={{ display : "flex", justifyContent : "flex-start", alignItems : "center", width : "100%", height : "10px" }}>
            <button className="TernaryBackButton" onClick={handleGoBack}>
            ←
            </button>
          </div>
          <div style={{ alignSelf: "flex-start", color: "#A95C4C" }}>
            <h1>Pembayaran</h1>
          </div>
          <div className="MainBoxPayment" style={{ color: "#404C4C" }}>
            <div className="LeftMainBox">
              <p
                style={{
                  paddingLeft: "2rem",
                  alignSelf: "flex-start",
                  fontSize: "20px",
                }}
              >
                Order Summary
              </p>
              <div className="PaymentProduct">
                <div
                  className="PaymentProductPicture"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                  }}
                >
                  <img
                    src={selectedProduct?.thumbnail || (selectedProduct.image?.startsWith("data:image")
                        ? selectedProduct.image
                        : `http://localhost:5000${selectedProduct.image}`)}
                    alt="Product"
                    style={{ width: "70%", height: "70%" }}
                  />
                </div>
                <div className="PaymentProductInfo">
                  <div
                    className="PaymentProductName"
                    style={{ fontSize: "20px", height: "20%" }}
                  >
                    {selectedProduct?.title || "FAILED TO LOAD"}
                  </div>
                  <div
                    className="PaymentProductDetails"
                    style={{ fontSize: "12px", height: "30%" }}
                  >
                    {selectedProduct?.description || "No description available"}
                  </div>
                  <div
                    className="PaymentPriceBox"
                    style={{ fontSize: "16px", height: "20%" }}
                  >
                    <div className="PaymentQuantity">x 1</div>
                    <div className="PaymentPrice" style={{ color: "#A95C4C" }}>
                      {formatRupiah(productPrice)}
                    </div>
                  </div>
                  <div
                    className="PaymentNotes"
                    style={{ fontSize: "12px", height: "30%" }}
                  >
                    Notes : <br />
                    {selectedProduct?.catatan || "No notes available"}
                  </div>
                </div>
              </div>

              <div className="PaymentSummary" style={{ fontSize: "16px" }}>
                <div className="PaymentSummaryItem">
                  <div className="PaymentSummaryLeft">Subtotal Produk</div>
                  <div className="PaymentSummaryRight">
                    {formatRupiah(productPrice)}
                  </div>
                </div>

                <div className="PaymentSummaryItem">
                  <div className="PaymentSummaryLeft">Subtotal Pengiriman</div>
                  <div className="PaymentSummaryRight">
                    {formatRupiah(shippingFee)}
                  </div>
                </div>

                <div className="PaymentSummaryItem">
                  <div className="PaymentSummaryLeft">Biaya Layanan</div>
                  <div className="PaymentSummaryRight">
                    {formatRupiah(adminFeeAmount)}
                  </div>
                </div>

                {/* <div className="PaymentSummaryItem">
                  <div className="PaymentSummaryLeft">Total Diskon</div>
                  <div className="PaymentSummaryRight" style={{ color: "red" }}>
                    - {formatRupiah(calculatedDiscount)}
                  </div>
                </div> */}

                <div className="PaymentSummaryItem">
                  <div className="PaymentSummaryLeft">Total Pesanan</div>
                  <div
                    className="PaymentSummaryRight"
                    style={{ color: "#A95C4C", fontWeight: "bold" }}
                  >
                    {formatRupiah(totalOrder)}
                  </div>
                </div>

                <div className="PaymentSummaryItem">
                  <div className="PaymentSummaryLeft">Metode Pembayaran</div>
                  <div className="PaymentSummaryRight">(Pilih Melalui Payment Gateway)</div>
                </div>
              </div>
            </div>

            <div
              className="RightMainBox"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                
              }}
            >
              {!showPayment ? (<button className="Payment-btnConfirm" onClick={handleCardSelect}>
              Process Order
            </button>) : (<div
                id="snap-container"
                style={{ width: "100%",
                  maxHeight: "460px", 
                  overflowY: "auto",
                  borderRadius: "10px" }}
              ></div>)
            }
              
            </div>
          </div>
          <div
            className="Payment-btnContainer"
            style={{ display: "flex", alignSelf: "flex-end" }}
          >
            {/* <button className="Payment-btnConfirm" onClick={handleCardSelect}>
              Process Order
            </button> */}
          </div>
        </div>
        <div className="box"></div>
      </section>
    </div>
  );
}

export default function Payment() {
  const selectedProduct = window.history.state?.usr?.selectedProduct;
  const addressData = window.history.state?.usr?.addressData;
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  useEffect(() => {
    if (!selectedProduct) {
      showAlert("Data produk tidak ditemukan. Silakan ulangi dari awal.");

      navigate("/profile", { replace: true });
    }
  }, [selectedProduct, navigate]);

  const [adminFee, setAdminFee] = useState([]);
  const [discountData, setDiscountData] = useState([]);
  const hasFetched = useRef(false);
  const [modelScene, setModelScene] = useState(null);

  const { showLoading, hideLoading } = useLoading();
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", "Mid-client-7vNauj8bb3yiXmEQ");
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const loadAndParseModel = async () => {
      const data = await getDb("pending_order_model");
      if (data) {
        const loader = new GLTFLoader();
        
        loader.parse(data, "", (gltf) => {
          setModelScene(gltf.scene);
        });
      }
    };
    loadAndParseModel();
    fetchData(); 
  }, []);

  const fetchData = async () => {
    showLoading("Menyiapkan data pembayaran...");
    try {
      
      const resFee = await fetch("http://localhost:5000/api/adminfees/");
      const dataFee = await resFee.json();
      setAdminFee(dataFee.reverse().slice(0, 1));

      

      const response = await fetch(
        `http://localhost:5000/api/discounts/get-voucher?name=${selectedProduct.voucher}`
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil data voucher");
      }
      const dataDisc = await response.json();
      
      
      
      setDiscountData(dataDisc);

      if(dataDisc.length === 0 || selectedProduct.voucher === "" || selectedProduct.voucher === undefined){
        const discountNA = {
          Name: "VOUCHER NOT FOUND",
          Percentage: 0.0,
        };
        setDiscountData(discountNA);
        
      }

      
    } catch (error) {
      
      const discountNA = {
        Name: "VOUCHER NOT FOUND",
        Percentage: 0.0,
      };
      setDiscountData(discountNA);
    }
    hideLoading();
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchData();
      hasFetched.current = true;
    }
  }, []);

  

  return (
    <div>
      <MainSection
        selectedProduct={selectedProduct}
        addressData={addressData}
        adminFee={adminFee}
        discountData={discountData}
        modelScene={modelScene}
      />
    </div>
  );
}
