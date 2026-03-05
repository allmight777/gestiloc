#!/bin/bash
set -e
echo "=== Starting Gestiloc Backend ==="
cd /var/www/html

# Optimisation du cache pour la prod
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ✅ Migrations (force car on est en prod)
php artisan migrate --force || echo "⚠️ Migration warning - continuing anyway"

# ✅ SEEDING : On remplit les tables de rôles/permissions (Indispensable pour l'inscription)
php artisan db:seed --force || echo "⚠️ Seeding warning - continuing anyway"

# Lancement des services (PHP-FPM et Nginx)
php-fpm -D
echo "=== Starting Nginx on port 10000 ==="
nginx -g "daemon off;"
