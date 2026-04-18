FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG API_PROXY_TARGET=http://backend:4000
ENV API_PROXY_TARGET=$API_PROXY_TARGET

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
