FROM node:alpine
WORKDIR /usr/app
RUN mkdir -p dist/tasks
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node
RUN npm install --global pm2
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./ ./
RUN pnpx kretes build
EXPOSE 5544
USER node
CMD [ "pm2-runtime", "npm", "--", "start" ]
