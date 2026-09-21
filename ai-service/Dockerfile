FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

EXPOSE 4100

ENV NODE_ENV=production
ENV PORT=4100

CMD ["node", "src/server.js"]
