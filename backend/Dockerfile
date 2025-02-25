FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy dependencies and install
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy app files
COPY . .

# Expose the port Flask runs on
EXPOSE 6000

# Run Flask in development mode and listen on all network interfaces
CMD ["flask", "run", "--host=0.0.0.0", "--port=6000"]
