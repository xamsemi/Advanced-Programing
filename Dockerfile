FROM nginx:alpine

# Frontend-Dateien kopieren
COPY ./frontend/public/ /usr/share/nginx/html/
# Nginx-Konfiguration kopieren
COPY ./nginx/conf/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80