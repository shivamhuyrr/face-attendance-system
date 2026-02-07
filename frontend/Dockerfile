# Build Stage
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json .
# COPY package-lock.json . # Uncomment if exists
RUN npm install

# Copy source
COPY . .

# Build for production
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
