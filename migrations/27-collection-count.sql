DROP TABLE IF EXISTS `addons_collections_counts`;
CREATE TABLE `addons_collections_counts` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `addon_id` int(11) unsigned NOT NULL DEFAULT '0',
    `application_id` int(11) unsigned NOT NULL DEFAULT '0',
    `count` int(10) unsigned NOT NULL DEFAULT '0',
    PRIMARY KEY (`id`),
    KEY `addon_id` (`addon_id`),
    KEY `application_id` (`application_id`),
    UNIQUE KEY `app_addon` (`addon_id`, `application_id`),
    CONSTRAINT FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`),
    CONSTRAINT FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
