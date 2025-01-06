import aboutImage from "../assets/images/home/about.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      <div className="px-4 py-8 mx-auto max-w-7xl md:py-16">
        <h1 className="mb-8 text-5xl font-bold text-center md:mb-16 md:text-6xl lg:text-7xl">
          <span className="text-red-500">About</span>{' '}
          <span>Us</span>
        </h1>

        <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden">
            <img
              src={aboutImage}
              alt="Modern gym interior"
              className="object-cover w-full h-full"
            />
          </div>

          <div className="space-y-6 lg:pl-8">
            <div>
              <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                Welcome to{' '}
                <span className="text-primary">BodySync</span>
              </h2>
              <p>
                Your ultimate destination for fitness and nutrition harmony.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-xl font-bold md:text-2xl">
                Our Mission
              </h3>
              <p className="mb-6 text-justify">
                Integrate fitness and nutrition into a personalized approach that empowers
                individuals to achieve their health goals. We provide tailored workout
                plans, balanced diet guidance, a supplement store, and a supportive
                platform through our Victory Wall to celebrate progress and inspire growth.
                BodySync is dedicated to fostering a healthier, more balanced lifestyle for
                every user.
              </p>
            </div>

            <div>
              <p className="text-justify">
                We offer a comprehensive health solution that combines fitness and
                nutrition in one easy-to-use platform. Our personalized workout plans, diet
                guidance, and supplement store are designed to meet your unique goals.
                The Victory Wall celebrates your progress, allowing you to share
                milestones and inspire others within our supportive community. We provide
                expert-designed tools and resources to ensure that your wellness journey
                is reliable and effective.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;