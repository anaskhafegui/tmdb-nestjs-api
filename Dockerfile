FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_OPTIONS="--require crypto"
CMD ["node", "dist/main.js"]
