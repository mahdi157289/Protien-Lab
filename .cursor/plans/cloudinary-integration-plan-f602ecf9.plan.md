<!-- f602ecf9-28dc-4455-bfeb-01ed81fdfb0a 2b69ac3f-83f3-4d16-936f-4fe90631c54a -->
# Configure nginx for React Router SPA Routing

## Problem

React Router routes (like `/admin/login`) return 404 in production because nginx doesn't know to serve `index.html` for client-side routes.

## Solution

Add nginx configuration that serves `index.html` for all routes that don't match actual files.

## Implementation Steps

### 1. Create nginx configuration file

**File:** `frontend/nginx.conf` (new file)

Create a new nginx configuration file with:

- SPA routing support using `try_files $uri $uri/ /index.html;`
- Gzip compression for better performance
- Static asset caching
- Security headers

Key configuration:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. Update Dockerfile to use nginx config

**File:** `frontend/Dockerfile`

Add line after copying build files:

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

This replaces nginx's default configuration with our SPA-friendly config.

## Files to Create/Modify

1. **Create:** `frontend/nginx.conf` - Complete nginx server configuration
2. **Modify:** `frontend/Dockerfile` - Add COPY command for nginx.conf

## Expected Outcome

After deployment:

- `/admin/login` will work correctly
- All React Router routes will function properly
- Static assets will be cached for performance
- Security headers will be added

## Testing

After deployment, verify:

- `https://proteinlab.tn/admin/login` loads without 404
- Other routes like `/admin/dashboard`, `/store`, etc. work correctly