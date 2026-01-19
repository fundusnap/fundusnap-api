FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lock* /app/
RUN bun install --frozen-lockfile
COPY . /app
CMD ["bun", "app/index.js"]
