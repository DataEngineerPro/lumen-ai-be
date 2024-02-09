FROM node:20-alpine as builder

WORKDIR /web
COPY ./web/package*.json ./
RUN npm install --force
COPY ./web .
RUN npm run build


# Build the image as production
# So we can minimize the size
FROM node:20-alpine

WORKDIR /app
COPY . .
COPY --from=builder /web/dist ./public
RUN rm -rf ./web
ENV PORT=4000
ENV NODE_ENV=Production
RUN npm install --force
EXPOSE ${PORT}
CMD ["npm", "run", "start"]