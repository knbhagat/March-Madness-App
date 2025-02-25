FROM python:3.9-slim

WORKDIR /app

# Copy the application code
COPY . .

# Expose the port Flask runs on
EXPOSE 6000

# Install dependencies and run Flask when the container starts
CMD pip install -r requirements.txt && flask run --host=0.0.0.0 --port=6000
