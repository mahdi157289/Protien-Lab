import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

// Import your brand images here
import brand1 from "../../assets/images/brands/brand1.png";
import brand2 from "../../assets/images/brands/brand2.png";
import brand3 from "../../assets/images/brands/brand3.png";
import brand4 from "../../assets/images/brands/brand4.png";
import brand5 from "../../assets/images/brands/brand5.png";
// Add more as needed

const brandImages = [
  { src: brand1, alt: "Brand 1" },
  { src: brand2, alt: "Brand 2" },
  { src: brand3, alt: "Brand 3" },
  { src: brand4, alt: "Brand 4" },
  { src: brand5, alt: "Brand 5" },
  // Add more as needed
];

const Products = () => {
  const { t } = useTranslation();

  // Duplicate the array for seamless infinite scroll
  const images = [...brandImages, ...brandImages];

  return (
    <div className="w-full px-4 py-12 overflow-hidden relative">
      <h1 className="mb-12 text-4xl font-bold text-center md:text-5xl">
        <span>{t("our") + " "}</span>
        <span className="text-primary">{t("brands")}</span>
      </h1>

      {/* Smooth Horizontal Brand Scroll */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-12"
          style={{ width: `${images.length * 220}px` }}
          initial={{ x: 0 }}
          animate={{ x: `-${(brandImages.length) * 220}px` }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {images.map((brand, idx) => (
            <div key={idx} className="flex items-center justify-center min-w-[200px] h-32 bg-dark rounded-xl shadow-lg">
              <img
                src={brand.src}
                alt={brand.alt}
                className="object-contain h-24 w-auto mx-auto"
                draggable={false}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Products;