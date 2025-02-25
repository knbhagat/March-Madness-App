# Use a Node.js base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy dependencies and install
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app’s source code
COPY . .

# Expose the Vite dev server port
EXPOSE 2000

# Run the Vite development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
