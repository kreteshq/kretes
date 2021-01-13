FROM node:alpine
WORKDIR /usr/app
RUN mkdir -p dist/tasks
RUN npm install --global pm2
RUN npm install --global pnpm
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./ ./
RUN pnpx kretes build
EXPOSE 5544
USER node
CMD [ "pm2-runtime", "npm", "--", "start" ]
