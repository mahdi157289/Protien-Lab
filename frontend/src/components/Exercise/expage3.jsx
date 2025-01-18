import React, { useState } from 'react';

const ExerciseDetailPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Breadcrumb */}
      <div className="container mx-auto py-6">
        <h1 className="text-white text-4xl font-bold text-center mb-4">
          Shoulder Press Exercises
        </h1>
        <h2 className="text-red-500 text-5xl font-bold text-center mb-8">
          Bent Over Dumbbell Reverse Fly Video Exercise Guide
        </h2>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {isPlaying ? (
                  <iframe
                    src="https://www.youtube.com/embed/Fgz_FdzDukE?autoplay=1"
                    title="Exercise Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <>
                    <img
                      src="/src/assets/images/Exercises/bent-over-rear-delt-raise.jpg"
                      alt="Exercise Video Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                    </button>
                  </>
                )}
              </div>
              <div className="mt-4 flex items-center text-gray-400">
                <span>Bent Over Rear Delt Fly</span>
              </div>
            </div>
          </div>

          {/* Muscle Diagram */}
          <div className="lg:col-span-1">
            <div className="bg-gray rounded-lg p-4">
              <img
                src="/src/assets/images/Exercises/image.png"
                alt="Muscle Diagram"
                style={{ width: '200px', height: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* Exercise Details */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-white text-2xl font-bold mb-4">Exercise Details</h3>
          <div className="text-gray-300">
            <p className="mb-4">
              The bent over dumbbell reverse fly is an isolation exercise that targets the posterior deltoids (rear shoulders). 
              This exercise helps develop shoulder stability and improves overall shoulder definition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailPage;
