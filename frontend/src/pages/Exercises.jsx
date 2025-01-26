import { Routes, Route } from "react-router-dom";
import ExerciseLandingPage from "/src/components/Exercise/ExerciseLandingPage.jsx"; // Import Page 1
import CategoryExercises from "/src/components/Exercise/CategoryExercisesPage.jsx"; // Import Page 2
import ExerciseDetailPage from "/src/components/Exercise/ExerciseDetails.jsx"; // Import Page 3

const Exercises = () => {
  return (
      <div className="min-h-screen text-white bg-gray-900">
        <Routes>
          {/* Define routes for each page */}
          <Route path="" element={<ExerciseLandingPage />} />
          <Route path="category/:category" element={<CategoryExercises />} />
          <Route path=":id" element={<ExerciseDetailPage />} />
        </Routes>
      </div>
  );
};

export default Exercises;
