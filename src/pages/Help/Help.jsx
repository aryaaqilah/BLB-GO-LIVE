import HelpLandingImage from "../../assets/HelpLanding.jpg";
import { div } from "three/tsl";
import React, { useState, useRef, useEffect } from "react";

function HelpLanding() {
  return (
    <div>
      <section className="HelpLandingSection">
        <img src={HelpLandingImage} alt="" className="HelpLandingImage" />
        <div className="HelpLandingOverlay">
          <h1 className="txt-color-primary">Pusat Bantuan</h1>
          <p className="p1 txt-color-white">
            semua yang anda perlukan untuk mengukir kisah
          </p>
        </div>
      </section>
    </div>
  );
}

function FAQ() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const answerRefs = useRef([]); 

  const faqs = [
    {
    question: "Bagaimana cara saya memesan buket impian di sini?",
    answer: "Anda dapat memilih koleksi kami melalui galeri produk atau menggunakan fitur kustomisasi untuk merangkai buket sesuai keinginan. Cukup pilih bunga favorit Anda, tentukan jadwal pengiriman, dan kami akan merangkainya dengan penuh cinta."
  },
  {
    question: "Apakah saya bisa menjadwalkan pengiriman untuk hari istimewa?",
    answer: "Tentu saja. Kami mengerti betapa pentingnya ketepatan waktu untuk momen berharga Anda. Anda bisa menentukan tanggal dan jam pengiriman di halaman pembayaran agar kejutan untuk orang tersayang tiba tepat pada waktunya."
  },
  {
    question: "Bagaimana jika bunga yang saya terima tidak sesuai keinginan?",
    answer: "Kepuasan Anda adalah prioritas utama kami. Jika terdapat ketidaksesuaian pada rangkaian bunga yang diterima, segera hubungi tim layanan pelanggan kami dalam waktu 24 jam dengan melampirkan foto untuk mendapatkan solusi terbaik."
  },
  {
    question: "Dapatkah saya menambahkan pesan pribadi dalam pesanan?",
    answer: "Setiap buket adalah pembawa pesan hati. Kami menyediakan kartu ucapan elegan yang bisa Anda isi dengan kata-kata puitis untuk melengkapi keindahan bunga, menjadikannya kado yang lebih personal dan mendalam."
  },
  {
    question: "Apakah tersedia pengiriman di hari yang sama (Same Day)?",
    answer: "Untuk memastikan kesegaran bunga, kami menyediakan layanan pengiriman di hari yang sama untuk produk tertentu. Pastikan Anda melakukan pemesanan sebelum batas waktu yang ditentukan agar kami memiliki waktu untuk merangkainya dengan sempurna."
  },
  {
    question: "Metode pembayaran apa saja yang tersedia di toko ini?",
    answer: "Kami menyediakan berbagai metode pembayaran yang aman dan mudah, mulai dari transfer bank, kartu kredit, hingga dompet digital. Seluruh transaksi Anda akan terenkripsi dengan aman demi kenyamanan dan keamanan berbelanja Anda."
  },
  {
    question: "Bagaimana cara melacak status pengiriman bunga saya?",
    answer: "Setelah pesanan Anda dikonfirmasi, kami akan mengirimkan tautan pelacakan secara otomatis melalui email atau WhatsApp. Anda bisa memantau perjalanan bunga Anda mulai dari tangan perangkai kami hingga tiba di depan pintu tujuan."
  },
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div>
      <section className="FAQSection">
        <div className="FAQContent">
          <div className="FAQHeader">
            <p className="p2 txt-color-bg-light">Support</p>
            <h1 className="txt-color-primary">FAQs</h1>
            <p className="p1">
              Kami hadir untuk memastikan setiap langkah perjalanan Anda senantiasa nyaman dan penuh kemudahan. 
              Temukan segala jawaban yang Anda butuhkan untuk merayakan setiap momen indah bersama kami.
            </p>
          </div>
          <div className="FAQList">
            {faqs.map((faq, index) => (
              <div key={index} className="FAQItem">
                <div className="FAQQuestion" onClick={() => toggleFAQ(index)}>
                  <p className="p1 txt-color-ternary">{faq.question}</p>
                  <span className={`toggle ${openFAQ === index ? "open" : ""}`}>
                    <img
                      src="https://api.iconify.design/eva/arrow-ios-downward-outline.svg?color=%238a8a8a"
                      alt="arrow"
                    />
                  </span>
                </div>
                {/* The FAQAnswer div is always rendered, but its max-height is controlled by inline style */}
                <div
                  className="FAQAnswer"
                  style={{
                    maxHeight:
                      openFAQ === index
                        ? answerRefs.current[index]?.scrollHeight + "px" ||
                          "200px"
                        : "0px",
                  }}
                >
                  <div
                    ref={(el) => (answerRefs.current[index] = el)}
                    className="FAQAnswerInner"
                  >
                    <p className="p2 txt-color-bg-light">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ContactCustomerServiceSection">
          <div className="ContactCustomerServiceDescription">
            <h1 className="txt-color-primary">Perlu bantuan lebih lanjut?</h1>
            <p className="p1 txt-color-white">
              Sapa kami kapan saja, dan biarkan kami membantu Anda merajut momen istimewa.
            </p>
          </div>
          <button className="button-primary h3">Customer Service</button>
        </div>
      </section>
    </div>
  );
}

export default function Help() {
  return (
    <div className="text-center mt-10">
      <HelpLanding />
      <FAQ />
    </div>
  );
}
