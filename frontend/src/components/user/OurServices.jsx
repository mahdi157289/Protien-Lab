import workoutImage from "../../assets/images/home/workout.png";
import dietImage from "../../assets/images/home/diet.png";
import supplementImage from "../../assets/images/home/supplement.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faUtensils, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const OurServices = () => {

  const navigate = useNavigate();

  const services = [
    {
      title: "Workout Plans",
      description: "Personalized routines to help you reach your fitness goals, whether it's strength, endurance, or weight loss",
      buttonText: "Start Workout",
      icon:  <FontAwesomeIcon icon={faDumbbell} />,
      image: workoutImage,
      path: "/workouts",
    },
    {
      title: "Diet Plans",
      description: "Personalized nutrition strategies designed to optimize your fitness progress and overall health",
      buttonText: "Get Diet Plan",
      icon:  <FontAwesomeIcon icon={faUtensils} />,
      image: dietImage,
      path: "/diet-plan",
    },
    {
      title: "Supplement Store",
      description: "Quality supplements that complement your workouts and boost performance towards your goals",
      buttonText: "Shop Now",
      icon: <FontAwesomeIcon icon={faShoppingCart} />,
      image: supplementImage,
      path: "/store",
    }
  ];

  return (
    <div className="w-full px-4 py-12">
      <h1 className="mb-12 text-4xl font-bold text-center md:text-5xl">
        <span>Our </span>
        <span className="text-primary">Services</span>
      </h1>

      <div className="grid grid-cols-1 gap-6 mx-auto md:grid-cols-2 lg:grid-cols-3 max-w-7xl">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col items-center p-2 pb-6 text-center rounded-2xl bg-dark">
            <div className="w-full mb-6 overflow-hidden rounded-lg aspect-video">
              <img
                src={service.image}
                alt={service.title}
                className="object-cover w-full h-full bg-secondary"
              />
            </div>

            <h2 className="mb-4 text-2xl font-bold">
              {service.title}
            </h2>

            <p className="flex-grow mb-6">
              {service.description}
            </p>

            <button className="flex items-center gap-2 px-6 py-2 transition-colors duration-300 border rounded-full border-accent bg-primary hover:border-primary" onClick={() => navigate(service.path)}>
              {service.buttonText}
              <span>{service.icon}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurServices;