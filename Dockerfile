FROM node:18
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE 8080
CMD [ “npm” , ”server.js” ]
