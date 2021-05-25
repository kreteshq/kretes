FROM node:16-alpine
WORKDIR /usr/app
RUN mkdir -p dist/tasks
RUN npm install --global pnpm
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./ ./
RUN pnpx kretes build
# TODO investigate `snowpack` as it writes files
RUN chown -R node:node /usr/app
EXPOSE 5544
USER node
CMD [ "npx", "kretes", "start", "--production" ]
