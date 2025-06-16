import workoutImage from "../../assets/images/home/workout.png";
import dietImage from "../../assets/images/home/diet.png";
import supplementImage from "../../assets/images/home/Supplement.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faUtensils, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const OurServices = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const services = [
    {
      title: t("workout_plans_title"),
      description: t("workout_plans_desc"),
      buttonText: t("workout_plans_btn"),
      icon: <FontAwesomeIcon icon={faDumbbell} />,
      image: workoutImage,
      path: "/workouts",
    },
    {
      title: t("diet_plans_title"),
      description: t("diet_plans_desc"),
      buttonText: t("diet_plans_btn"),
      icon: <FontAwesomeIcon icon={faUtensils} />,
      image: dietImage,
      path: "/diet-plan",
    },
    {
      title: t("supplement_store_title"),
      description: t("supplement_store_desc"),
      buttonText: t("supplement_store_btn"),
      icon: <FontAwesomeIcon icon={faShoppingCart} />,
      image: supplementImage,
      path: "/store",
    }
  ];

  return (
    <div className="w-full px-4 py-12">
      <h1 className="mb-12 text-4xl font-bold text-center md:text-5xl">
        <span>{t("our") + " "}</span>
        <span className="text-primary">{t("services")}</span>
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