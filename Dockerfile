FROM node:18-bullseye
ARG UID=1000
ARG GID=1000

USER root
RUN npm install --global gulp-cli

USER ${UID}:${GID}

WORKDIR /app/src
CMD ["/bin/bash"]