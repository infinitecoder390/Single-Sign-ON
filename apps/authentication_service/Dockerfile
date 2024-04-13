FROM node:18-bullseye

# Create app directory, this is in our container/in our image
WORKDIR /user/src/app
# MOUNT ../../package.json ./
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json /user/src/app
ENV MONGO_URI=mongodb://ssodb_db_user:ssodb_db_pass@172.17.0.1:27017/sso
ENV GIGA_PROFILE_ENDPOINT=http://localhost:3006
# If you are building your code for production
# RUN npm ci --only=production


RUN npm install --legacy-peer-deps

# Bundle app source
COPY . .

RUN npm run build:dev authentication_service

EXPOSE 3000 4000
CMD [ "node", "dist/apps/authentication_service/main" ]