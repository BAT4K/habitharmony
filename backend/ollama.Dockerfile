FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Create app directory and health check server
RUN mkdir -p /app && \
    echo 'from flask import Flask\n\
import requests\n\
import os\n\
\n\
app = Flask(__name__)\n\
\n\
@app.route("/api/health")\n\
def health():\n\
    try:\n\
        # Check if Ollama is running\n\
        ollama_url = os.getenv("OLLAMA_URL", "http://0.0.0.0:11434")\n\
        response = requests.get(f"{ollama_url}/api/tags")\n\
        ollama_status = "running" if response.ok else "error"\n\
        \n\
        return {\n\
            "status": "healthy",\n\
            "ollama": ollama_status,\n\
            "timestamp": __import__("datetime").datetime.now().isoformat()\n\
        }\n\
    except Exception as e:\n\
        return {\n\
            "status": "unhealthy",\n\
            "ollama": "error",\n\
            "error": str(e),\n\
            "timestamp": __import__("datetime").datetime.now().isoformat()\n\
        }, 503\n\
\n\
if __name__ == "__main__":\n\
    app.run(host="0.0.0.0", port=5000)' > /app/health.py

# Install Flask and requests
RUN pip3 install flask requests

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0:11434
ENV OLLAMA_ORIGINS="*"
ENV OLLAMA_URL="http://0.0.0.0:11434"

# Create startup script
RUN echo '#!/bin/bash\n\
\n\
# Function to check if Ollama is ready\n\
wait_for_ollama() {\n\
    echo "Waiting for Ollama to be ready..."\n\
    for i in {1..30}; do\n\
        if nc -z 0.0.0.0 11434; then\n\
            echo "Ollama is ready!"\n\
            return 0\n\
        fi\n\
        echo "Attempt $i: Ollama not ready yet..."\n\
        sleep 2\n\
    done\n\
    echo "Ollama failed to start"\n\
    return 1\n\
}\n\
\n\
# Start Ollama in the background\n\
ollama serve &\n\
\n\
# Wait for Ollama to be ready\n\
if ! wait_for_ollama; then\n\
    echo "Failed to start Ollama"\n\
    exit 1\n\
fi\n\
\n\
# Start the health check server\n\
python3 /app/health.py' > /app/start.sh && \
    chmod +x /app/start.sh

# Expose ports
EXPOSE 11434 5000

# Use the startup script
CMD ["/app/start.sh"] 