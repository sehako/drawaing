FROM python:latest

COPY . .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

CMD ["python", "-m", "uvicorn", "fastAPI:app", "--reload", "--host", "0.0.0.0", "--port", "8282"]