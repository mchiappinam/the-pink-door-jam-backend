# The Pink Door Jam Backend
Backend for The Pink Door Jam, using Express.js


MySQL code used to create table:

If you're downloading this project now, please use:
CREATE TABLE `users` ( `id` int(11) NOT NULL AUTO_INCREMENT, `username` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `admin` int(11) NOT NULL DEFAULT '0', PRIMARY KEY (id) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4

If you were using this project already, please update your db with the command:
ALTER TABLE `users` ADD `admin` INT NOT NULL DEFAULT '0' AFTER `password`;