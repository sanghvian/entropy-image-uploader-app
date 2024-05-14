FROM nginx:alpine

# Copy the SSL certificates
COPY ./certs/fullchain.pem /etc/letsencrypt/live/cylab.coursepanel.in/fullchain.pem
COPY ./certs/privkey.pem /etc/letsencrypt/live/cylab.coursepanel.in/privkey.pem

# Copy the custom nginx configuration file
COPY ./nginx.conf /etc/nginx/nginx.conf
