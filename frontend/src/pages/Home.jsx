import PropTypes from 'prop-types';
import WelcomeScreen from '../components/user/WelcomeScreen';
import StatsBanner from '../components/user/StatsBanner';
import AboutUs from '../components/user/AboutUs';
import OurServices from '../components/user/OurServices'
import Faq from '../components/user/FAQ';
import Feedback from '../components/user/Feedback';

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
