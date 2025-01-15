import PropTypes from 'prop-types';
import WelcomeScreen from '../components/WelcomeScreen';
import StatsBanner from '../components/StatsBanner';
import AboutUs from '../components/AboutUs';
import OurServices from '../components/OurServices'
import Faq from '../components/FAQ';
import Feedback from '../components/Feedback';

const Home = ({ onAuthClick }) => {
  return (
    <>
      <WelcomeScreen onAuthClick={onAuthClick} />
      <StatsBanner/>
      <AboutUs/>
      <OurServices />
      <Faq />
      <Feedback />
    </>
  );
};

Home.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default Home;
