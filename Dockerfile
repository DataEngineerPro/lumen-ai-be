FROM node:14-alpine as builder

WORKDIR /web
COPY ./web/package*.json ./
RUN npm install
COPY ./web .
RUN npm run build


# Build the image as production
# So we can minimize the size
FROM node:14-alpine 

WORKDIR /app
COPY . .
COPY --from=builder /web/dist ./public
RUN rm -rf ./web
ENV PORT=4000
ENV NODE_ENV=Production
RUN npm install
EXPOSE ${PORT}
CMD ["npm", "run", "start"]