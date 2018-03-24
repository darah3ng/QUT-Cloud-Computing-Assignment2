#######################################################
# Dockerfile to build Cloud Mashup containers
# Based on Arch
#######################################################

# Set the base image to Arch with Node installed.
FROM node:boron

# File Author / Maintainer
MAINTAINER James Flannery

# Copy app source
COPY . /src

# Set work directory to /src
WORKDIR /src

# Install app dependencies
RUN npm install

# Expose port to outside world
EXPOSE 3000

# Start command as per package.json
CMD ["npm", "start"]


