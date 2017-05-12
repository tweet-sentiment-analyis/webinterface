FROM matriphe/alpine-php:cli

ADD . ./

EXPOSE 8080
ENTRYPOINT [ "php", "-S", "0.0.0.0:8080" ]
