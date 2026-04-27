---
name: Brand fetch retry + shorter TTL
overview: Implement retry on empty response for brands and shorten cache TTL so empty results expire quickly
todos:
  - id: locate-L-error
    content: Find source of 'L' ReferenceError in home-related components
    status: completed
  - id: fix-L-error
    content: Rename/reorder offending 'L' variable to avoid early access
    status: completed
    dependencies:
      - locate-L-error
  - id: build-verify
    content: Run frontend build to ensure no bundle errors
    status: completed
    dependencies:
      - fix-L-error
  - id: browser-verify
    content: Reload / with browser MCP and confirm no runtime errors/white screen
    status: completed
    dependencies:
      - build-verify
---

# Retry Brands Fetch on Empty + Shorten Cache TTL

## Steps

1) Locate brand fetch logic

- Review `frontend/src/components/user/Products.jsx` where `getCachedData` fetches `/photos/category/Nos Marque`.

2) Add single retry on empty response

- If the filtered `validBrandPhotos` array is empty on the first call, schedule one retry after a short delay (e.g., 1–2 seconds) instead of accepting empty state.

3) Shorten cache TTL for brands

- For this fetch, lower TTL to ~5–10 seconds so transient empty responses expire quickly.

4) Keep UI behavior unchanged

- Preserve skeletons/loading; only adjust fetch/retry/TTL logic. Avoid extra renders or blocking UI.

5) Verify behavior

- Hard refresh Home: ensure brands appear after retry; no long-lived empty cache; Store navigation still works.

## Todos

- add-retry-empty: Add single retry on empty brand response with short delay
- shorten-ttl: Lower brand fetch TTL to ~5–10s to avoid long empty caching
- verify-brands: Test hard-refresh home; ensure brands show after retry and cache recovers