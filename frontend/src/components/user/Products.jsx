import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import workoutImage from "../../assets/images/home/workout.png";
import dietImage from "../../assets/images/home/diet.png";
import supplementImage from "../../assets/images/home/Supplement.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faUtensils, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const services = [
  {
    title: "Workout Plans",
    description: "Personalized routines to help you reach your fitness goals.",
    buttonText: "Start Workout",
    icon: <FontAwesomeIcon icon={faDumbbell} />,
    image: workoutImage,
    path: "/workouts",
  },
  {
    title: "Diet Plans",
    description: "Optimized nutrition strategies for better health.",
    buttonText: "Get Diet Plan",
    icon: <FontAwesomeIcon icon={faUtensils} />,
    image: dietImage,
    path: "/diet-plan",
  },
  {
    title: "Supplement Store",
    description: "High-quality supplements to complement your workouts.",
    buttonText: "Shop Now",
    icon: <FontAwesomeIcon icon={faShoppingCart} />,
    image: supplementImage,
    path: "/store",
  },
];

const OurServices = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-12 overflow-hidden relative">
      <h1 className="mb-12 text-4xl font-bold text-center md:text-5xl">
        <span>Our </span>
        <span className="text-primary">BRANDS</span>
      </h1>

      {/* Smooth Horizontal Scroll */}
      <div className="w-full overflow-hidden">
        <motion.div
          className="flex gap-6"
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        >
          {services.map((service, index) => (
            <div key={index} className="flex flex-col items-center p-4 pb-6 text-center rounded-2xl bg-dark min-w-[300px]">
              <div className="w-full mb-6 overflow-hidden rounded-lg aspect-video">
                <img src={service.image} alt={service.title} className="object-cover w-full h-full bg-secondary" />
              </div>
              <h2 className="mb-4 text-2xl font-bold">{service.title}</h2>
              <p className="flex-grow mb-6">{service.description}</p>
              <button
                className="flex items-center gap-2 px-6 py-2 transition-colors duration-300 border rounded-full border-accent bg-primary hover:border-primary"
                onClick={() => navigate(service.path)}
              >
                {service.buttonText} <span>{service.icon}</span>
              </button>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default OurServices;