#!/bin/bash
set -e
echo "=== Starting Gestiloc Backend ==="
cd /var/www/html
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php-fpm -D
echo "=== Starting Nginx on port 10000 ==="
nginx -g "daemon off;"
