# --- Build Stage ---
    FROM node:22-alpine AS builder

    WORKDIR /usr/src/app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    
    RUN npm run build
    
    # --- Production Stage ---
    FROM nginx:stable-alpine
    COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
    # No need for a CMD, nginx starts automatically