import PropTypes from 'prop-types';

const Home = ({ onAuthClick }) => {
  return (
    <div>
      <h1>Welcome to BodySync</h1>

      {/* Sign Up Button */}
      <button
        onClick={() => onAuthClick(true, 'signup')}  // Changed to pass 'signup' string
        className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded-lg hover:bg-primary hover:text-accent transition-all text-base"
      >
        Sign Up
      </button>
    </div>
  );
};

Home.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default Home;