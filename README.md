# Webinterface

This component let's the user register terms for analyzing. 

## Build and Deploy
* Login to your account to dockerhub: `docker login`
* From the root of this project, build a new docker image with the respective version: `docker build -t tweetsentimentanalysis/webinterface:0.0.1 .`
* Run `docker push tweetsentimentanalysis/webinterface:0.0.1` to deploy to dockerhub

## Get the container
If you do not want to build the container by your own, you may use the following to get the image from DockerHub:
`docker pull tweetsentimentanalysis/webinterface:latest`

## Run the container
After you have built the container, you may run it using the following command: `docker run -e REGISTRAR_URL='http://someUrl.toRegistrar.com' tweetsentimentanalysis/webinterface:0.0.1`
Use the appropriate URL where the registrar component is located.

## Remove built images
In order to clean up, you may want to remove the previously created image and container:

* Run `docker ps -a` in order list created containers.
* Choose the corresponding container id and invoke `docker stop <ID> && docker rm <ID>`
* Run `docker images` to list all created images
* Run `docker rmi <ID>` with the id of the image to remove it
