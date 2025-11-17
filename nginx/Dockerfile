FROM nginx:alpine

# Copy custom nginx config
COPY nginx/conf/nginx.conf /etc/nginx/nginx.conf

# Copy SSL certs (if present)
COPY nginx/ssl /etc/nginx/ssl

# Copy frontend static files into the default nginx html folder
COPY frontend/public /usr/share/nginx/html/

# Expose http and https ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
