<!-- 0df2ce10-b8a5-4019-914c-66d181082887 73b80218-4118-4994-a018-2519370afaaa -->
# Fix Exercise Routes Array Spreading

## Problem

The exercise routes are failing with 500 errors because `createExercise` and `updateExercise` are exported as arrays of middleware `[multerMiddleware, handler]`, but the routes are using them directly without spreading. Express router requires arrays to be spread using the `...` operator.

## Solution

Update the route definitions in `backend/routes/adminRoutes.js` to spread the middleware arrays for both `createExercise` and `updateExercise`.

## Implementation Steps

### 1. Fix createExercise route (line 58)

- Change from: `router.post('/exercises', adminAuth, exerciseController.createExercise);`
- Change to: `router.post('/exercises', adminAuth, ...exerciseController.createExercise);`
- This spreads the array so Express treats each element as separate middleware

### 2. Fix updateExercise route (line 61)

- Change from: `router.put('/exercises/:id', adminAuth, exerciseController.updateExercise);`
- Change to: `router.put('/exercises/:id', adminAuth, ...exerciseController.updateExercise);`
- Same fix for the update route

## Files to Modify

- `backend/routes/adminRoutes.js` (lines 58 and 61)

## Expected Result

After this fix, the exercise creation and update endpoints should work correctly because Express will properly execute the multer middleware first, then the handler function.

### To-dos

- [ ] Update createExercise route to spread the middleware array using ... operator
- [ ] Update updateExercise route to spread the middleware array using ... operator