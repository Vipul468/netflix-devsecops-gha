# Static Netflix app - serve with nginx
FROM nginx:1.27-alpine
COPY index.html app.js style.css /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
