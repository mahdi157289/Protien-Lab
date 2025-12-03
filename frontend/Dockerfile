# Build stage
FROM node:22 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Accept build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_IMAGE_URL
ENV VITE_IMAGE_URL=$VITE_IMAGE_URL

RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy build files to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
