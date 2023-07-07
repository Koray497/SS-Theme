FROM python:3.9

WORKDIR /app

RUN apt-get update && apt-get install -y \
  libsasl2-dev libldap2-dev libssl-dev

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY .env .env

COPY . .

CMD ["python", "app.py"]
