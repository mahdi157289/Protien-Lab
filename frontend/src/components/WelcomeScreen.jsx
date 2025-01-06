import PropTypes from "prop-types";
import homeImage from "../assets/home_image.jpg";

const WelcomeScreen = ({ onAuthClick }) => {
  return (
    <div className="relative h-screen">
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${homeImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center h-[calc(100vh-72px)] px-4 text-white">
        <h1 className="mb-6 text-3xl font-bold text-center sm:text-4xl md:text-5xl lg:text-6xl md:mb-8">
          Reach Your <span className="text-primary">Fitness</span> Goals
          <br />
          with Confidence
        </h1>

        <div className="max-w-3xl mb-8 text-center md:mb-12">
          <p className="text-base sm:text-lg">
            Explore customized workout plans and balanced nutrition plans
          </p>
          <p className="text-base sm:text-lg">
            Stay motivated by sharing your success on the Victory Wall
          </p>
          <p className="text-base sm:text-lg">
            Discover supplements to boost your performance
          </p>
        </div>

        <div className="flex flex-col gap-4 px-4 sm:w-auto sm:flex-row sm:gap-8 md:gap-16">
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
        </div>
      </div>
    </div>
  );
};

WelcomeScreen.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default WelcomeScreen;