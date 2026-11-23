FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++ vips-dev
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache vips
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 1337
CMD ["npm", "start"]
