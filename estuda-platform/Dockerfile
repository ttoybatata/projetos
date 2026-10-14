FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY . .

# The frontend and API share one origin in production, so API calls use relative paths.
ENV NODE_ENV=production
ENV VITE_API_URL=""

RUN npx prisma generate && npm run build

EXPOSE 10000

# Apply only committed, versioned migrations before starting the API.
CMD ["sh", "-c", "npm run db:deploy && npm run start"]
