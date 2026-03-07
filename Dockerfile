FROM node:18-alpine
WORKDIR /app
COPY engine/package*.json ./engine/
RUN cd engine && npm ci
COPY . .
ENV DS_REPO_PATH=/app/Simple
EXPOSE 3000
CMD ["node", "engine/src/server.js"]
