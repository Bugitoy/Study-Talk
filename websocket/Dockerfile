# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose port (update if your server runs on a different port)
EXPOSE 3001

# Start the app
CMD ["npm", "start"]


