FROM node:20-alpine
RUN apk add --no-cache nginx && mkdir -p /etc/nginx/http.d
RUN npm install -g pnpm prisma

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN pnpm install --frozen-lockfile

COPY . .

RUN cd server && npx prisma generate

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

RUN pnpm install --prod --frozen-lockfile

COPY nginx/default.conf /etc/nginx/http.d/default.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80 8081

CMD ["/start.sh"]
