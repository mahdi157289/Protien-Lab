---
name: Remove Exercise Functionality
overview: ""
todos:
  - id: da13f094-ee4f-42f2-919f-e1f182d84772
    content: Update createExercise route to spread the middleware array using ... operator
    status: pending
  - id: ccb9e3e2-77ed-499d-8baa-47d3b7884d6e
    content: Update updateExercise route to spread the middleware array using ... operator
    status: pending
---

# Remove Exercise Functionality

## Overview

Remove all exercise-related features from the application, including admin and user pages, routes, navigation items, and the Workout Plans card from the Our Services section.

## Files to Modify

### Frontend - Routes

1. **`frontend/src/routes/AdminRoutes.jsx`**

- Remove import: `import AdminExercises from '../components/admin/AdminExercises';`
- Remove route: `<Route path="exercises" element={<AdminProtectedRoute><AdminExercises /></AdminProtectedRoute>}/>`

2. **`frontend/src/routes/UserRoutes.jsx`**

- Remove import: `import Exercises from '../pages/Exercises';`
- Remove route: `<Route path="/exercises/*" element={<Exercises />} />`

### Frontend - Navigation

3. **`frontend/src/components/common/AdminNavbar.jsx`**

- Remove from `navItems` array: `{ label: t('admin_exercises'), path: '/admin/exercises' }`

4. **`frontend/src/components/common/UserNavbar.jsx`**

- Remove from `navItems` array: `{ label: t('user_exercises'), path: '/exercises' }` (appears in both logged-in and logged-out arrays)

### Frontend - Our Services

5. **`frontend/src/components/user/OurServices.jsx`**

- Remove the Workout Plans service object from the `services` array (the first item with `path: "/workouts"`)

### Backend - Routes (Optional Cleanup)

6. **`backend/routes/adminRoutes.js`**

- Remove exercise controller import: `const exerciseController = require('../controllers/adminExerciseController');`
- Remove all exercise routes (lines 57-62)

7. **`backend/routes/userRoutes.js`** (if exists)

- Remove any exercise-related routes

## Files to Delete (Optional)

- `frontend/src/components/admin/AdminExercises.jsx`
- `frontend/src/pages/Exercises.jsx`
- `frontend/src/components/Exercise/ExerciseLandingPage.jsx`
- `frontend/src/components/Exercise/CategoryExercisesPage.jsx`
- `frontend/src/components/Exercise/ExerciseDetails.jsx`

## Implementation Steps

1. Remove exercise routes from AdminRoutes.jsx
2. Remove exercise routes from UserRoutes.jsx
3. Remove exercise navigation items from AdminNavbar.jsx
4. Remove exercise navigation items from UserNavbar.jsx
5. Remove Workout Plans card from OurServices.jsx
6. (Optional) Remove exercise routes from backend adminRoutes.js
7. (Optional) Delete exercise component files

## Notes

- The Workout Plans card in OurServices currently links to `/workouts`, which is different from `/exercises`. We're removing the Workout Plans card as requested.
- Backend cleanup is optional but recommended for code cleanliness.
- Translation keys for exercises can remain in i18n files (they won't cause issues if unused).