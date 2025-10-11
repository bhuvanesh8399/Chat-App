# frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./

COPY index.html .
COPY vite.config.js .
# COPY postcss.config.cjs OR postcss.config.js depending on your repo
COPY postcss.config.cjs .
COPY tailwind.config.cjs .

RUN npm ci --legacy-peer-deps

COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
