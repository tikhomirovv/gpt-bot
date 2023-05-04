# Use the official Node.js image as the base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy the package files and install the dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the source code
COPY . .

# Build the TypeScript code
RUN yarn build

# Expose the port on which the app will run
EXPOSE 3000

# Start the app
CMD ["yarn", "start"]