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
	npm \
	nano \
	gcc \
	sudo \
	wget \
	redis-server \
	&& docker-php-ext-install pdo pdo_mysql

# Установка Redis и зависимостей к нему
#RUN pecl install redis \
#	&& docker-php-ext-enable redis

RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Установка текущей рабочей директории
WORKDIR /var/www/html

# Включение mod_rewrite для apache
RUN a2enmod rewrite

# Копирование проекта в /var/www/html то есть рабочую директорию для apache
COPY ./src /var/www/html

#RUN mkdir /var/www/html/api/logs
# Права
RUN chown -R www-data:www-data /var/www/html

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

RUN composer require

RUN echo "www-data ALL=(ALL) NOPASSWD: /usr/bin/nmap" >> /etc/sudoers

# Разрешение использование .htaccess в директории /var/www/html
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

#RUN php imoui.php

