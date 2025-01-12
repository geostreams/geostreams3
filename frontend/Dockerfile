FROM node:20.15-alpine as build

WORKDIR /app

COPY package.json .

# Install dependencies
RUN npm install

COPY . .

# Build the frontend
RUN npm run build

# Production image
FROM nginx:alpine

# Copy the build output to the Nginx server directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
