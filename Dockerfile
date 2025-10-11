# Stage 1: Build the React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY tailwind.config.js postcss.config.js vite.config.js ./
COPY .env .env
COPY .env.development .env.development
RUN npm install
COPY src ./src
COPY public ./public
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
