FROM node:latest
EXPOSE 8088 27017
ENV PORT=8088
ENV NODE_ENV="production"
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install --production
CMD ["node", "bin/www"]
