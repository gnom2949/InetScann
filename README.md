# InetScan/ Internet Scanner
InetScann is a network utility with a web interface and API based on willdurand/Nmap wrapper, written in PHP.

### How to Start

**We have 2 methods**

#### First method, Start compiled docker image

1st: install [docker](https://docs.docker.com/engine/install/)

2nd: Start the image
```bash
docker *****
```
3rd: Go to your browser and type this url
```url
http://127.0.0.1
```

#### Second method, local with apache
I testing it on cachyOS where package named `apache`, on debian-based distros in apt he named as `apache2`

1st: Install Dependencies.
arch-based distros
```bash
# installing deps
 sudo pacman -S httpd php composer redis mariadb bun

# Starting mariadb, apache and redis
sudo systemctl enable mariadb && sudo systemctl start mariadb
sudo systemctl enable httpd && sudo systemctl start httpd
sudo systemctl enable redis && sudo systemctl start redis

# setting up the apache
sudo vim /etc/httpd/conf/httpd.conf
# or nano
sudo nano /etc/httpd/conf/httpd.conf

#change these strings
DocumentRoot ""
# to
DocumentRoot "/var/www/html"
#and
<Directory "/var/www/html">

# By default, the Apache configuration file in the Directory section grants full access, but if your configuration file has
# a value set to something other than "Require all granted", then change that value to "Require all granted"

#create a dir in /var/www
sudo mkdir -p /var/www/html

# and set a permissions on html dir and her subdirs
sudo chown -R $USER:$USER /var/www/html/ # insert your username on $USER:$USER

#restart apache
sudo systemctl restart httpd

# copy
sudo cp -r ~/InetScann /var/www/html

```
All Done! Go to your browser and type http://localhost/InetScann/src/public/index.html

on RHEL/Cent/Fedora
```bash
# installing deps
 sudo dnf httpd php composer redis mariadb-server

# bun
curl -fsSL https://bun.sh | bash

# Starting mariadb, apache and redis
sudo systemctl enable --now mariadb-server redis httpd && sudo systemctl start --now mariadb-server redis httpd

# setting up the apache
sudo vim /etc/httpd/conf/httpd.conf
# or nano
sudo nano /etc/httpd/conf/httpd.conf

#change these strings
DocumentRoot ""
# to
DocumentRoot "/var/www/html"
#and
<Directory "/var/www/html">

# By default, the Apache configuration file in the Directory section grants full access, but if your configuration file has
# a value set to something other than "Require all granted", then change that value to "Require all granted"

#create a dir in /var/www
sudo mkdir -p /var/www/html

# and set a permissions on html dir and her subdirs
sudo chown -R $USER:$USER /var/www/html/ # insert your username on $USER:$USER if variable not sets automatic

#restart apache
sudo systemctl restart httpd

# copy
sudo cp -r ~/InetScann /var/www/html

# if you have a 403 error on your server maybe SELinux blocks apache
# execute this
sudo chcon -t httpd_sys_content_t /var/www/html -R

```
