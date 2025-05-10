FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Create app directory and health check server
RUN mkdir -p /app && \
    echo 'from flask import Flask; app = Flask(__name__); @app.route("/api/health"); def health(): return {"status": "healthy", "ollama": "running"}; if __name__ == "__main__": app.run(host="0.0.0.0", port=5000)' > /app/health.py

# Install Flask
RUN pip3 install flask

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0:11434
ENV OLLAMA_ORIGINS="*"

# Expose ports
EXPOSE 11434 5000

# Start both services
CMD ollama serve & python3 /app/health.py 