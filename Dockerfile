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
	jq \
	redis-tools \
	iproute2 \
	iputils-ping \
	net-tools \
	nmap \
	traceroute \
	&& docker-php-ext-install pdo pdo_mysql

# Установка Redis и зависимостей к нему
RUN pecl install redis \
	&& docker-php-ext-enable redis

# Установка текущей рабочей директории
WORKDIR /var/www/html

# Включение mod_rewrite для apache
RUN a2enmod rewrite

# Копирование проекта в /var/www/html то есть рабочую директорию для apache
COPY ./src /var/www/html
# Права
RUN chown -R www-data:www-data /var/www/html

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
