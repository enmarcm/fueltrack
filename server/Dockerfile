FROM node:20-alpine AS build
RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile

COPY . .
RUN cd server && npx prisma generate
RUN pnpm build --filter server

FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app

COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/prisma ./prisma
COPY --from=build /app/server/package.json ./
COPY --from=build /app/node_modules/.pnpm ./node_modules/.pnpm

RUN pnpm install --prod --frozen-lockfile

EXPOSE 4000

CMD sh -c "npx prisma migrate deploy && node dist/index.js"
