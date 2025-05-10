FROM node:18-slim

# Install Ollama
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set up working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose ports for both Node.js and Ollama
EXPOSE 5000 11434

# Start both services
CMD ollama serve & npm start 