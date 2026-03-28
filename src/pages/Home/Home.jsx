import React from "react";
import HeroPicture from "../../assets/Landing.jpg";
import OurStoryImage from "../../assets/OurStory.jpg";
import CustomizeYourOwnImage from "../../assets/CustomizeYourOwn.jpg";

function HeroSection() {
  return (
    <section className="HeroSection">
      <img src={HeroPicture} alt="Hero Landing" className="HeroPicture" />
      <div className="HeroOverlay">
        <p className="p1 txt-color-white">mengukir kisah melalui bunga</p>
        <h1 className="txt-color-ternary">
          Abadikan perjalanan <span className="txt-color-primary">cinta </span> Anda dalam<br /> <span className="txt-color-primary">buket kami</span>, tempat kenangan hidup selamanya
        </h1>
        <p className="txt-color-bg-dark">
          Setiap kelopak bunga yang kami rangkai menyimpan cerita tentang tawa, janji, dan kasih sayang yang tulus.<br />
          Kami tidak hanya mempersembahkan bunga, tetapi juga merawat memori indah Anda agar tetap mekar dan tak lekang oleh waktu.<br />
          Biarkan keharumannya menjadi saksi bisu setiap momen berharga yang Anda bagi bersama orang tersayang.<br />
        </p>
      </div>
    </section>
  );
}

function OurStorySection() {
  return (
    <div className="OurStorySectionContainer">
      <section className="OurStorySection">
        <div className="OurStoryImageLeft">
          <img src={OurStoryImage} alt="Bouquet" className="OurStoryPicture" />
        </div>
        <div className="OurStoryContent">
          <h2 className="txt-color-ternary weight-semibold">
            “Cerita Tentang Kita”
          </h2>
          <p className="txt-color-bg-dark">
            Berawal dari sebuah rasa, kami menghadirkan rangkaian bunga sebagai bahasa bisu untuk merayakan setiap perjalanan cinta dan babak baru kehidupan Anda. 
            Kami mengukir keindahan dalam detail terkecil, memastikan setiap kisah yang Anda titipkan menjadi kenangan yang takkan pernah layu.
          </p>
          <button className="button-ternary h3">
            <a href="/about" className="h3 txt-color-white txt-decoration-none">
              Tentang Kita
            </a>
          </button>
        </div>
        <div className="OurStoryImageRight">
          <img src={OurStoryImage} alt="Bouquet" className="OurStoryPicture" />
        </div>
      </section>
    </div>
  );
}

function CustomizeYourOwnSection() {
  return (
    <div className="CustomizeYourOwnSectionContainer">
      <section className="CustomizeYourOwnSection">
        <div className="CustomizeImageWrapper">
          <img
            src={CustomizeYourOwnImage}
            alt="Hand holding daisies"
            className="CustomizeImage"
          />
        </div>
        <div className="CustomizeContent">
          <h2 className="txt-color-ternary weight-semibold">
            Sampaikan kasih sayangmu
          </h2>
          <p className="txt-color-bg-dark">
            Biarkan bunga menjadi bahasa bagi setiap rasa yang tak terucap. 
            Pilih setiap tangkainya dengan hati untuk merayakan ketulusan cinta. 
            Rangkai memori indahmu dan biarkan ia mekar dalam genggaman.
          </p>
          <button className="button-primary-fill h3">
            <a href="/shop" className="h3 txt-color-white txt-decoration-none">
              Kreasikan Buket
            </a>
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <div className="HomeContainer">
      <HeroSection />
      <OurStorySection />
      <CustomizeYourOwnSection />
    </div>
  );
}