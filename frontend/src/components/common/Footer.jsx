import ve from '../../assets/images/common/h1_hero.png'
import logo from '../../assets/images/common/Protein-Lab.png'
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer
      className="py-8 text-white bg-black bg-center bg-cover "
      style={{
        backgroundImage: `url(${ve})`,
      }}
    >
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and tagline */}
          <div className="space-y-2">
            <div className="flex items-center">
              <img src={logo} alt="Protein Lab Logo" className=" w-30 max-h-[100px]" />
            </div>
            <p className="text-sm text-gray-400 ml-7">{t('footer_tagline')}</p>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h3 className="mb-4 font-semibold">{t('footer_customer_service')}</h3>
            <ul className="space-y-2">
              {[
                t('footer_dashboard'),
                t('footer_workouts'),
                t('footer_diet_plan'),
                t('footer_supplement_store'),
                t('footer_faq'),
                t('footer_account_login'),
                t('footer_contact_us')
              ].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h3 className="mb-4 font-semibold">{t('footer_about')}</h3>
            <ul className="space-y-2">
              {[t('footer_our_team'), t('footer_careers')].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Exercises and More */}
          <div className="space-y-3">
            <h3 className="mb-4 font-semibold">{t('footer_exercises')}</h3>
            <ul className="space-y-2">
              {[
                t('footer_tutorials'),
                t('footer_instructions'),
                t('footer_victory_wall'),
                t('footer_membership'),
                t('footer_community'),
                t('footer_contact_us')
              ].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section with copyright and social icons */}
        <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t-2 border-gray-800 md:flex-row">
          <div className="text-sm text-gray-400">
            {t('footer_copyright')}
            <a href="#" className="ml-4 hover:text-white"><u>{t('footer_terms')}</u></a>
            <a href="#" className="ml-4 hover:text-white"><u>{t('footer_privacy')}</u></a>
          </div>

          {/* Social Icons */}
          <div className="flex mt-4 space-x-6 md:mt-0">
            {[
              { name: 'Facebook', icon: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' },
              { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              { name: 'YouTube', icon: 'M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z' },
              { name: 'Twitter', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' }
            ].map((social) => (
              <a
                key={social.name}
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
                aria-label={social.name}
              >
                <svg
                  className="w-6 h-6 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={social.icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;