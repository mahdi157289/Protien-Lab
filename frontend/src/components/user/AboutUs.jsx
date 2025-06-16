import aboutImage from "../../assets/images/home/about.jpg";
import { useTranslation, Trans } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Orbitron', sans-serif" }} >
      <div className="px-4 py-8 mx-auto max-w-7xl md:py-16">
        <h1 className="mb-8 text-5xl font-bold text-center md:mb-16 md:text-6xl lg:text-7xl">
          <span className="text-primary">{t("about")}</span>{' '}
          <span>{t("us")}</span>
        </h1>

        <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden">
            <img
              src={aboutImage}
              alt={t("about_image_alt")}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="space-y-6 lg:pl-8">
            <div >
              <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                {t("welcome_to")}{" "}
                <span className="text-primary tracking-widest">{t("protein_lab")}</span>
              </h2>
              <p>
                {t("about_intro")}
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-xl font-bold md:text-2xl">
                {t("our_mission")}
              </h3>
              <p className="mb-6 text-justify">
                {t("about_mission")}
              </p>
            </div>

            <div>
              <p className="text-justify">
                {t("about_details")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;