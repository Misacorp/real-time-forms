# Setup instructions

Set up the Vagrant environment for this project with the following steps.

1. Clone this project to your local machine.
2. Run `vagrant up` and `vagrant ssh` to enter the virtual machine.
3. Log in to MySQL: `mysql -u debian-sys-maint -p`, password `p1qjfl1QrpjrvByL`
4. Create a vagrant user: `GRANT ALL PRIVILEGES ON *.* TO 'vagrant'@'localhost' IDENTIFIED BY 'vagrant';`
5. Create a database: `CREATE DATABASE realtimeforms;`

Your database is now set up!

## Set up Node

Run the following commands to install Node using NVM.

1. `touch ~/.bashrc`
2. Install NVM `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash`. This may not be the latest version.
3. `source ~/.bashrc`
4. Install the latest Node version: `nvm install node` followed by `nvm use node`

You now have Node set up!

## Install Node modules

The following is a non-exhaustive list of modules this project depends on: `express, knex, body-parser, mysql`. Follow these steps to install them:

1. `cd /var/www/html/`
2. `npm i knex mysql express body-parser --save`
3. `npm i knex -g`
4. Run knex migrations to bring database up to speed: `knex migrate:latest`

Done! Your environment should be set for development. Some day I hope to have this all neatly in a Vagrant provisioning script.

## Connecting to Vagrant MySQL server from host

(Optional) Follow these steps to connect to the MySQL server running on your Vagrant machine with tools like Emma.

1. Add `[mysqld]` and `bind-address=0.0.0.0` to the start of `/etc/mysql/my.cnf/`
2. Restart MySQL with `sudo service mysql restart`
3. Configure your host machine's MySQL client with the following details.
```
hostname: 127.0.0.1
port: 6306
user: vagrant
password: vagrant
database: realtimeforms
```
You should now be able to connect to the Vagrant machine's database from your host machine!
