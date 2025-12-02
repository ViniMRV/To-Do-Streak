# Backend/Code/Dockerfile

# Usa uma versão leve do Python
FROM python:3.12-slim

# Evita arquivos temporários de cache
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Define a pasta de trabalho no container
WORKDIR /app

# Copia os requisitos (Mantive o erro de digitação do nome do arquivo para não quebrar)
COPY requiriments.txt /app/

# Instala as dependências
RUN pip install --no-cache-dir -r requiriments.txt

# Copia todo o código para dentro do container
COPY . /app/

# Muda para a pasta onde está o manage.py
WORKDIR /app/todostreak

# Expõe a porta 8000
EXPOSE 8000

# Roda o servidor acessível externamente (0.0.0.0)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]