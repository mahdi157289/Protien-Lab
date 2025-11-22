import PropTypes from 'prop-types';
import WelcomeScreen from '../components/user/WelcomeScreen';
import StatsBanner from '../components/user/StatsBanner';
import BestOffers from '../components/user/BestOffers';
import AboutUs from '../components/user/AboutUs';
import OurServices from '../components/user/OurServices'
import Faq from '../components/user/Faq';
import Feedback from '../components/user/Feedback';
import Products from '../components/user/Products';
import NosPack from '../components/user/NosPack';
import OurProduct from '../components/user/OurProduct';
import MediaSection from '../components/user/MediaSection';
const Home = ({ onAuthClick }) => {
  return (
    <>
      <WelcomeScreen onAuthClick={onAuthClick} />
      <BestOffers />
      <NosPack />
      <OurProduct />
      <MediaSection />
      <Products />
      <OurServices />
      <StatsBanner/>
      <AboutUs/>
      <Faq />
      <Feedback />
    </>
  );
};

Home.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default Home;
