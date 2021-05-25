FROM node:16-alpine
WORKDIR /usr/app
RUN mkdir -p dist/tasks
RUN npm install --global pnpm
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./ ./
RUN pnpx kretes build
EXPOSE 5544
USER node
CMD [ "npx", "kretes", "start", "--production" ]
