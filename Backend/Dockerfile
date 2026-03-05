FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    nginx bash curl icu-dev oniguruma-dev libzip-dev \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    zip unzip postgresql-dev mysql-client

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring zip intl opcache gd

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ✅ Copier TOUT le projet d'abord
COPY . .

# ✅ Ensuite installer les dépendances
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --ignore-platform-reqs \
    --optimize-autoloader

RUN mkdir -p storage/logs \
             storage/framework/cache \
             storage/framework/sessions \
             storage/framework/views \
             bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000
CMD ["/start.sh"]
