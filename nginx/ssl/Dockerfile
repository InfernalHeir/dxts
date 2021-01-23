FROM nginx:latest

LABEL nginx_proxy_version="1.0.0"
LABEL nginx_proxy_image="latest tag"
LABEL maintainer="DXTS MLM"

WORKDIR /etc/nginx


ADD ./ssl ./
ADD ./domain/dxts.conf ./conf.d/

RUN nginx -t
EXPOSE 443

CMD [ "nginx","-c","/etc/nginx/nginx.conf" ]


