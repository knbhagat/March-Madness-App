# Use a Node.js base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy the application code
COPY . .

# Expose the Vite dev server port
EXPOSE 2000

# Install dependencies and start the development server when the container starts
CMD npm install && npm run dev -- --host 0.0.0.0
