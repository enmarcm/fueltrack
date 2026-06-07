FROM node:20-alpine AS build
RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build --filter client

FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
