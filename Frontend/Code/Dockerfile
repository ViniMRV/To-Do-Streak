# Frontend/Code/Dockerfile

# Usa o Nginx (servidor web rápido e leve)
FROM nginx:alpine

# Copia a pasta 'public' (onde estão seus HTML/CSS/JS compilados)
# para a pasta padrão do Nginx
COPY public /usr/share/nginx/html

# Expõe a porta 80 (padrão web interna)
EXPOSE 80