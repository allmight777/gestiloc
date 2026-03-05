#!/bin/bash
set -e
echo "=== Starting Gestiloc Backend ==="
cd /var/www/html

php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrations avec || true pour ne pas bloquer si erreur
php artisan migrate --force || echo "⚠️ Migration warning - continuing anyway"

php-fpm -D
echo "=== Starting Nginx on port 10000 ==="
nginx -g "daemon off;"
