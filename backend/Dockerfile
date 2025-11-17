FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . ./

# Expose port used by the backend
EXPOSE 3000

# Default command
CMD ["npm", "start"]
