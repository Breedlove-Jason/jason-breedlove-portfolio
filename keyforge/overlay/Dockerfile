FROM node:26-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . .
RUN HUSKY=0 npm ci && npm run compile && npm run build
RUN mkdir -p /data && chown node:node /data
ENV NODE_ENV=production DATA_DIR=/data DATABASE_CLIENT=sqlite DATABASE_FILENAME=/data/database.sqlite
EXPOSE 3000 3001
USER node
CMD ["npm", "run", "start:production"]
