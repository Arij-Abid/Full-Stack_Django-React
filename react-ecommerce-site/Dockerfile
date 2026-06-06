
FROM node:20 AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer dépendances
RUN npm ci

# Copier le projet
COPY . .

# Build React/Vite
RUN npm run build

# =========================
# Production Stage
# =========================
FROM nginx:alpine

# Copier build React
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
