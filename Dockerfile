FROM node:16-alpine as compiler
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

FROM node:16-alpine as runner
WORKDIR /app
COPY --from=compiler /app/package*.json ./
COPY --from=compiler /app/dist ./
RUN npm install --only=production
USER 1000
CMD ["npm", "run", "start:docker"]