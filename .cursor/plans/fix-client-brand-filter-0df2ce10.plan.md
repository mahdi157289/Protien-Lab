<!-- 0df2ce10-b8a5-4019-914c-66d181082887 6bf96db9-7182-4f70-ab2d-5b254067eca0 -->
# Media Slider Enhancement Plan

1. Backend Schema & Controller Updates  

- Update `backend/models/Photo.js` to support Media-specific metadata (e.g., `mediaSlot` 1|2 and `slides` array of up to two `{ filename, url }`).  
- Adjust `uploadPhotos` in `backend/controllers/adminPhotoController.js` to expect two separate uploads per Media slot: enforce `mediaSlot` parameter (1 or 2), require exactly two images, store them in the new `slides` array, and overwrite any existing Media entry for that slot.  
- Ensure `getPhotosByCategory` returns Media entries including both slide URLs ordered by `mediaSlot`.

2. Admin UI: Dual Slot Uploads  

- In `frontend/src/components/admin/PhotoManagement.jsx`, when category is Media, render two upload cards (Slot 1 & Slot 2) each with its own file picker limited to 2 images.  
- Track files separately per slot, call the upload endpoint with `category=Media` and `mediaSlot` for the corresponding drop zone, and show validation/errors per slot.  
- Display helpful status (e.g., existing slide previews, “2 images required per slot”).

3. MediaSection Slider Behavior  

- Update `frontend/src/components/user/MediaSection.jsx` to consume the new Media data structure: split into two rectangles (slot 1 & slot 2) each with up to two slide URLs.  
- Implement an auto-sliding effect per rectangle (e.g., `setInterval` toggling slide index every few seconds with fade/translate transitions).  
- Add basic indicators or subtle animations to show the slide transition while preserving full-width, 1.5x-height layout.

4. Wire-up & Testing  

- Ensure `frontend/src/pages/Home.jsx` still renders the updated MediaSection correctly after OurProduct.  
- Manually verify: (a) Admin can upload two slides for each rectangle, (b) Re-upload replaces existing slides, (c) Home page auto-slides between each rectangle’s two images without layout regressions.