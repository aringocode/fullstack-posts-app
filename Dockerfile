# Use Linux image Alpine with node version 14
FROM node:19.5.0-alpine

# Specify our working directory
WORKDIR /app

# Copy package.json and package-lock.json inside the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining application into the container
COPY . .

# Installing Prisma
RUN npm install -g prisma

# Generate Prisma client
RUN prisma generate

# Copy Prisma schema and database URL into the container
COPY prisma/schema.prisma ./prisma/

# Open port 3000 in our container
EXPOSE 3000

# Start the server
CMD [ "npm", "start" ]
