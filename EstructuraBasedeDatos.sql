-- phpMyAdmin SQL Dump
-- version 3.4.10.1deb1
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 02-01-2014 a las 11:25:12
-- Versión del servidor: 5.5.34
-- Versión de PHP: 5.3.10-1ubuntu3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de datos: `queretaroleeBK`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_activitieslist`
--

CREATE TABLE IF NOT EXISTS `account_activitieslist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12 ;

--
-- Volcado de datos para la tabla `account_activitieslist`
--

INSERT INTO `account_activitieslist` (`id`, `name`) VALUES
(1, 'Creó'),
(2, 'Actualizó'),
(3, 'Se unió'),
(4, 'Añadio'),
(5, 'Sigue'),
(6, 'Calificó'),
(7, 'Liberó'),
(8, 'Encontró'),
(9, 'Leyendo'),
(10, 'Unfollow'),
(11, 'endReading');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_activity`
--

CREATE TABLE IF NOT EXISTS `account_activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `object` int(11) NOT NULL,
  `added_to_object` int(11) DEFAULT NULL,
  `date` datetime NOT NULL,
  `type` varchar(1) NOT NULL,
  `added_to_type` varchar(1) DEFAULT NULL,
  `activity_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_activity_6340c63c` (`user_id`),
  KEY `account_activity_8005e431` (`activity_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=125 ;

--
-- Volcado de datos para la tabla `account_activity`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_author`
--

CREATE TABLE IF NOT EXISTS `account_author` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `birthday` datetime NOT NULL,
  `picture` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `biography` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL,
  `id_api` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=70 ;

--
-- Volcado de datos para la tabla `account_author`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_authortitle`
--

CREATE TABLE IF NOT EXISTS `account_authortitle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_authortitle_9246ed76` (`title_id`),
  KEY `account_authortitle_e969df21` (`author_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=128 ;

--
-- Volcado de datos para la tabla `account_authortitle`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_discussion`
--

CREATE TABLE IF NOT EXISTS `account_discussion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `date` datetime NOT NULL,
  `meta` varchar(1) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_discussion_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_discussion_c096cf48` (`entity_id`),
  KEY `account_discussion_6340c63c` (`user_id`),
  KEY `account_discussion_36e895f7` (`parent_discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_genre`
--

CREATE TABLE IF NOT EXISTS `account_genre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `date` datetime NOT NULL,
  `status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=15 ;

--
-- Volcado de datos para la tabla `account_genre`
--

INSERT INTO `account_genre` (`id`, `name`, `description`, `date`, `status`) VALUES
(1, 'Thriller', 'Thriller', '2013-11-08 21:32:28', 1),
(2, 'Romántico', 'Romántico', '2013-11-08 21:32:47', 1),
(3, 'Aventura', 'Aventura', '2013-11-08 21:32:53', 1),
(4, 'Terror', 'Terror', '2013-11-08 21:32:58', 1),
(5, 'Ficcion', 'Ficcion', '2013-11-08 21:33:04', 1),
(6, 'Ciencia Ficción', 'Ciencia Ficción', '2013-11-08 21:33:10', 1),
(7, 'Investigación', 'Investigación', '2013-11-08 21:33:14', 1),
(8, 'Biográfica', 'Biográfica', '2013-11-08 21:33:18', 1),
(9, 'Infantil', 'Infantil', '2013-11-08 21:33:22', 1),
(10, 'Politica', 'Politica', '2013-11-08 21:33:29', 1),
(11, 'Economia', 'Economia', '2013-11-08 21:33:33', 1),
(12, 'Sociedad', 'Sociedad', '2013-11-08 21:33:37', 1),
(13, 'Deportes', 'Deportes', '2013-11-08 21:33:42', 1),
(14, 'Otros temas', 'Otros temas', '2013-11-08 21:33:52', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_genretitle`
--

CREATE TABLE IF NOT EXISTS `account_genretitle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_genretitle_9246ed76` (`title_id`),
  KEY `account_genretitle_33e6008b` (`genre_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_list`
--

CREATE TABLE IF NOT EXISTS `account_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `date` datetime NOT NULL,
  `status` tinyint(1) NOT NULL,
  `type` varchar(1) NOT NULL,
  `privacy` tinyint(1) NOT NULL,
  `picture` varchar(255) NOT NULL,
  `default_type` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_list_6340c63c` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=85 ;

--
-- Volcado de datos para la tabla `account_list`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_listauthor`
--

CREATE TABLE IF NOT EXISTS `account_listauthor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `list_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_listauthor_c142dac4` (`list_id`),
  KEY `account_listauthor_e969df21` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_listgenre`
--

CREATE TABLE IF NOT EXISTS `account_listgenre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `list_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_listgenre_c142dac4` (`list_id`),
  KEY `account_listgenre_33e6008b` (`genre_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=22 ;

--
-- Volcado de datos para la tabla `account_listgenre`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_listtitle`
--

CREATE TABLE IF NOT EXISTS `account_listtitle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title_id` int(11) NOT NULL,
  `list_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_listtitle_9246ed76` (`title_id`),
  KEY `account_listtitle_c142dac4` (`list_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=124 ;

--
-- Volcado de datos para la tabla `account_listtitle`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_page`
--

CREATE TABLE IF NOT EXISTS `account_page` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `coment` longtext NOT NULL,
  `tags` longtext NOT NULL,
  `date` datetime NOT NULL,
  `meta` longtext NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_page_6340c63c` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_rate`
--

CREATE TABLE IF NOT EXISTS `account_rate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(1) NOT NULL,
  `grade` double NOT NULL,
  `element_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_rate_6340c63c` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Volcado de datos para la tabla `account_rate`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_title`
--

CREATE TABLE IF NOT EXISTS `account_title` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `series` varchar(255) NOT NULL,
  `publisher` varchar(255) NOT NULL,
  `edition` varchar(255) NOT NULL,
  `published_date` datetime DEFAULT NULL,
  `pages` varchar(255) NOT NULL,
  `isbn` varchar(255) NOT NULL,
  `isbn13` varchar(255) NOT NULL,
  `language` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `cover` varchar(255) NOT NULL,
  `picture` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `status` tinyint(1) NOT NULL,
  `id_google` longtext NOT NULL,
  `description` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=110 ;

--
-- Volcado de datos para la tabla `account_title`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group`
--

CREATE TABLE IF NOT EXISTS `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group_permissions`
--

CREATE TABLE IF NOT EXISTS `auth_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_id` (`group_id`,`permission_id`),
  KEY `auth_group_permissions_5f412f9a` (`group_id`),
  KEY `auth_group_permissions_83d7f98b` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_permission`
--

CREATE TABLE IF NOT EXISTS `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_type_id` (`content_type_id`,`codename`),
  KEY `auth_permission_37ef4eb4` (`content_type_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=118 ;

--
-- Volcado de datos para la tabla `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add permission', 1, 'add_permission'),
(2, 'Can change permission', 1, 'change_permission'),
(3, 'Can delete permission', 1, 'delete_permission'),
(4, 'Can add group', 2, 'add_group'),
(5, 'Can change group', 2, 'change_group'),
(6, 'Can delete group', 2, 'delete_group'),
(7, 'Can add user', 3, 'add_user'),
(8, 'Can change user', 3, 'change_user'),
(9, 'Can delete user', 3, 'delete_user'),
(10, 'Can add content type', 4, 'add_contenttype'),
(11, 'Can change content type', 4, 'change_contenttype'),
(12, 'Can delete content type', 4, 'delete_contenttype'),
(13, 'Can add session', 5, 'add_session'),
(14, 'Can change session', 5, 'change_session'),
(15, 'Can delete session', 5, 'delete_session'),
(16, 'Can add site', 6, 'add_site'),
(17, 'Can change site', 6, 'change_site'),
(18, 'Can delete site', 6, 'delete_site'),
(19, 'Can add log entry', 7, 'add_logentry'),
(20, 'Can change log entry', 7, 'change_logentry'),
(21, 'Can delete log entry', 7, 'delete_logentry'),
(22, 'Can add title', 8, 'add_title'),
(23, 'Can change title', 8, 'change_title'),
(24, 'Can delete title', 8, 'delete_title'),
(25, 'Can add author', 9, 'add_author'),
(26, 'Can change author', 9, 'change_author'),
(27, 'Can delete author', 9, 'delete_author'),
(28, 'Can add genre', 10, 'add_genre'),
(29, 'Can change genre', 10, 'change_genre'),
(30, 'Can delete genre', 10, 'delete_genre'),
(31, 'Can add genre title', 11, 'add_genretitle'),
(32, 'Can change genre title', 11, 'change_genretitle'),
(33, 'Can delete genre title', 11, 'delete_genretitle'),
(34, 'Can add list', 12, 'add_list'),
(35, 'Can change list', 12, 'change_list'),
(36, 'Can delete list', 12, 'delete_list'),
(37, 'Can add list author', 13, 'add_listauthor'),
(38, 'Can change list author', 13, 'change_listauthor'),
(39, 'Can delete list author', 13, 'delete_listauthor'),
(40, 'Can add list genre', 14, 'add_listgenre'),
(41, 'Can change list genre', 14, 'change_listgenre'),
(42, 'Can delete list genre', 14, 'delete_listgenre'),
(43, 'Can add list title', 15, 'add_listtitle'),
(44, 'Can change list title', 15, 'change_listtitle'),
(45, 'Can delete list title', 15, 'delete_listtitle'),
(46, 'Can add author title', 16, 'add_authortitle'),
(47, 'Can change author title', 16, 'change_authortitle'),
(48, 'Can delete author title', 16, 'delete_authortitle'),
(49, 'Can add rate', 17, 'add_rate'),
(50, 'Can change rate', 17, 'change_rate'),
(51, 'Can delete rate', 17, 'delete_rate'),
(52, 'Can add activities list', 18, 'add_activitieslist'),
(53, 'Can change activities list', 18, 'change_activitieslist'),
(54, 'Can delete activities list', 18, 'delete_activitieslist'),
(55, 'Can add activity', 19, 'add_activity'),
(56, 'Can change activity', 19, 'change_activity'),
(57, 'Can delete activity', 19, 'delete_activity'),
(58, 'Can add page', 20, 'add_page'),
(59, 'Can change page', 20, 'change_page'),
(60, 'Can delete page', 20, 'delete_page'),
(61, 'Can add discussion', 21, 'add_discussion'),
(62, 'Can change discussion', 21, 'change_discussion'),
(63, 'Can delete discussion', 21, 'delete_discussion'),
(64, 'Can add cities', 22, 'add_cities'),
(65, 'Can change cities', 22, 'change_cities'),
(66, 'Can delete cities', 22, 'delete_cities'),
(67, 'Can add countries', 23, 'add_countries'),
(68, 'Can change countries', 23, 'change_countries'),
(69, 'Can delete countries', 23, 'delete_countries'),
(70, 'Can add states', 24, 'add_states'),
(71, 'Can change states', 24, 'change_states'),
(72, 'Can delete states', 24, 'delete_states'),
(73, 'Can add profile', 25, 'add_profile'),
(74, 'Can change profile', 25, 'change_profile'),
(75, 'Can delete profile', 25, 'delete_profile'),
(76, 'Can add attribute type', 26, 'add_attributetype'),
(77, 'Can change attribute type', 26, 'change_attributetype'),
(78, 'Can delete attribute type', 26, 'delete_attributetype'),
(79, 'Can add type', 27, 'add_type'),
(80, 'Can change type', 27, 'change_type'),
(81, 'Can delete type', 27, 'delete_type'),
(82, 'Can add attribute', 28, 'add_attribute'),
(83, 'Can change attribute', 28, 'change_attribute'),
(84, 'Can delete attribute', 28, 'delete_attribute'),
(85, 'Can add category', 29, 'add_category'),
(86, 'Can change category', 29, 'change_category'),
(87, 'Can delete category', 29, 'delete_category'),
(88, 'Can add entity', 30, 'add_entity'),
(89, 'Can change entity', 30, 'change_entity'),
(90, 'Can delete entity', 30, 'delete_entity'),
(91, 'Can add entity category', 31, 'add_entitycategory'),
(92, 'Can change entity category', 31, 'change_entitycategory'),
(93, 'Can delete entity category', 31, 'delete_entitycategory'),
(94, 'Can add event', 32, 'add_event'),
(95, 'Can change event', 32, 'change_event'),
(96, 'Can delete event', 32, 'delete_event'),
(97, 'Can add assist event', 33, 'add_assistevent'),
(98, 'Can change assist event', 33, 'change_assistevent'),
(99, 'Can delete assist event', 33, 'delete_assistevent'),
(100, 'Can add book', 34, 'add_book'),
(101, 'Can change book', 34, 'change_book'),
(102, 'Can delete book', 34, 'delete_book'),
(103, 'Can add travel', 35, 'add_travel'),
(104, 'Can change travel', 35, 'change_travel'),
(105, 'Can delete travel', 35, 'delete_travel'),
(106, 'Can add member to object', 36, 'add_membertoobject'),
(107, 'Can change member to object', 36, 'change_membertoobject'),
(108, 'Can delete member to object', 36, 'delete_membertoobject'),
(109, 'Can add external user', 37, 'add_externaluser'),
(110, 'Can change external user', 37, 'change_externaluser'),
(111, 'Can delete external user', 37, 'delete_externaluser'),
(112, 'Can add facebook session', 38, 'add_facebooksession'),
(113, 'Can change facebook session', 38, 'change_facebooksession'),
(114, 'Can delete facebook session', 38, 'delete_facebooksession'),
(115, 'Can add twitter session', 39, 'add_twittersession'),
(116, 'Can change twitter session', 39, 'change_twittersession'),
(117, 'Can delete twitter session', 39, 'delete_twittersession');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user`
--

CREATE TABLE IF NOT EXISTS `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime NOT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(30) NOT NULL,
  `first_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `last_name` varchar(30) CHARACTER SET utf8 COLLATE utf8_spanish2_ci NOT NULL,
  `email` varchar(75) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=18 ;

--
-- Volcado de datos para la tabla `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$12000$HfcqHFuMT5VN$7ZouDMi3m2f7bGpAQ7kFvEnJcnZ4ZRHRjB2VirRm4hc=', '2013-11-14 17:34:55', 1, 'admin', '', '', 'andres@wime.com.mx', 1, 1, '2013-11-14 04:02:35'),

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user_groups`
--

CREATE TABLE IF NOT EXISTS `auth_user_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`group_id`),
  KEY `auth_user_groups_6340c63c` (`user_id`),
  KEY `auth_user_groups_5f412f9a` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user_user_permissions`
--

CREATE TABLE IF NOT EXISTS `auth_user_user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`permission_id`),
  KEY `auth_user_user_permissions_6340c63c` (`user_id`),
  KEY `auth_user_user_permissions_83d7f98b` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_admin_log`
--

CREATE TABLE IF NOT EXISTS `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_6340c63c` (`user_id`),
  KEY `django_admin_log_37ef4eb4` (`content_type_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

--
-- Volcado de datos para la tabla `django_admin_log`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_content_type`
--

CREATE TABLE IF NOT EXISTS `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_label` (`app_label`,`model`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=40 ;

--
-- Volcado de datos para la tabla `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `name`, `app_label`, `model`) VALUES
(1, 'permission', 'auth', 'permission'),
(2, 'group', 'auth', 'group'),
(3, 'user', 'auth', 'user'),
(4, 'content type', 'contenttypes', 'contenttype'),
(5, 'session', 'sessions', 'session'),
(6, 'site', 'sites', 'site'),
(7, 'log entry', 'admin', 'logentry'),
(8, 'title', 'account', 'title'),
(9, 'author', 'account', 'author'),
(10, 'genre', 'account', 'genre'),
(11, 'genre title', 'account', 'genretitle'),
(12, 'list', 'account', 'list'),
(13, 'list author', 'account', 'listauthor'),
(14, 'list genre', 'account', 'listgenre'),
(15, 'list title', 'account', 'listtitle'),
(16, 'author title', 'account', 'authortitle'),
(17, 'rate', 'account', 'rate'),
(18, 'activities list', 'account', 'activitieslist'),
(19, 'activity', 'account', 'activity'),
(20, 'page', 'account', 'page'),
(21, 'discussion', 'account', 'discussion'),
(22, 'cities', 'registry', 'cities'),
(23, 'countries', 'registry', 'countries'),
(24, 'states', 'registry', 'states'),
(25, 'profile', 'registry', 'profile'),
(26, 'attribute type', 'registry', 'attributetype'),
(27, 'type', 'registry', 'type'),
(28, 'attribute', 'registry', 'attribute'),
(29, 'category', 'registry', 'category'),
(30, 'entity', 'registry', 'entity'),
(31, 'entity category', 'registry', 'entitycategory'),
(32, 'event', 'registry', 'event'),
(33, 'assist event', 'registry', 'assistevent'),
(34, 'book', 'registry', 'book'),
(35, 'travel', 'registry', 'travel'),
(36, 'member to object', 'registry', 'membertoobject'),
(37, 'external user', 'registry', 'externaluser'),
(38, 'facebook session', 'registry', 'facebooksession'),
(39, 'twitter session', 'registry', 'twittersession');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_session`
--

CREATE TABLE IF NOT EXISTS `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_b7b81f0c` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `django_session`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_site`
--

CREATE TABLE IF NOT EXISTS `django_site` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Volcado de datos para la tabla `django_site`
--

INSERT INTO `django_site` (`id`, `domain`, `name`) VALUES
(1, 'example.com', 'example.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_assistevent`
--

CREATE TABLE IF NOT EXISTS `registry_assistevent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_attending` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_assistevent_a41e20fe` (`event_id`),
  KEY `registry_assistevent_6340c63c` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Volcado de datos para la tabla `registry_assistevent`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_attribute`
--

CREATE TABLE IF NOT EXISTS `registry_attribute` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `meta_value` varchar(255) NOT NULL,
  `type_id` int(11) NOT NULL,
  `attribute_type_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_attribute_403d8ff3` (`type_id`),
  KEY `registry_attribute_8a25fec6` (`attribute_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_attributetype`
--

CREATE TABLE IF NOT EXISTS `registry_attributetype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `meta_key` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_book`
--

CREATE TABLE IF NOT EXISTS `registry_book` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) NOT NULL,
  `series` varchar(255) NOT NULL,
  `publisher` varchar(255) NOT NULL,
  `edition` varchar(255) NOT NULL,
  `published_date` datetime NOT NULL,
  `pages` varchar(255) NOT NULL,
  `isbn` varchar(255) NOT NULL,
  `isbn13` varchar(255) NOT NULL,
  `language` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `cover` varchar(255) NOT NULL,
  `picture` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `status` tinyint(1) NOT NULL,
  `author` varchar(255) NOT NULL,
  `genre` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_book_6340c63c` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Volcado de datos para la tabla `registry_book`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_category`
--

CREATE TABLE IF NOT EXISTS `registry_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_category_403d8ff3` (`type_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=18 ;

--
-- Volcado de datos para la tabla `registry_category`
--

INSERT INTO `registry_category` (`id`, `name`, `type_id`) VALUES
(1, 'Cultura', 2),
(2, 'Círculo de lectura', 1),
(3, 'Cafetería', 3),
(4, 'Institución Pública', 2),
(5, 'Institución Privada', 2),
(8, 'Fomento a la Lectura', 2),
(9, 'Promoción Cultural', 2),
(10, 'Sede de círculo de lectura', 3),
(11, 'Librería', 3),
(12, 'Biblioteca', 3),
(13, 'Auditorio', 3),
(14, 'Museo', 3),
(15, 'Plaza pública', 3),
(16, 'Jardín', 3),
(17, 'Grupo de lectura', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_cities`
--

CREATE TABLE IF NOT EXISTS `registry_cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(4) NOT NULL,
  `city` varchar(128) NOT NULL,
  `accentCity` varchar(128) NOT NULL,
  `region` varchar(128) NOT NULL,
  `population` varchar(128) NOT NULL,
  `lat` varchar(128) NOT NULL,
  `long` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_countries`
--

CREATE TABLE IF NOT EXISTS `registry_countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(4) NOT NULL,
  `name` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_entity`
--

CREATE TABLE IF NOT EXISTS `registry_entity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `cover_picture` varchar(255) DEFAULT NULL,
  `date` datetime NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `privacy` tinyint(1) NOT NULL,
  `fb` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  `long` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `fb_id` varchar(255) DEFAULT NULL,
  `share_fb` tinyint(1) NOT NULL,
  `share_twitter` tinyint(1) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_entity_6340c63c` (`user_id`),
  KEY `registry_entity_403d8ff3` (`type_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=18 ;

--
-- Volcado de datos para la tabla `registry_entity`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_entitycategory`
--

CREATE TABLE IF NOT EXISTS `registry_entitycategory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `entity_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_entitycategory_6f33f001` (`category_id`),
  KEY `registry_entitycategory_c096cf48` (`entity_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=16 ;

--
-- Volcado de datos para la tabla `registry_entitycategory`
--
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_event`
--

CREATE TABLE IF NOT EXISTS `registry_event` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `cover_picture` varchar(255) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `description` longtext,
  `location_name` varchar(255) NOT NULL,
  `place_spot` tinyint(1) NOT NULL,
  `lat` varchar(255) DEFAULT NULL,
  `long` varchar(255) DEFAULT NULL,
  `privacy_type` tinyint(1) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `share_fb` tinyint(1) NOT NULL,
  `fb_id` varchar(45) NOT NULL,
  `location_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `fb_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_event_afbb987d` (`location_id`),
  KEY `registry_event_cb902d83` (`owner_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

--
-- Volcado de datos para la tabla `registry_event`
--
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_externaluser`
--

CREATE TABLE IF NOT EXISTS `registry_externaluser` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Volcado de datos para la tabla `registry_externaluser`
--

INSERT INTO `registry_externaluser` (`id`, `name`, `email`, `status`) VALUES
(1, 'Andres Garcia', 'prueba@correo.cm', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_facebooksession`
--

CREATE TABLE IF NOT EXISTS `registry_facebooksession` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `access_token` varchar(255) NOT NULL,
  `expires` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `uid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_token` (`access_token`),
  UNIQUE KEY `user_id` (`user_id`,`uid`,`access_token`,`expires`),
  KEY `registry_facebooksession_6340c63c` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=15 ;

--
-- Volcado de datos para la tabla `registry_facebooksession`
--
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_membertoobject`
--

CREATE TABLE IF NOT EXISTS `registry_membertoobject` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  `is_member` tinyint(1) NOT NULL,
  `super_user` tinyint(1) NOT NULL,
  `request` tinyint(1) NOT NULL,
  `object` int(11) NOT NULL,
  `object_type` varchar(1) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_membertoobject_6340c63c` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=20 ;

--
-- Volcado de datos para la tabla `registry_membertoobject`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_profile`
--

CREATE TABLE IF NOT EXISTS `registry_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `picture` varchar(255) NOT NULL,
  `phone` varchar(60) DEFAULT NULL,
  `twitter_id` varchar(255) DEFAULT NULL,
  `twitter_username` varchar(255) DEFAULT NULL,
  `fb_username` varchar(255) DEFAULT NULL,
  `fb_id` varchar(255) DEFAULT NULL,
  `birthday` datetime DEFAULT NULL,
  `status` tinyint(1) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` int(11) DEFAULT NULL,
  `biography` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `is_new` tinyint(1) DEFAULT NULL,
  `social_session` tinyint(1) DEFAULT NULL,
  `social_session_twitter` tinyint(1) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_profile_6340c63c` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=16 ;

--
-- Volcado de datos para la tabla `registry_profile`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_states`
--

CREATE TABLE IF NOT EXISTS `registry_states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(4) NOT NULL,
  `region` varchar(4) NOT NULL,
  `name` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_travel`
--

CREATE TABLE IF NOT EXISTS `registry_travel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_user` varchar(255) NOT NULL,
  `lat` varchar(255) DEFAULT NULL,
  `long` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL,
  `date` datetime NOT NULL,
  `description` longtext NOT NULL,
  `meta` longtext NOT NULL,
  `user` int(11) NOT NULL,
  `is_new` tinyint(1) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `book_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registry_travel_36c249d7` (`book_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=15 ;

--
-- Volcado de datos para la tabla `registry_travel`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_twittersession`
--

CREATE TABLE IF NOT EXISTS `registry_twittersession` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_token` varchar(255) NOT NULL,
  `oauth_token` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_token` (`request_token`,`oauth_token`),
  KEY `registry_twittersession_6340c63c` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=13 ;

--
-- Volcado de datos para la tabla `registry_twittersession`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registry_type`
--

CREATE TABLE IF NOT EXISTS `registry_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Volcado de datos para la tabla `registry_type`
--

INSERT INTO `registry_type` (`id`, `name`, `description`, `date`) VALUES
(1, 'group', 'text', '2013-09-28 00:54:04'),
(2, 'organization', 'text', '2013-09-28 00:54:04'),
(3, 'spot', 'text', '2013-09-28 00:54:04');

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `account_activity`
--
ALTER TABLE `account_activity`
  ADD CONSTRAINT `user_id_refs_id_281dcdf9` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `activity_id_refs_id_a16e0d9a` FOREIGN KEY (`activity_id`) REFERENCES `account_activitieslist` (`id`);

--
-- Filtros para la tabla `account_authortitle`
--
ALTER TABLE `account_authortitle`
  ADD CONSTRAINT `author_id_refs_id_e8819550` FOREIGN KEY (`author_id`) REFERENCES `account_author` (`id`),
  ADD CONSTRAINT `title_id_refs_id_e6a90731` FOREIGN KEY (`title_id`) REFERENCES `account_title` (`id`);

--
-- Filtros para la tabla `account_discussion`
--
ALTER TABLE `account_discussion`
  ADD CONSTRAINT `entity_id_refs_id_9718efdc` FOREIGN KEY (`entity_id`) REFERENCES `registry_entity` (`id`),
  ADD CONSTRAINT `parent_discussion_id_refs_id_031c6262` FOREIGN KEY (`parent_discussion_id`) REFERENCES `account_discussion` (`id`),
  ADD CONSTRAINT `user_id_refs_id_567b56df` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `account_genretitle`
--
ALTER TABLE `account_genretitle`
  ADD CONSTRAINT `genre_id_refs_id_45385eaf` FOREIGN KEY (`genre_id`) REFERENCES `account_genre` (`id`),
  ADD CONSTRAINT `title_id_refs_id_73f5f313` FOREIGN KEY (`title_id`) REFERENCES `account_title` (`id`);

--
-- Filtros para la tabla `account_list`
--
ALTER TABLE `account_list`
  ADD CONSTRAINT `user_id_refs_id_de29224b` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `account_listauthor`
--
ALTER TABLE `account_listauthor`
  ADD CONSTRAINT `list_id_refs_id_885c98e6` FOREIGN KEY (`list_id`) REFERENCES `account_list` (`id`),
  ADD CONSTRAINT `author_id_refs_id_dc08a22a` FOREIGN KEY (`author_id`) REFERENCES `account_author` (`id`);

--
-- Filtros para la tabla `account_listgenre`
--
ALTER TABLE `account_listgenre`
  ADD CONSTRAINT `list_id_refs_id_b9fd0ee0` FOREIGN KEY (`list_id`) REFERENCES `account_list` (`id`),
  ADD CONSTRAINT `genre_id_refs_id_81367cc8` FOREIGN KEY (`genre_id`) REFERENCES `account_genre` (`id`);

--
-- Filtros para la tabla `account_listtitle`
--
ALTER TABLE `account_listtitle`
  ADD CONSTRAINT `list_id_refs_id_c6512913` FOREIGN KEY (`list_id`) REFERENCES `account_list` (`id`),
  ADD CONSTRAINT `title_id_refs_id_23aa6042` FOREIGN KEY (`title_id`) REFERENCES `account_title` (`id`);

--
-- Filtros para la tabla `account_page`
--
ALTER TABLE `account_page`
  ADD CONSTRAINT `user_id_refs_id_f5e80ca9` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `account_rate`
--
ALTER TABLE `account_rate`
  ADD CONSTRAINT `user_id_refs_id_3c1d6179` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `group_id_refs_id_f4b32aac` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `permission_id_refs_id_6ba0f519` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`);

--
-- Filtros para la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `content_type_id_refs_id_d043b34a` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Filtros para la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `user_id_refs_id_40c41112` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `group_id_refs_id_274b862c` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Filtros para la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `user_id_refs_id_4dc23c39` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `permission_id_refs_id_35d9ac25` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`);

--
-- Filtros para la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `user_id_refs_id_c0d12874` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `content_type_id_refs_id_93d2d1f8` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Filtros para la tabla `registry_assistevent`
--
ALTER TABLE `registry_assistevent`
  ADD CONSTRAINT `user_id_refs_id_309c59fc` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `event_id_refs_id_b73952be` FOREIGN KEY (`event_id`) REFERENCES `registry_event` (`id`);

--
-- Filtros para la tabla `registry_attribute`
--
ALTER TABLE `registry_attribute`
  ADD CONSTRAINT `attribute_type_id_refs_id_a22765ea` FOREIGN KEY (`attribute_type_id`) REFERENCES `registry_attributetype` (`id`),
  ADD CONSTRAINT `type_id_refs_id_f96f692b` FOREIGN KEY (`type_id`) REFERENCES `registry_type` (`id`);

--
-- Filtros para la tabla `registry_book`
--
ALTER TABLE `registry_book`
  ADD CONSTRAINT `user_id_refs_id_e5eff07a` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `registry_category`
--
ALTER TABLE `registry_category`
  ADD CONSTRAINT `type_id_refs_id_3c3a5e93` FOREIGN KEY (`type_id`) REFERENCES `registry_type` (`id`);

--
-- Filtros para la tabla `registry_entity`
--
ALTER TABLE `registry_entity`
  ADD CONSTRAINT `user_id_refs_id_b7139ff8` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `type_id_refs_id_97008501` FOREIGN KEY (`type_id`) REFERENCES `registry_type` (`id`);

--
-- Filtros para la tabla `registry_entitycategory`
--
ALTER TABLE `registry_entitycategory`
  ADD CONSTRAINT `entity_id_refs_id_bb966c89` FOREIGN KEY (`entity_id`) REFERENCES `registry_entity` (`id`),
  ADD CONSTRAINT `category_id_refs_id_52bc03e5` FOREIGN KEY (`category_id`) REFERENCES `registry_category` (`id`);

--
-- Filtros para la tabla `registry_event`
--
ALTER TABLE `registry_event`
  ADD CONSTRAINT `owner_id_refs_id_38a31619` FOREIGN KEY (`owner_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `location_id_refs_id_3a74f17c` FOREIGN KEY (`location_id`) REFERENCES `registry_entity` (`id`);

--
-- Filtros para la tabla `registry_facebooksession`
--
ALTER TABLE `registry_facebooksession`
  ADD CONSTRAINT `user_id_refs_id_fd203478` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `registry_membertoobject`
--
ALTER TABLE `registry_membertoobject`
  ADD CONSTRAINT `user_id_refs_id_fb579a21` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `registry_profile`
--
ALTER TABLE `registry_profile`
  ADD CONSTRAINT `user_id_refs_id_32e11b24` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `registry_travel`
--
ALTER TABLE `registry_travel`
  ADD CONSTRAINT `book_id_refs_id_4c31b97d` FOREIGN KEY (`book_id`) REFERENCES `registry_book` (`id`);

--
-- Filtros para la tabla `registry_twittersession`
--
ALTER TABLE `registry_twittersession`
  ADD CONSTRAINT `user_id_refs_id_c4ab3779` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
