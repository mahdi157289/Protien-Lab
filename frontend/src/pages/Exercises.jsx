import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ExerciseLandingPage from "/src/components/Exercise/expage1.jsx"; // Import Page 1
import ShoulderExercises from "/src/components/Exercise/expage2.jsx"; // Import Page 2
import ExerciseDetailPage from "/src/components/Exercise/expage3.jsx"; // Import Page 3

const Exercises = () => {
  return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* Define routes for each page */}
          <Route path="/" element={<ExerciseLandingPage />} />
          <Route path="shoulder-press" element={<ShoulderExercises />} />
          <Route path="z" element={<ExerciseDetailPage />} />
        </Routes>
      </div>
  );
};

export default Exercises;
