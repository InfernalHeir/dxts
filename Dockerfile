FROM node:latest

LABEL appname="DXTS MLM"
LABEL version="1.0.0"
LABEL maintainer="DXTS MLM"

WORKDIR /usr/src/app

ADD ./package.json ./
ADD ./package-lock.json ./

RUN node -v \
    npm -v \
    npm install \
    chmod a+x ./ \
    npm install pm2 -g

COPY . ./

EXPOSE 3000

CMD [ "npm","start" ]




