# Set the base image
FROM node:18-alpine

# Set the working directory inside the docker container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code into the container
COPY . .

# Set the environment to development
ENV NODE_ENV development

# Expose the port that Next.js will run on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
