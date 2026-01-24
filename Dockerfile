FROM php:8.3-apache

# Установка зависимостей
RUN apt-get update && apt-get install -y \
	libzip-dev \
	zip \
	unzip \
	curl \
	libpng-dev \
	libxml2-dev \
	libonig-dev \
	mariadb-client \
	phpmyadmin \
	jq \
	redis-tools \
	&& docker-php-ext-install pdo pdo_mysql

# Установка Redis и зависимостей к нему
RUN pecl install redis \
	&& docker-php-ext-enable redis

# Установка Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Установка текущей рабочей директории
WORKDIR /var/www/html

# Включение mod_rewrite для apache
RUN a2enmod rewrite

# Копирование проекта в /var/www/html то есть рабочую директорию для apache
COPY ./src /var/www/html
# Права
RUN chown -R www-data:www-data /var/www/html