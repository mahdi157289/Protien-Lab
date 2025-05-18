import { motion } from "framer-motion";
import PropTypes from "prop-types";
import homeImage1 from "../../assets/images/home/home_image.jpg";
import homeImage2 from "../../assets/images/home/workout.png";
import { useState, useEffect } from "react";

const WelcomeScreen = ({ onAuthClick }) => {
  const [bgImage, setBgImage] = useState(homeImage1);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImage((prevImage) => (prevImage === homeImage1 ? homeImage2 : homeImage1));
    }, 5000); // Change background every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative h-screen"
    >
      <motion.div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${bgImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        key={bgImage}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="relative flex flex-col items-center justify-center h-[calc(100vh-72px)] px-4 text-white"
      >
        <h1  className="mb-6 text-3xl font-bold text-center sm:text-4xl md:text-5xl lg:text-6xl md:mb-8">
          Reach Your <span className="text-primary">Fitness</span> Goals
          <br />
          with Confidence
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
          className="max-w-3xl mb-8 text-center md:mb-12"
        >
          <p className="text-base sm:text-lg">Explore customized workout plans and balanced nutrition plans</p>
          <p className="text-base sm:text-lg">Stay motivated by sharing your success on the Victory Wall</p>
          <p className="text-base sm:text-lg">Discover supplements to boost your performance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
          className="flex flex-col gap-4 px-4 sm:w-auto sm:flex-row sm:gap-8 md:gap-16"
        >
          <button
            onClick={() => onAuthClick(true, 'signup')}
            className="px-8 py-2.5 text-base font-semibold transition-all border-2 rounded-full sm:px-10 md:px-12 md:py-3 md:text-lg bg-primary text-accent border-accent hover:border-primary hover:bg-primary hover:text-white"
          >
            Get Started
          </button>
          <button
            className="px-8 py-2.5 text-base font-semibold transition-colors border-2 rounded-full sm:px-10 md:px-12 md:py-3 md:text-lg bg-secondary border-primary text-primary hover:bg-primary hover:text-white"
          >
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

WelcomeScreen.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default WelcomeScreen;