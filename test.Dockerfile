# Set the base image to Node
FROM node:18-alpine

# Set the working directory in docker
WORKDIR /app

# Copy package.json and package-lock.json into the container at /app
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the current directory contents into the container at /app
COPY . .

# Build the Next.js application
RUN npm run stresstest
