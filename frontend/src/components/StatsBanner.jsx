const StatsBanner = () => {
    const stats = [
      { number: "1000+", label: "Active Members" },
      { number: "30+", label: "Exercises" },
      { number: "120+", label: "Success Stories" },
      { number: "20+", label: "Supplement Products" }
    ];

    return (
      <div className="w-full pt-8 md:pt-16">
        <div className="px-2 py-2 mx-auto rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-full max-w-7xl bg-dark">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 px-2 py-4 rounded-lg sm:px-4 sm:py-6 md:px-6 md:py-8 sm:rounded-xl md:rounded-2xl lg:rounded-full bg-secondary"
              >
                <span className="text-xl font-bold sm:text-2xl md:text-3xl text-primary">{stat.number}</span>
                <span className="text-base sm:text-lg md:text-xl">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

export default StatsBanner;