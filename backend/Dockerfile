FROM python:3.9

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the .env file
COPY .env .env

COPY . .

CMD ["python", "app.py"]
