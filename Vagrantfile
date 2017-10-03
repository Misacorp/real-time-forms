# -*- mode: ruby -*-
# vi: set ft=ruby :

DIR = File.dirname(__FILE__)

Vagrant.configure(2) do |config|
  config.vm.box = "brownell/xenial64lemp"
  config.vm.box_check_update = true

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network "forwarded_port", guest:80, host: 8080
  config.vm.network "private_network", ip: "192.168.12.12"
  config.vm.hostname = "realtimeforms.local"

  # Expose MySQL port
  config.vm.network "forwarded_port", guest: 3306, host: 6306

  config.hostsupdater.aliases = []
  config.hostsupdater.aliases += ["realtimeforms.local", "www.realtimeforms.local"]

  config.vm.synced_folder DIR, "/var/www/html", id: "vagrant-root", :owner => "vagrant", :group => "www-data"

  config.vm.provider "virtualbox" do |vb|
    vb.gui = false
    vb.memory = "2048"
  end
end
