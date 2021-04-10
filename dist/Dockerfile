FROM node:latest

LABEL appname="DXTS MLM"
LABEL version="1.0.0"
LABEL maintainer="DXTS MLM"

WORKDIR /usr/src/app

ADD ./package.json ./

RUN node -v
RUN npm -v
RUN npm install
RUN chmod a+x ./

RUN npm install -g pm2
COPY . ./

EXPOSE 3000

ENTRYPOINT [ "npm" ]
CMD ["start" ]




