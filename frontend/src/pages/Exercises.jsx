import { Routes, Route } from "react-router-dom";
import ExerciseLandingPage from "/src/components/Exercise/ExerciseLandingPage.jsx";
import CategoryExercises from "/src/components/Exercise/CategoryExercisesPage.jsx";
import ExerciseDetailPage from "/src/components/Exercise/ExerciseDetails.jsx";

const Exercises = () => {
  return (
      <div className="min-h-screen text-white">
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
