FROM node:alpine
WORKDIR /usr/app
RUN mkdir -p dist/tasks
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./ ./
RUN pnpx kretes build
EXPOSE 5544
USER node
CMD [ "pnpx", "kretes", "start", "--production" ]
