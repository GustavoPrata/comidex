-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 23-Out-2025 às 08:10
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `app1`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `additionals`
--

CREATE TABLE `additionals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(8,2) NOT NULL DEFAULT 0.00,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `additional_category_id` bigint(20) UNSIGNED NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `additionals`
--

INSERT INTO `additionals` (`id`, `name`, `description`, `price`, `active`, `additional_category_id`, `sort_order`, `created_at`, `updated_at`) VALUES
(7, 'Gelo', 'Para refrescar', 0.00, 1, 12, 1, '2025-05-31 15:58:21', '2025-06-03 19:33:39'),
(12, 'Limão', 'Frescancia pura', 0.00, 1, 12, 3, '2025-06-01 09:28:12', '2025-06-03 19:33:39'),
(13, 'Copo Adicional', 'Peça um copo novo', 0.00, 1, 12, 2, '2025-06-01 09:28:19', '2025-06-03 19:33:39'),
(14, 'Smirnoff', 'Vodka Smirnoff', 3.00, 1, 21, 2, '2025-06-01 10:26:30', '2025-06-04 15:44:36'),
(15, 'Absolut', 'Vodka Absolut', 5.00, 1, 21, 3, '2025-06-01 10:27:14', '2025-06-04 15:44:36'),
(16, 'Ciroc', 'Vodka Ciroc', 10.00, 1, 21, 1, '2025-06-01 10:27:33', '2025-06-04 15:44:36');

-- --------------------------------------------------------

--
-- Estrutura da tabela `additional_categories`
--

CREATE TABLE `additional_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(255) NOT NULL DEFAULT '#6b7280',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `additional_categories`
--

INSERT INTO `additional_categories` (`id`, `name`, `description`, `color`, `sort_order`, `active`, `created_at`, `updated_at`) VALUES
(12, 'Refrigerante', NULL, '#0055ff', 2, 1, '2025-05-31 15:23:17', '2025-10-23 05:57:27'),
(21, 'Vodka', NULL, '#57ff0f', 1, 1, '2025-06-01 10:26:11', '2025-10-23 05:57:27'),
(22, 'Teste', NULL, '#6b7280', 3, 1, '2025-06-02 15:11:03', '2025-10-23 05:57:27');

-- --------------------------------------------------------

--
-- Estrutura da tabela `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `active`, `sort_order`, `created_at`, `updated_at`, `group_id`, `image`) VALUES
(18, 'Entradas', 'Aberturas frescas e saborosas para começar sua experiência', 1, 1, '2025-05-31 17:28:06', '2025-06-06 20:34:39', 4, 'categories/IqHcJktf4dKfyvLfljHjCpWHO0bYjXXPyiEyWxQ5.jpg'),
(60, 'Sashimis', 'Fatias delicadas de peixes frescos, um clássico japonês', 1, 2, '2025-06-04 19:09:57', '2025-06-06 20:34:39', 4, 'categories/GQmV6CCE685XnvcMuh3U58LYuBhWfPgejeyBg4xG.jpg'),
(61, 'Carpaccios', 'Finas lâminas de peixe com toques cítricos e frescos', 1, 4, '2025-06-04 20:25:50', '2025-06-06 20:34:39', 4, 'categories/CrcbNPlOFiatWXt2ck8VpjuGR807zYO4ROoM9GlQ.jpg'),
(62, 'Niguiris', 'Bolinhos de arroz com peixes frescos, simples e elegantes', 1, 3, '2025-06-04 20:27:03', '2025-06-06 20:34:39', 4, 'categories/2mYMoPJpQIu6CSZ8q0OOq278ORuwV1d6OOLiRQx4.jpg'),
(63, 'Uramakis', 'Rolos invertidos com recheios criativos e saborosos', 1, 5, '2025-06-04 20:27:11', '2025-06-06 20:34:39', 4, 'categories/nBDdYRjdF8hnzz00mMe3ixbWTMrN1rig2aEhOzS5.jpg'),
(65, 'Acelgamakis', 'Rolos especiais com ingredientes frescos e únicos', 1, 6, '2025-06-04 20:27:29', '2025-06-06 20:34:39', 4, 'categories/cB0v1hLfuSUyFXsV2Ci4WCXEO8kvZmtWG1lgZ448.jpg'),
(66, 'Hossomakis', 'Rolinhos tradicionais, pequenos e cheios de sabor', 1, 7, '2025-06-04 20:27:55', '2025-06-06 20:34:39', 4, NULL),
(67, 'Temakis', 'Cones de alga recheados com sabores autênticos', 1, 8, '2025-06-04 20:28:52', '2025-06-06 20:34:39', 4, 'categories/itD2BUCMnfnQPdzLXKRI4DKm8PRTik6N38joUYPT.jpg'),
(68, 'Dyos', 'Duplas de sushi com combinações surpreendentes', 1, 9, '2025-06-04 20:29:58', '2025-06-06 20:34:39', 4, 'categories/ywkZ6fOc2icIYxfNvuBH7PQzS1WrjOY2JWgkrJx5.jpg'),
(69, 'Chapas', 'Pratos quentes grelhados com toque oriental', 1, 10, '2025-06-04 20:30:25', '2025-06-06 20:34:39', 4, 'categories/bT6VPnPgfUuAT57sAukK40yJIBJhEO1kQnMRGHXx.jpg'),
(70, 'Hot Rolls', 'Rolos fritos, crocantes e irresistíveis', 1, 11, '2025-06-04 20:30:32', '2025-06-06 20:34:39', 4, 'categories/TJ5bTuIySqY64I3iAvodpM2pFOnjOk5clZlNbjN1.jpg'),
(71, 'Harumakis', 'Rolinhos primavera com recheios leves e crocantes', 1, 12, '2025-06-04 20:30:38', '2025-06-06 20:34:39', 4, NULL),
(72, 'Estilo Pasteis', 'Pasteis com inspiração japonesa, leves e saborosos', 1, 13, '2025-06-04 20:30:52', '2025-06-06 20:34:39', 4, NULL),
(73, 'Especial MAAD', 'Criações exclusivas do chef, uma explosão de sabores', 1, 14, '2025-06-04 20:31:00', '2025-06-06 20:34:39', 4, 'categories/0jK3HJkq5tz9d5q9dSOdfQ51dj0JTEjj4VE3ktlz.jpg'),
(74, 'Outros', 'Opções variadas para todos os gostos', 1, 15, '2025-06-04 20:31:08', '2025-06-06 20:34:39', 4, 'categories/OC1YkE6BAv2F3u1wUEpvymdHQvy9nEQgjk4Zeegu.jpg'),
(75, 'Sobremesas', 'Doces delicados para finalizar sua refeição', 1, 16, '2025-06-04 20:31:15', '2025-06-06 20:34:39', 4, 'categories/2O3eACjS7ENVKxXCs3ObPfMTM05mFYKUFhLWU9Go.jpg'),
(76, 'Kids', 'Pratos divertidos para os pequenos', 1, 17, '2025-06-04 20:31:21', '2025-06-06 20:34:39', 4, NULL),
(77, 'Entradas', 'Aberturas frescas e saborosas para começar sua experiência', 1, 1, '2025-06-04 20:33:03', '2025-06-05 18:48:01', 1, 'categories/viIinDNg8aTRDdlsfFxw8xp3y48clZkVNkPjLKYb.jpg'),
(78, 'Entradas', 'Aberturas frescas e saborosas para começar sua experiência', 1, 1, '2025-06-04 20:33:13', '2025-06-04 20:33:13', 5, NULL),
(79, 'Sashimis', 'Fatias delicadas de peixes frescos, um clássico japonês', 1, 2, '2025-06-04 19:09:57', '2025-06-05 18:48:01', 1, NULL),
(80, 'Carpaccios', 'Finas lâminas de peixe com toques cítricos e frescos', 1, 3, '2025-06-04 20:25:50', '2025-06-05 18:48:01', 1, NULL),
(81, 'Niguiris', 'Bolinhos de arroz com peixes frescos, simples e elegantes', 1, 4, '2025-06-04 20:27:03', '2025-06-05 18:48:01', 1, NULL),
(82, 'Uramakis', 'Rolos invertidos com recheios criativos e saborosos', 1, 5, '2025-06-04 20:27:11', '2025-06-05 18:48:01', 1, NULL),
(83, 'Acelgamakis', 'Rolos especiais com ingredientes frescos e únicos', 1, 6, '2025-06-04 20:27:29', '2025-06-05 18:48:01', 1, NULL),
(84, 'Hossomakis', 'Rolinhos tradicionais, pequenos e cheios de sabor', 1, 7, '2025-06-04 20:27:55', '2025-06-05 18:48:01', 1, NULL),
(85, 'Temakis', 'Cones de alga recheados com sabores autênticos', 1, 8, '2025-06-04 20:28:52', '2025-06-05 18:48:01', 1, NULL),
(86, 'Dyos', 'Duplas de sushi com combinações surpreendentes', 1, 9, '2025-06-04 20:29:58', '2025-06-05 18:48:01', 1, NULL),
(87, 'Chapas', 'Pratos quentes grelhados com toque oriental', 1, 10, '2025-06-04 20:30:25', '2025-06-05 18:48:01', 1, NULL),
(88, 'Hot Rolls', 'Rolos fritos, crocantes e irresistíveis', 1, 11, '2025-06-04 20:30:32', '2025-06-05 18:48:01', 1, NULL),
(89, 'Harumakis', 'Rolinhos primavera com recheios leves e crocantes', 1, 12, '2025-06-04 20:30:38', '2025-06-05 18:48:01', 1, NULL),
(90, 'Estilo Pasteis', 'Pasteis com inspiração japonesa, leves e saborosos', 1, 13, '2025-06-04 20:30:52', '2025-06-05 18:48:01', 1, NULL),
(91, 'Especial MAAD', 'Criações exclusivas do chef, uma explosão de sabores', 1, 14, '2025-06-04 20:31:00', '2025-06-05 18:48:01', 1, NULL),
(92, 'Outros', 'Opções variadas para todos os gostos', 1, 15, '2025-06-04 20:31:08', '2025-06-05 18:48:01', 1, NULL),
(93, 'Sobremesas', 'Doces delicados para finalizar sua refeição', 1, 16, '2025-06-04 20:31:15', '2025-06-05 18:48:01', 1, NULL),
(94, 'Kids', 'Pratos divertidos para os pequenos', 1, 17, '2025-06-04 20:31:21', '2025-06-05 18:48:01', 1, NULL),
(95, 'Sashimis', 'Fatias delicadas de peixes frescos, um clássico japonês', 1, 2, '2025-06-04 19:09:57', '2025-06-04 20:25:36', 5, NULL),
(96, 'Carpaccios', 'Finas lâminas de peixe com toques cítricos e frescos', 1, 3, '2025-06-04 20:25:50', '2025-06-04 20:25:50', 5, NULL),
(97, 'Niguiris', 'Bolinhos de arroz com peixes frescos, simples e elegantes', 1, 4, '2025-06-04 20:27:03', '2025-06-04 20:30:12', 5, NULL),
(98, 'Uramakis', 'Rolos invertidos com recheios criativos e saborosos', 1, 5, '2025-06-04 20:27:11', '2025-06-04 20:27:11', 5, NULL),
(99, 'Acelgamakis', 'Rolos especiais com ingredientes frescos e únicos', 1, 6, '2025-06-04 20:27:29', '2025-06-04 20:27:29', 5, NULL),
(100, 'Hossomakis', 'Rolinhos tradicionais, pequenos e cheios de sabor', 1, 7, '2025-06-04 20:27:55', '2025-06-04 20:27:55', 5, NULL),
(101, 'Temakis', 'Cones de alga recheados com sabores autênticos', 1, 8, '2025-06-04 20:28:52', '2025-06-04 20:28:52', 5, NULL),
(102, 'Dyos', 'Duplas de sushi com combinações surpreendentes', 1, 9, '2025-06-04 20:29:58', '2025-06-04 20:30:02', 5, NULL),
(103, 'Chapas', 'Pratos quentes grelhados com toque oriental', 1, 10, '2025-06-04 20:30:25', '2025-06-04 20:30:25', 5, NULL),
(104, 'Hot Rolls', 'Rolos fritos, crocantes e irresistíveis', 1, 11, '2025-06-04 20:30:32', '2025-06-04 20:30:32', 5, NULL),
(105, 'Harumakis', 'Rolinhos primavera com recheios leves e crocantes', 1, 12, '2025-06-04 20:30:38', '2025-06-04 20:30:38', 5, NULL),
(106, 'Estilo Pasteis', 'Pasteis com inspiração japonesa, leves e saborosos', 1, 13, '2025-06-04 20:30:52', '2025-06-04 20:30:52', 5, NULL),
(107, 'Especial MAAD', 'Criações exclusivas do chef, uma explosão de sabores', 1, 14, '2025-06-04 20:31:00', '2025-06-04 20:31:00', 5, NULL),
(108, 'Outros', 'Opções variadas para todos os gostos', 1, 15, '2025-06-04 20:31:08', '2025-06-04 20:31:08', 5, NULL),
(109, 'Sobremesas', 'Doces delicados para finalizar sua refeição', 1, 16, '2025-06-04 20:31:15', '2025-06-04 20:31:15', 5, NULL),
(110, 'Kids', 'Pratos divertidos para os pequenos', 1, 17, '2025-06-04 20:31:21', '2025-06-04 20:31:21', 5, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `groups`
--

CREATE TABLE `groups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `type` enum('rodizio','a_la_carte','bebidas') NOT NULL DEFAULT 'a_la_carte',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `icon_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `groups`
--

INSERT INTO `groups` (`id`, `name`, `description`, `price`, `type`, `active`, `sort_order`, `created_at`, `updated_at`, `icon_id`) VALUES
(1, 'Premium', 'Itens inclusos no rodízio premium', 189.00, 'rodizio', 1, 2, '2025-05-31 14:28:06', '2025-06-06 20:44:52', 40),
(4, 'Tradicional', 'Itens inclusos no rodízio tradicional', 129.00, 'rodizio', 1, 1, '2025-05-31 14:28:06', '2025-06-06 20:44:33', 38),
(5, 'À la Carte', 'Itens vendidos separadamente', NULL, 'a_la_carte', 1, 3, '2025-05-31 14:28:06', '2025-06-04 22:40:29', 53),
(16, 'Bebidas', NULL, NULL, 'bebidas', 1, 4, '2025-06-04 17:16:41', '2025-06-06 20:45:10', 55),
(17, 'Bebidas Alcoólicas', NULL, NULL, 'bebidas', 1, 5, '2025-06-04 17:17:04', '2025-06-06 20:45:03', 56),
(18, 'Vinhos', NULL, NULL, 'bebidas', 1, 6, '2025-06-04 17:17:20', '2025-06-06 20:45:07', 54);

-- --------------------------------------------------------

--
-- Estrutura da tabela `icons`
--

CREATE TABLE `icons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'general',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `icons`
--

INSERT INTO `icons` (`id`, `name`, `slug`, `file_path`, `category`, `active`, `sort_order`, `created_at`, `updated_at`) VALUES
(38, 'Tradicional', 'tradicional', 'icons/sunomono_1749065951.svg', 'general', 1, 1, '2025-06-02 09:46:14', '2025-06-06 05:25:04'),
(40, 'Premium', 'premium', 'icons/entradas_1749065962.svg', 'general', 1, 0, '2025-06-03 15:38:58', '2025-06-06 05:25:10'),
(53, 'A la carte', 'a-la-carte', 'icons/dasdsadsa_1749065934.svg', 'general', 1, 2, '2025-06-03 20:08:40', '2025-06-04 22:39:34'),
(54, 'Vinhos', 'vinhos', 'icons/vinhos_1749065515.svg', 'drinks', 1, 3, '2025-06-03 23:03:42', '2025-06-04 22:31:55'),
(55, 'Bebidas', 'bebidas', 'icons/bebidas_1749065503.svg', 'drinks', 1, 4, '2025-06-03 23:13:42', '2025-06-04 22:31:43'),
(56, 'Bebidas Alcoólicas', 'bebidas-alcoolicas', 'icons/testye_1749065237.svg', 'drinks', 1, 5, '2025-06-04 22:22:39', '2025-06-04 22:31:24');

-- --------------------------------------------------------

--
-- Estrutura da tabela `items`
--

CREATE TABLE `items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `group_id` bigint(20) UNSIGNED NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `available` tinyint(1) NOT NULL DEFAULT 1,
  `spicy` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `printer_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `items`
--

INSERT INTO `items` (`id`, `name`, `description`, `quantity`, `price`, `image`, `category_id`, `group_id`, `active`, `available`, `spicy`, `sort_order`, `created_at`, `updated_at`, `printer_id`) VALUES
(1, 'Salada da Casa', 'Vinagrete de camarão, sunomono, gengibre, ceviche e nachos de salmão', NULL, NULL, NULL, 77, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(2, 'Sunomono', 'Finas fatias de pepino japonês curtidas no molho agridoce', NULL, NULL, NULL, 77, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(3, 'Vinagrete de Camarão', 'Camarões marinados com legumes frescos em um vinagrete cítrico e aromático', NULL, NULL, NULL, 77, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(4, 'Ceviche', 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça, salsinha, cebola roxa, molho de pimenta e azeite extra virgem', NULL, NULL, NULL, 77, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(5, 'Ceviche Especial', 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça, salsinha, cebola roxa, molho de pimenta e azeite extra virgem', NULL, NULL, NULL, 77, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(6, 'Tartar', 'Salmão finamente picado com molho especial, marinado na cebola roxa.', NULL, NULL, NULL, 77, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(7, 'Sashimi Salmão', 'Fatias frescas de salmão, perfeitas para os amantes de peixe cru', NULL, NULL, NULL, 79, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(8, 'Sashimi Atum', 'Fatias delicadas de atum, com sabor intenso e textura suave', NULL, NULL, NULL, 79, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(9, 'Sashimi Peixe Prego/Limão', 'Fatias de peixe prego com um toque refrescante de limão', NULL, NULL, NULL, 79, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(10, 'Sashimi Tilápia', 'Fatias leves e frescas de tilápia, com sabor suave', NULL, NULL, NULL, 79, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(11, 'Sashimi Polvo', 'Fatias finas de polvo, com textura única e sabor marcante', NULL, NULL, NULL, 79, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(12, 'Carpaccio Salmão Trufado', 'Finas lâminas de salmão com toque sofisticado de trufas', NULL, NULL, NULL, 80, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(13, 'Carpaccio Polvo Trufado', 'Lâminas de polvo com aroma refinado de trufas', NULL, NULL, NULL, 80, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(14, 'Carpaccio Camarão Trufado', 'Camarões em fatias finas com toque especial de trufas', NULL, NULL, NULL, 80, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(15, 'Carpaccio Misto Trufado', 'Combinação de peixes e frutos do mar com sabor trufado', NULL, NULL, NULL, 80, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(16, 'Niguiri Salmão', 'Bolinho de arroz com fatia fresca de salmão', NULL, NULL, NULL, 81, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(17, 'Niguiri Salmão Especial', 'Salmão selecionado sobre arroz, com toque especial do chef', NULL, NULL, NULL, 81, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(18, 'Niguiri Atum', 'Bolinho de arroz com atum fresco e sabor marcante', NULL, NULL, NULL, 81, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(19, 'Niguiri Polvo', 'Arroz coberto com fatia de polvo, textura única', NULL, NULL, NULL, 81, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(20, 'Niguiri Camarão', 'Camarão selecionado sobre bolinho de arroz', NULL, NULL, NULL, 81, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(21, 'Niguiri Salmão Fry Ouro', 'Salmão frito com toque dourado sobre arroz', NULL, NULL, NULL, 81, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(22, 'Uramaki Salmão', 'Rolo invertido com salmão fresco e recheio cremoso', NULL, NULL, NULL, 82, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(23, 'Uramaki Atum', 'Rolo com atum fresco e toque de molho especial', NULL, NULL, NULL, 82, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(24, 'Uramaki Camarão', 'Rolo invertido com camarão suculento e molho delicado', NULL, NULL, NULL, 82, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(25, 'Uramaki California', 'Rolo com kani, pepino e manga, refrescante e leve', NULL, NULL, NULL, 82, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(26, 'Uramaki Filadélfia', 'Rolo com salmão, cream cheese e toque de cebolinha', NULL, NULL, NULL, 82, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(27, 'Uramaki Filadélfia Fry', 'Rolo frito com salmão, cream cheese e crocância', NULL, NULL, NULL, 82, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(28, 'Uramaki Salmão Fry', 'Rolo frito com salmão, crocante e saboroso', NULL, NULL, NULL, 82, 1, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(29, 'Uramaki Salmão Mel Fry', 'Rolo frito com salmão e toque doce de mel', NULL, NULL, NULL, 82, 1, 1, 1, 0, 8, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(30, 'Uramaki Salmão Fry Ouro', 'Rolo frito com salmão e toque premium dourado', NULL, NULL, NULL, 82, 1, 1, 1, 0, 9, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(31, 'Uramaki Camarão Fry Ouro', 'Rolo frito com camarão e toque dourado especial', NULL, NULL, NULL, 82, 1, 1, 1, 0, 10, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(32, 'Acelgamaki Salmão', 'Rolo especial com salmão fresco e ingredientes únicos', NULL, NULL, NULL, 83, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(33, 'Acelgamaki Salmão Fry', 'Rolo especial frito com salmão, crocante e saboroso', NULL, NULL, NULL, 83, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(34, 'Acelgamaki Atum', 'Rolo especial com atum e combinação única de sabores', NULL, NULL, NULL, 83, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-09 03:46:08', NULL),
(35, 'Shakemaki', 'Hossomaki com salmão fresco, simples e clássico', NULL, NULL, NULL, 84, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(36, 'Kappamaki', 'Hossomaki com pepino, leve e refrescante', NULL, NULL, NULL, 84, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(37, 'Tekamaki', 'Hossomaki com atum, puro e tradicional', NULL, NULL, NULL, 84, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(38, 'Temaki Salmão', 'Cone de alga com salmão fresco e recheio cremoso', NULL, NULL, NULL, 85, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(39, 'Temaki Salmão Fry', 'Cone de alga com salmão frito, crocante e saboroso', NULL, NULL, NULL, 85, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(40, 'Temaki Atum', 'Cone de alga com atum fresco e molho especial', NULL, NULL, NULL, 85, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(41, 'Temaki Camarão', 'Cone de alga com camarão suculento e recheio leve', NULL, NULL, NULL, 85, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(42, 'Temaki California', 'Cone de alga com kani, pepino e manga, bem refrescante', NULL, NULL, NULL, 85, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(43, 'Temaki Skin Fry', 'Cone de alga com pele de salmão frita, crocante e única', NULL, NULL, NULL, 85, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(44, 'Temaki Hot Roll', 'Cone de alga com rolo frito, quente e irresistível', NULL, NULL, NULL, 85, 1, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(45, 'Joe Salmão', 'Dupla de sushi com salmão fresco e molho delicado', NULL, NULL, NULL, 86, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(46, 'Joe Camarão', 'Dupla de sushi com camarão e toque especial do chef', NULL, NULL, NULL, 86, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(47, 'Joe Geleia Framboesa', 'Dupla de sushi com geleia de framboesa, doce e única', NULL, NULL, NULL, 86, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(48, 'Joe Sugar', 'Dupla de sushi com toque açucarado e criativo', NULL, NULL, NULL, 86, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(49, 'Joe Couve Fry', 'Dupla de sushi com couve frita, crocante e original', NULL, NULL, NULL, 86, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(50, 'Joe Shimeji', 'Dupla de sushi com shimeji, saboroso e delicado', NULL, NULL, NULL, 86, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(51, 'Chapa Shimeji', 'Cogumelos shimeji grelhados com molho oriental', NULL, NULL, NULL, 87, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(52, 'Chapa Shitake', 'Cogumelos shitake grelhados com toque asiático', NULL, NULL, NULL, 87, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(53, 'Chapa Mista', 'Mix de frutos do mar grelhados com molho especial', NULL, NULL, NULL, 87, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(54, 'Chapa Polvo', 'Polvo grelhado com temperos orientais, suculento', NULL, NULL, NULL, 87, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(55, 'Chapa Salmão', 'Salmão grelhado com molho leve e aromático', NULL, NULL, NULL, 87, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(56, 'Chapa Camarão', 'Camarões grelhados com toque oriental, irresistíveis', NULL, NULL, NULL, 87, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(57, 'Hot Roll Salmão', 'Rolo frito com salmão, crocante e delicioso', NULL, NULL, NULL, 88, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(58, 'Hot Roll Camarão', 'Rolo frito com camarão, quente e saboroso', NULL, NULL, NULL, 88, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(59, 'Hot Roll Shimeji', 'Rolo frito com shimeji, leve e crocante', NULL, NULL, NULL, 88, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(60, 'Hot Roll Filadelfia', 'Rolo frito com salmão e cream cheese, irresistível', NULL, NULL, NULL, 88, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(61, 'Hot Roll Doritos', 'Rolo frito com toque crocante de Doritos', NULL, NULL, NULL, 88, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(62, 'Harumaki Queijo', 'Rolinho primavera com recheio cremoso de queijo', NULL, NULL, NULL, 89, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(63, 'Harumaki Legumes', 'Rolinho primavera com legumes frescos e crocantes', NULL, NULL, NULL, 89, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(64, 'Harumaki Filadelfia', 'Rolinho primavera com salmão e cream cheese', NULL, NULL, NULL, 89, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(65, 'Pastel Salmão', 'Pastel crocante com recheio de salmão fresco', NULL, NULL, NULL, 90, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(66, 'Pastel Camarão', 'Pastel com camarão suculento e temperos orientais', NULL, NULL, NULL, 90, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(67, 'Pastel Bacalhau', 'Pastel com recheio de bacalhau, rico e saboroso', NULL, NULL, NULL, 90, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(68, 'Guioza Suína', 'Pastelzinho japonês com recheio suculento de carne suína', NULL, NULL, NULL, 90, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(69, 'Guioza Bovina', 'Pastelzinho japonês com recheio de carne bovina', NULL, NULL, NULL, 90, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(70, 'Salmão MAAD', 'Criação exclusiva com salmão, cheia de sabor', NULL, NULL, NULL, 91, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(71, 'Camarão MAAD', 'Criação única com camarão, surpreendente e deliciosa', NULL, NULL, NULL, 91, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(72, 'Atum MAAD', 'Criação especial com atum, rica em sabores', NULL, NULL, NULL, 91, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(73, 'Kaka MAAD', 'Combinação exclusiva do chef, única e inesquecível', NULL, NULL, NULL, 91, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(74, 'Ebi Hot Shake MAAD', 'Criação quente com camarão, vibrante e saborosa', NULL, NULL, NULL, 91, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(75, 'Dubai MAAD', 'Criação premium com toque exótico e sofisticado', NULL, NULL, NULL, 91, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(76, 'Fire MAAD', 'Criação ousada com toque quente e sabor marcante', NULL, NULL, NULL, 91, 1, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(77, 'Batera Salmão', 'Sushi prensado com salmão fresco e molho especial', NULL, NULL, NULL, 92, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(78, 'Batera Atum', 'Sushi prensado com atum, rico e saboroso', NULL, NULL, NULL, 92, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(79, 'Lula Com Salmão', 'Combinação de lula e salmão, fresca e harmoniosa', NULL, NULL, NULL, 92, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(80, 'Polvo no gelo', 'Polvo servido gelado com toque refrescante', NULL, NULL, NULL, 92, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(81, 'Yakissoba Carne', 'Macarrão frito com carne e legumes, ao molho oriental', NULL, NULL, NULL, 92, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(82, 'Yakissoba Frango', 'Macarrão frito com frango e legumes, saboroso', NULL, NULL, NULL, 92, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(83, 'Yakissoba Frutos do Mar', 'Macarrão frito com frutos do mar, rico e suculento', NULL, NULL, NULL, 92, 1, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(84, 'Kibe Atum', 'Kibe com recheio de atum, crocante e original', NULL, NULL, NULL, 92, 1, 1, 1, 0, 8, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(85, 'Tempura Legumes', 'Legumes fritos em massa leve, crocantes e saborosos', NULL, NULL, NULL, 92, 1, 1, 1, 0, 9, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(86, 'Tempura Camarão', 'Camarões fritos em tempura, leves e crocantes', NULL, NULL, NULL, 92, 1, 1, 1, 0, 10, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(87, 'Roru Tomato', 'Rolo especial com toque de tomate, fresco e único', NULL, NULL, NULL, 92, 1, 1, 1, 0, 11, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(88, 'Missoshiro', 'Sopa tradicional japonesa com missô e tofu', NULL, NULL, NULL, 92, 1, 1, 1, 0, 12, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(89, 'Gohan', 'Arroz japonês simples, perfeito para acompanhar', NULL, NULL, NULL, 92, 1, 1, 10, 0, 13, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(90, 'Ishigo', 'Sobremesa leve com morangos frescos', NULL, NULL, NULL, 93, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(91, 'Hot Roll Doce', 'Rolo frito doce, com recheio cremoso e delicioso', NULL, NULL, NULL, 93, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(92, 'Nachos com Sorvete2', 'Nachos doces com sorvete, sobremesa divertida', NULL, NULL, NULL, 93, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(93, 'Banana Fry Doce De Leite', 'Banana frita com doce de leite, quente e doce', NULL, NULL, NULL, 93, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(94, 'Banana Fry Nutella', 'Banana frita com Nutella, cremosa e irresistível', NULL, NULL, NULL, 93, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(95, 'Harumaki Romeu e Julieta', 'Rolinho doce com goiabada e queijo, clássico e delicioso', NULL, NULL, NULL, 93, 1, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(96, 'Porção Tilápia Empanada', 'Tilápia empanada, crocante e ideal para crianças', NULL, NULL, NULL, 94, 1, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(97, 'Porção Frango Empanado', 'Frango empanado, suculento e perfeito para os pequenos', NULL, NULL, NULL, 94, 1, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(98, 'Porção Batata Frita', 'Batatas fritas crocantes, adoradas pelas crianças', NULL, NULL, NULL, 94, 1, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(99, 'Prato Frango com Fritas', 'Frango grelhado com batatas fritas, simples e gostoso', NULL, NULL, NULL, 94, 1, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(100, 'Prato Tilápia com Fritas', 'Tilápia grelhada com batatas fritas, leve e delicioso', NULL, NULL, NULL, 94, 1, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(101, 'Salada da Casa', 'Vinagrete de camarão, sunomono, gengibre, ceviche e nachos de salmão', NULL, NULL, 'items/wxgSNwITIKV3u449tkUGNpwptyHzm8AgUlfO8SjF.jpg', 18, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-09-05 01:53:34', NULL),
(102, 'Sunomono', 'Finas fatias de pepino japonês curtidas no molho agridoce', NULL, NULL, 'items/peRnNe4ugxerPqbHqYoscS9VHooak9dAXRxgDcM6.jpg', 18, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-09-05 01:53:34', NULL),
(103, 'Ceviche', 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça, salsinha, cebola roxa, molho de pimenta e azeite extra virgem', NULL, NULL, NULL, 18, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-09-05 01:53:34', NULL),
(104, 'Tartar', 'Salmão finamente picado com molho especial, marinado na cebola roxa.', NULL, NULL, NULL, 18, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-09-05 01:53:34', NULL),
(105, 'Sashimi Salmão', 'Fatias frescas de salmão, perfeitas para os amantes de peixe cru', NULL, NULL, NULL, 60, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(106, 'Sashimi Atum', 'Fatias delicadas de atum, com sabor intenso e textura suave', NULL, NULL, NULL, 60, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(107, 'Sashimi Peixe Prego/Limão', 'Fatias de peixe prego com um toque refrescante de limão', NULL, NULL, NULL, 60, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(108, 'Sashimi Tilápia', 'Fatias leves e frescas de tilápia, com sabor suave', NULL, NULL, NULL, 60, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(109, 'Carpaccio Salmão Trufado', 'Finas lâminas de salmão com toque sofisticado de trufas', NULL, NULL, NULL, 61, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(110, 'Niguiri Salmão', 'Bolinho de arroz com fatia fresca de salmão', NULL, NULL, NULL, 62, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(111, 'Niguiri Atum', 'Bolinho de arroz com atum fresco e sabor marcante', NULL, NULL, NULL, 62, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(112, 'Uramaki Salmão', 'Rolo invertido com salmão fresco e recheio cremoso', NULL, NULL, NULL, 63, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(113, 'Uramaki Atum', 'Rolo com atum fresco e toque de molho especial', NULL, NULL, NULL, 63, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(114, 'Uramaki California', 'Rolo com kani, pepino e manga, refrescante e leve', NULL, NULL, NULL, 63, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(115, 'Uramaki Filadélfia', 'Rolo com salmão, cream cheese e toque de cebolinha', NULL, NULL, NULL, 63, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(116, 'Uramaki Filadélfia Fry', 'Rolo frito com salmão, cream cheese e crocância', NULL, NULL, NULL, 63, 4, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(117, 'Uramaki Salmão Fry', 'Rolo frito com salmão, crocante e saboroso', NULL, NULL, NULL, 63, 4, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(118, 'Uramaki Salmão Mel Fry', 'Rolo frito com salmão e toque doce de mel', NULL, NULL, NULL, 63, 4, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(119, 'Acelgamaki Salmão', 'Rolo especial com salmão fresco e ingredientes únicos', NULL, NULL, NULL, 65, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(120, 'Acelgamaki Salmão Fry', 'Rolo especial frito com salmão, crocante e saboroso', NULL, NULL, NULL, 65, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(121, 'Acelgamaki Atum', 'Rolo especial com atum e combinação única de sabores', NULL, NULL, NULL, 65, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-09 03:46:12', NULL),
(122, 'Shakemaki', 'Hossomaki com salmão fresco, simples e clássico', NULL, NULL, NULL, 66, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(123, 'Kappamaki', 'Hossomaki com pepino, leve e refrescante', NULL, NULL, NULL, 66, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(124, 'Tekamaki', 'Hossomaki com atum, puro e tradicional', NULL, NULL, NULL, 66, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(125, 'Temaki Salmão', 'Cone de alga com salmão fresco e recheio cremoso', NULL, NULL, NULL, 67, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(126, 'Temaki Salmão Fry', 'Cone de alga com salmão frito, crocante e saboroso', NULL, NULL, NULL, 67, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(127, 'Temaki Atum', 'Cone de alga com atum fresco e molho especial', NULL, NULL, NULL, 67, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(128, 'Temaki California', 'Cone de alga com kani, pepino e manga, bem refrescante', NULL, NULL, NULL, 67, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(129, 'Temaki Skin Fry', 'Cone de alga com pele de salmão frita, crocante e única', NULL, NULL, NULL, 67, 4, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(130, 'Temaki Hot Roll', 'Cone de alga com rolo frito, quente e irresistível', NULL, NULL, NULL, 67, 4, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(131, 'Joe Salmão', 'Dupla de sushi com salmão fresco e molho delicado', NULL, NULL, NULL, 68, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(132, 'Joe Geleia Framboesa', 'Dupla de sushi com geleia de framboesa, doce e única', NULL, NULL, NULL, 68, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(133, 'Joe Sugar', 'Dupla de sushi com toque açucarado e criativo', NULL, NULL, NULL, 68, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(134, 'Joe Couve Fry', 'Dupla de sushi com couve frita, crocante e original', NULL, NULL, NULL, 68, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(135, 'Joe Shimeji', 'Dupla de sushi com shimeji, saboroso e delicado', NULL, NULL, NULL, 68, 4, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(136, 'Chapa Shimeji', 'Cogumelos shimeji grelhados com molho oriental', NULL, NULL, NULL, 69, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(137, 'Chapa Shitake', 'Cogumelos shitake grelhados com toque asiático', NULL, NULL, NULL, 69, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(138, 'Chapa Salmão', 'Salmão grelhado com molho leve e aromático', NULL, NULL, NULL, 69, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(139, 'Hot Roll Salmão', 'Rolo frito com salmão, crocante e delicioso', NULL, NULL, NULL, 70, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(140, 'Hot Roll Shimeji', 'Rolo frito com shimeji, leve e crocante', NULL, NULL, NULL, 70, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(141, 'Hot Roll Filadelfia', 'Rolo frito com salmão e cream cheese, irresistível', NULL, NULL, NULL, 70, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(142, 'Hot Roll Doritos', 'Rolo frito com toque crocante de Doritos', NULL, NULL, NULL, 70, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(143, 'Harumaki Queijo', 'Rolinho primavera com recheio cremoso de queijo', NULL, NULL, NULL, 71, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(144, 'Harumaki Legumes', 'Rolinho primavera com legumes frescos e crocantes', NULL, NULL, NULL, 71, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(145, 'Harumaki Filadelfia', 'Rolinho primavera com salmão e cream cheese', NULL, NULL, NULL, 71, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(146, 'Pastel Salmão', 'Pastel crocante com recheio de salmão fresco', NULL, NULL, NULL, 72, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(147, 'Guioza Suína', 'Pastelzinho japonês com recheio suculento de carne suína', NULL, NULL, NULL, 72, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(148, 'Guioza Bovina', 'Pastelzinho japonês com recheio de carne bovina', NULL, NULL, NULL, 72, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(149, 'Fire MAAD', 'Criação ousada com toque quente e sabor marcante', NULL, NULL, NULL, 73, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(150, 'Batera Salmão', 'Sushi prensado com salmão fresco e molho especial', NULL, NULL, NULL, 74, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(151, 'Batera Atum', 'Sushi prensado com atum, rico e saboroso', NULL, NULL, NULL, 74, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(152, 'Yakissoba Carne', 'Macarrão frito com carne e legumes, ao molho oriental', NULL, NULL, NULL, 74, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(153, 'Yakissoba Frango', 'Macarrão frito com frango e legumes, saboroso', NULL, NULL, NULL, 74, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(154, 'Kibe Atum', 'Kibe com recheio de atum, crocante e original', NULL, NULL, NULL, 74, 4, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(155, 'Tempura Legumes', 'Legumes fritos em massa leve, crocantes e saborosos', NULL, NULL, NULL, 74, 4, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(156, 'Missoshiro', 'Sopa tradicional japonesa com missô e tofu', NULL, NULL, NULL, 74, 4, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(157, 'Gohan', 'Arroz japonês simples, perfeito para acompanhar', NULL, NULL, NULL, 74, 4, 1, 1, 0, 8, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(158, 'Ishigo', 'Sobremesa leve com morangos frescos', NULL, NULL, NULL, 75, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(159, 'Hot Roll Doce', 'Rolo frito doce, com recheio cremoso e delicioso', NULL, NULL, NULL, 75, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(160, 'Nachos com Sorvete', 'Nachos doces com sorvete, sobremesa divertida', NULL, NULL, NULL, 75, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(161, 'Banana Fry Doce De Leite', 'Banana frita com doce de leite, quente e doce', NULL, NULL, NULL, 75, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(162, 'Banana Fry Nutella', 'Banana frita com Nutella, cremosa e irresistível', NULL, NULL, NULL, 75, 4, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(163, 'Harumaki Romeu e Julieta', 'Rolinho doce com goiabada e queijo, clássico e delicioso', NULL, NULL, NULL, 75, 4, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(164, 'Porção Tilápia Empanada', 'Tilápia empanada, crocante e ideal para crianças', NULL, NULL, NULL, 76, 4, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(165, 'Porção Frango Empanado', 'Frango empanado, suculento e perfeito para os pequenos', NULL, NULL, NULL, 76, 4, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(166, 'Porção Batata Frita', 'Batatas fritas crocantes, adoradas pelas crianças', NULL, NULL, NULL, 76, 4, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(167, 'Prato Frango com Fritas', 'Frango grelhado com batatas fritas, simples e gostoso', NULL, NULL, NULL, 76, 4, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(168, 'Prato Tilápia com Fritas', 'Tilápia grelhada com batatas fritas, leve e delicioso', NULL, NULL, NULL, 76, 4, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(169, 'Salada da Casa', 'Vinagrete de camarão, sunomono, gengibre, ceviche e nachos de salmão', 'porção 300g', 35.00, NULL, 78, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(170, 'Sunomono', 'Finas fatias de pepino japonês curtidas no molho agridoce', 'porção 200g', 15.00, NULL, 78, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(171, 'Vinagrete de Camarão', 'Camarões marinados com legumes frescos em um vinagrete cítrico e aromático', 'porção 200g', 30.00, NULL, 78, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(172, 'Ceviche', 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça, salsinha, cebola roxa, molho de pimenta e azeite extra virgem', 'porção 200g', 25.00, NULL, 78, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(173, 'Ceviche Especial', 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça, salsinha, cebola roxa, molho de pimenta e azeite extra virgem', 'porção 200g', 30.00, NULL, 78, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(174, 'Tartar', 'Salmão finamente picado com molho especial, marinado na cebola roxa.', 'porção 200g', 28.00, NULL, 78, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(175, 'Sashimi Salmão', 'Fatias frescas de salmão, perfeitas para os amantes de peixe cru', '8 unidades', 25.00, NULL, 95, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(176, 'Sashimi Atum', 'Fatias delicadas de atum, com sabor intenso e textura suave', '8 unidades', 28.00, NULL, 95, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(177, 'Sashimi Peixe Prego/Limão', 'Fatias de peixe prego com um toque refrescante de limão', '8 unidades', 24.00, NULL, 95, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(178, 'Sashimi Tilápia', 'Fatias leves e frescas de tilápia, com sabor suave', '8 unidades', 22.00, NULL, 95, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(179, 'Sashimi Polvo', 'Fatias finas de polvo, com textura única e sabor marcante', '8 unidades', 35.00, NULL, 95, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(180, 'Carpaccio Salmão Trufado', 'Finas lâminas de salmão com toque sofisticado de trufas', 'porção 200g', 30.00, NULL, 96, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(181, 'Carpaccio Polvo Trufado', 'Lâminas de polvo com aroma refinado de trufas', 'porção 200g', 38.00, NULL, 96, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(182, 'Carpaccio Camarão Trufado', 'Camarões em fatias finas com toque especial de trufas', 'porção 200g', 40.00, NULL, 96, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(184, 'Carpaccio Misto Trufado', 'Combinação de peixes e frutos do mar com sabor trufado', 'porção 200g', 38.00, NULL, 96, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(185, 'Niguiri Salmão', 'Bolinho de arroz com fatia fresca de salmão', '8 unidades', 20.00, NULL, 97, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(186, 'Niguiri Salmão Especial', 'Salmão selecionado sobre arroz, com toque especial do chef', '8 unidades', 28.00, NULL, 97, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(187, 'Niguiri Atum', 'Bolinho de arroz com atum fresco e sabor marcante', '8 unidades', 22.00, NULL, 97, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(188, 'Niguiri Polvo', 'Arroz coberto com fatia de polvo, textura única', '8 unidades', 30.00, NULL, 97, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(189, 'Niguiri Camarão', 'Camarão selecionado sobre bolinho de arroz', '8 unidades', 32.00, NULL, 97, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(190, 'Niguiri Salmão Fry Ouro', 'Salmão frito com toque dourado sobre arroz', '8 unidades', 30.00, NULL, 97, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(191, 'Uramaki Salmão', 'Rolo invertido com salmão fresco e recheio cremoso', '8 unidades', 22.00, NULL, 98, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(192, 'Uramaki Atum', 'Rolo com atum fresco e toque de molho especial', '8 unidades', 24.00, NULL, 98, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(193, 'Uramaki Camarão', 'Rolo invertido com camarão suculento e molho delicado', '8 unidades', 30.00, NULL, 98, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(194, 'Uramaki California', 'Rolo com kani, pepino e manga, refrescante e leve', '8 unidades', 18.00, NULL, 98, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(195, 'Uramaki Filadélfia', 'Rolo com salmão, cream cheese e toque de cebolinha', '8 unidades', 22.00, NULL, 98, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(196, 'Uramaki Filadélfia Fry', 'Rolo frito com salmão, cream cheese e crocância', '8 unidades', 25.00, NULL, 98, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(197, 'Uramaki Salmão Fry', 'Rolo frito com salmão, crocante e saboroso', '8 unidades', 24.00, NULL, 98, 5, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(198, 'Uramaki Salmão Mel Fry', 'Rolo frito com salmão e toque doce de mel', '8 unidades', 26.00, NULL, 98, 5, 1, 1, 0, 8, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(199, 'Uramaki Salmão Fry Ouro', 'Rolo frito com salmão e toque premium dourado', '8 unidades', 30.00, NULL, 98, 5, 1, 1, 0, 9, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(200, 'Uramaki Camarão Fry Ouro', 'Rolo frito com camarão e toque dourado especial', '8 unidades', 32.00, NULL, 98, 5, 1, 1, 0, 10, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(201, 'Acelgamaki Salmão', 'Rolo especial com salmão fresco e ingredientes únicos', '8 unidades', 24.00, NULL, 99, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(202, 'Acelgamaki Salmão Fry', 'Rolo especial frito com salmão, crocante e saboroso', '8 unidades', 26.00, NULL, 99, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(203, 'Acelgamaki Atum', 'Rolo especial com atum e combinação única de sabores', '8 unidades', 25.00, NULL, 99, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-09 03:46:09', NULL),
(204, 'Shakemaki', 'Hossomaki com salmão fresco, simples e clássico', '8 unidades', 18.00, NULL, 100, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(205, 'Kappamaki', 'Hossomaki com pepino, leve e refrescante', '8 unidades', 15.00, NULL, 100, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(206, 'Tekamaki', 'Hossomaki com atum, puro e tradicional', '8 unidades', 18.00, NULL, 100, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(207, 'Temaki Salmão', 'Cone de alga com salmão fresco e recheio cremoso', '8 unidades', 22.00, NULL, 101, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(208, 'Temaki Salmão Fry', 'Cone de alga com salmão frito, crocante e saboroso', '8 unidades', 24.00, NULL, 101, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(209, 'Temaki Atum', 'Cone de alga com atum fresco e molho especial', '8 unidades', 23.00, NULL, 101, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(210, 'Temaki Camarão', 'Cone de alga com camarão suculento e recheio leve', '8 unidades', 30.00, NULL, 101, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(211, 'Temaki California', 'Cone de alga com kani, pepino e manga, bem refrescante', '8 unidades', 20.00, NULL, 101, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(212, 'Temaki Skin Fry', 'Cone de alga com pele de salmão frita, crocante e única', '8 unidades', 22.00, NULL, 101, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(213, 'Temaki Hot Roll', 'Cone de alga com rolo frito, quente e irresistível', '8 unidades', 24.00, NULL, 101, 5, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(214, 'Joe Salmão', 'Dupla de sushi com salmão fresco e molho delicado', '8 unidades', 22.00, NULL, 102, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(215, 'Joe Camarão', 'Dupla de sushi com camarão e toque especial do chef', '8 unidades', 30.00, NULL, 102, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(216, 'Joe Geleia Framboesa', 'Dupla de sushi com geleia de framboesa, doce e única', '8 unidades', 25.00, NULL, 102, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(217, 'Joe Sugar', 'Dupla de sushi com toque açucarado e criativo', '8 unidades', 24.00, NULL, 102, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(218, 'Joe Couve Fry', 'Dupla de sushi com couve frita, crocante e original', '8 unidades', 24.00, NULL, 102, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(219, 'Joe Shimeji', 'Dupla de sushi com shimeji, saboroso e delicado', '8 unidades', 23.00, NULL, 102, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(220, 'Chapa Shimeji', 'Cogumelos shimeji grelhados com molho oriental', 'porção 300g', 28.00, NULL, 103, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(221, 'Chapa Shitake', 'Cogumelos shitake grelhados com toque asiático', 'porção 300g', 30.00, NULL, 103, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(222, 'Chapa Mista', 'Mix de frutos do mar grelhados com molho especial', 'porção 300g', 45.00, NULL, 103, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(223, 'Chapa Polvo', 'Polvo grelhado com temperos orientais, suculento', 'porção 300g', 48.00, NULL, 103, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(224, 'Chapa Salmão', 'Salmão grelhado com molho leve e aromático', 'porção 300g', 40.00, NULL, 103, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(225, 'Chapa Camarão', 'Camarões grelhados com toque oriental, irresistíveis', 'porção 300g', 45.00, NULL, 103, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(226, 'Hot Roll Salmão', 'Rolo frito com salmão, crocante e delicioso', '8 unidades', 22.00, NULL, 104, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(227, 'Hot Roll Camarão', 'Rolo frito com camarão, quente e saboroso', '8 unidades', 30.00, NULL, 104, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(228, 'Hot Roll Shimeji', 'Rolo frito com shimeji, leve e crocante', '8 unidades', 20.00, NULL, 104, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(229, 'Hot Roll Filadelfia', 'Rolo frito com salmão e cream cheese, irresistível', '8 unidades', 24.00, NULL, 104, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(230, 'Hot Roll Doritos', 'Rolo frito com toque crocante de Doritos', '8 unidades', 22.00, NULL, 104, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(231, 'Harumaki Queijo', 'Rolinho primavera com recheio cremoso de queijo', '8 unidades', 18.00, NULL, 105, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(232, 'Harumaki Legumes', 'Rolinho primavera com legumes frescos e crocantes', '8 unidades', 16.00, NULL, 105, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(233, 'Harumaki Filadelfia', 'Rolinho primavera com salmão e cream cheese', '8 unidades', 20.00, NULL, 105, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(234, 'Pastel Salmão', 'Pastel crocante com recheio de salmão fresco', '8 unidades', 22.00, NULL, 106, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(235, 'Pastel Camarão', 'Pastel com camarão suculento e temperos orientais', '8 unidades', 28.00, NULL, 106, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(236, 'Pastel Bacalhau', 'Pastel com recheio de bacalhau, rico e saboroso', '8 unidades', 30.00, NULL, 106, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(237, 'Guioza Suína', 'Pastelzinho japonês com recheio suculento de carne suína', '8 unidades', 20.00, NULL, 106, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(238, 'Guioza Bovina', 'Pastelzinho japonês com recheio de carne bovina', '8 unidades', 20.00, NULL, 106, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(239, 'Salmão MAAD', 'Criação exclusiva com salmão, cheia de sabor', '8 unidades', 30.00, NULL, 107, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(240, 'Camarão MAAD', 'Criação única com camarão, surpreendente e deliciosa', '8 unidades', 35.00, NULL, 107, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(241, 'Atum MAAD', 'Criação especial com atum, rica em sabores', '8 unidades', 32.00, NULL, 107, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(242, 'Kaka MAAD', 'Combinação exclusiva do chef, única e inesquecível', '8 unidades', 35.00, NULL, 107, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(243, 'Ebi Hot Shake MAAD', 'Criação quente com camarão, vibrante e saborosa', '8 unidades', 35.00, NULL, 107, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(244, 'Dubai MAAD', 'Criação premium com toque exótico e sofisticado', '8 unidades', 38.00, NULL, 107, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(245, 'Fire MAAD', 'Criação ousada com toque quente e sabor marcante', '8 unidades', 30.00, NULL, 107, 5, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(246, 'Batera Salmão', 'Sushi prensado com salmão fresco e molho especial', '8 unidades', 28.00, NULL, 108, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(247, 'Batera Atum', 'Sushi prensado com atum, rico e saboroso', '8 unidades', 28.00, NULL, 108, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(248, 'Lula Com Salmão', 'Combinação de lula e salmão, fresca e harmoniosa', '8 unidades', 35.00, NULL, 108, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(249, 'Polvo no gelo', 'Polvo servido gelado com toque refrescante', 'porção 200g', 40.00, NULL, 108, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(250, 'Yakissoba Carne', 'Macarrão frito com carne e legumes, ao molho oriental', 'porção 300g', 35.00, NULL, 108, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(251, 'Yakissoba Frango', 'Macarrão frito com frango e legumes, saboroso', 'porção 300g', 32.00, NULL, 108, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(252, 'Yakissoba Frutos do Mar', 'Macarrão frito com frutos do mar, rico e suculento', 'porção 300g', 45.00, NULL, 108, 5, 1, 1, 0, 7, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(253, 'Kibe Atum', 'Kibe com recheio de atum, crocante e original', '8 unidades', 20.00, NULL, 108, 5, 1, 1, 0, 8, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(254, 'Tempura Legumes', 'Legumes fritos em massa leve, crocantes e saborosos', 'porção 300g', 18.00, NULL, 108, 5, 1, 1, 0, 9, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(255, 'Tempura Camarão', 'Camarões fritos em tempura, leves e crocantes', 'porção 300g', 35.00, NULL, 108, 5, 1, 1, 0, 10, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(256, 'Roru Tomato', 'Rolo especial com toque de tomate, fresco e único', '8 unidades', 28.00, NULL, 108, 5, 1, 1, 0, 11, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(257, 'Missoshiro', 'Sopa tradicional japonesa com missô e tofu', 'porção 200g', 15.00, NULL, 108, 5, 1, 1, 0, 12, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(258, 'Gohan', 'Arroz japonês simples, perfeito para acompanhar', 'porção 200g', 12.00, NULL, 108, 5, 1, 1, 0, 13, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(259, 'Ishigo', 'Sobremesa leve com morangos frescos', 'porção 200g', 15.00, NULL, 109, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(260, 'Hot Roll Doce', 'Rolo frito doce, com recheio cremoso e delicioso', '8 unidades', 18.00, NULL, 109, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(261, 'Nachos com Sorvete', 'Nachos doces com sorvete, sobremesa divertida', 'porção 200g', 18.00, NULL, 109, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(262, 'Banana Fry Doce De Leite', 'Banana frita com doce de leite, quente e doce', 'porção 200g', 16.00, NULL, 109, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(263, 'Banana Fry Nutella', 'Banana frita com Nutella, cremosa e irresistível', 'porção 200g', 18.00, NULL, 109, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(264, 'Harumaki Romeu e Julieta', 'Rolinho doce com goiabada e queijo, clássico e delicioso', '8 unidades', 16.00, NULL, 109, 5, 1, 1, 0, 6, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(265, 'Porção Tilápia Empanada', 'Tilápia empanada, crocante e ideal para crianças', 'porção 300g', 20.00, NULL, 110, 5, 1, 1, 0, 1, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(266, 'Porção Frango Empanado', 'Frango empanado, suculento e perfeito para os pequenos', 'porção 300g', 18.00, NULL, 110, 5, 1, 1, 0, 2, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(267, 'Porção Batata Frita', 'Batatas fritas crocantes, adoradas pelas crianças', 'porção 300g', 15.00, NULL, 110, 5, 1, 1, 0, 3, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(268, 'Prato Frango com Fritas', 'Frango grelhado com batatas fritas, simples e gostoso', 'porção 300g', 20.00, NULL, 110, 5, 1, 1, 0, 4, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(269, 'Prato Tilápia com Fritas', 'Tilápia grelhada com batatas fritas, leve e delicioso', 'porção 300g', 22.00, NULL, 110, 5, 1, 1, 0, 5, '2025-06-04 23:33:00', '2025-06-06 21:11:30', NULL),
(270, 'isabella', NULL, NULL, NULL, NULL, 75, 4, 1, 1, 0, 7, '2025-06-04 18:15:12', '2025-06-06 21:11:30', NULL),
(322, 'Salada da Casa (Cópia)', 'Vinagrete de camarão, sunomono, gengibre, ceviche e nachos de salmão', NULL, NULL, 'items/68ba18704a94f.jpg', 18, 4, 1, 1, 0, 5, '2025-09-05 01:53:36', '2025-09-05 01:53:36', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `item_additionals`
--

CREATE TABLE `item_additionals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `additional_id` bigint(20) UNSIGNED NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_01_01_000004_create_printers_table', 1),
(5, '2024_01_01_000006_create_restaurant_tables_table', 1),
(6, '2024_01_01_000007_create_additional_categories_table', 1),
(7, '2025_05_30_054319_create_categories_table', 1),
(8, '2025_05_30_054319_create_groups_table', 1),
(9, '2025_05_30_054320_create_items_table', 1),
(10, '2025_05_30_062316_add_group_to_categories_table', 1),
(11, '2025_05_30_072316_add_printer_to_items_table', 1),
(12, '2025_05_30_082316_create_additionals_table', 1),
(13, '2025_05_30_092316_create_item_additionals_table', 1),
(14, '2024_01_01_000004_create_icons_table', 2),
(15, '2024_01_01_000005_update_groups_add_icon', 2),
(16, '2025_05_30_192316_update_categories_add_image', 2),
(17, '2025_06_02_063315_update_icons_table_for_file_storage', 3),
(18, '2025_06_02_111814_add_sort_order_to_item_additionals', 4),
(19, '2025_06_02_111815_create_print_queue_table', 5),
(20, '2026_01_01_000001_create_orders_table', 6),
(21, '2026_01_01_000002_create_order_items_table', 6),
(22, '2026_01_01_000003_create_order_item_additionals_table', 6),
(23, '2024_01_15_000001_create_rodizio_types_table', 7),
(24, '2024_01_15_000002_create_orders_table', 7),
(25, '2024_01_15_000003_create_order_items_table', 7),
(26, '2024_01_15_000004_create_payments_table', 7);

-- --------------------------------------------------------

--
-- Estrutura da tabela `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `printers`
--

CREATE TABLE `printers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `port` varchar(255) NOT NULL DEFAULT '9100',
  `type` enum('thermal','laser','inkjet','other') NOT NULL DEFAULT 'thermal',
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `printers`
--

INSERT INTO `printers` (`id`, `name`, `ip_address`, `port`, `type`, `is_main`, `active`, `description`, `sort_order`, `settings`, `created_at`, `updated_at`) VALUES
(1, 'Caixa', '127.0.0.1', '9100', 'thermal', 1, 1, NULL, 1, NULL, '2025-05-31 14:28:06', '2025-06-06 02:56:50'),
(2, 'Bar', '192.168.1.101', '9100', 'thermal', 0, 1, NULL, 2, NULL, '2025-05-31 14:28:06', '2025-06-06 02:52:46'),
(3, 'Sushi', '192.168.1.102', '9100', 'thermal', 0, 1, NULL, 3, NULL, '2025-05-31 14:28:06', '2025-06-06 02:52:49'),
(13, 'Cozinha', '192.168.1.100', '9100', 'thermal', 0, 1, NULL, 0, NULL, '2025-06-06 02:52:59', '2025-06-06 02:52:59');

-- --------------------------------------------------------

--
-- Estrutura da tabela `print_queue`
--

CREATE TABLE `print_queue` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `source` varchar(255) NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `printer_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `content` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `attempts` int(11) NOT NULL DEFAULT 0,
  `max_attempts` int(11) NOT NULL DEFAULT 3,
  `error_message` text DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `restaurant_tables`
--

CREATE TABLE `restaurant_tables` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `number` int(11) NOT NULL,
  `type` enum('table','counter') NOT NULL,
  `capacity` int(11) NOT NULL,
  `attendant` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `restaurant_tables`
--

INSERT INTO `restaurant_tables` (`id`, `name`, `number`, `type`, `capacity`, `attendant`, `active`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Mesa 1', 1, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-10 19:57:40'),
(2, 'Mesa 2', 2, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(3, 'Mesa 3', 3, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(4, 'Mesa 4', 4, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(5, 'Mesa 5', 5, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(6, 'Mesa 6', 6, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(7, 'Mesa 7', 7, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(8, 'Mesa 8', 8, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(9, 'Mesa 9', 9, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(10, 'Mesa 10', 10, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(11, 'Mesa 11', 11, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(12, 'Mesa 12', 12, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(13, 'Mesa 13', 13, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(14, 'Mesa 14', 14, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(15, 'Mesa 15', 15, 'table', 4, NULL, 1, NULL, '2025-06-06 06:44:22', '2025-06-06 06:44:22'),
(18, 'Balcão 101', 101, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(19, 'Balcão 102', 102, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(20, 'Balcão 103', 103, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(21, 'Balcão 104', 104, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(22, 'Balcão 105', 105, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(23, 'Balcão 106', 106, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(24, 'Balcão 107', 107, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(25, 'Balcão 108', 108, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(26, 'Balcão 109', 109, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(27, 'Balcão 110', 110, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(28, 'Balcão 111', 111, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(29, 'Balcão 112', 112, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(30, 'Balcão 113', 113, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(31, 'Balcão 114', 114, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(32, 'Balcão 115', 115, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 07:45:32'),
(33, 'Balcão 116', 116, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 07:44:15'),
(34, 'Balcão 117', 117, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(35, 'Balcão 118', 118, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(36, 'Balcão 119', 119, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(37, 'Balcão 120', 120, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(38, 'Balcão 121', 121, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(39, 'Balcão 122', 122, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(40, 'Balcão 123', 123, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(41, 'Balcão 124', 124, 'counter', 1, NULL, 1, NULL, '2025-06-06 06:45:20', '2025-06-06 06:45:20'),
(42, 'Mesa 16', 16, 'table', 4, NULL, 1, NULL, '2025-06-06 06:54:59', '2025-06-06 06:54:59'),
(43, 'Mesa 17', 17, 'table', 4, NULL, 1, NULL, '2025-06-06 06:55:20', '2025-06-06 06:55:20');

-- --------------------------------------------------------

--
-- Estrutura da tabela `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('b4aBLjeAg7gTHILGxhtyBgEnIc7BD0LtbKhYgsiC', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVlpUMUZCN2VqeW8zUlNZTERBYmhWYmZKZEtHNGs0cWhmTVNxVG9hNSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9vcmRlcnMiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1761191689);

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_activity_logs`
--

CREATE TABLE `tablet_activity_logs` (
  `id` int(11) NOT NULL,
  `tablet_id` int(11) NOT NULL,
  `acao` varchar(100) NOT NULL,
  `detalhes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalhes`)),
  `ip_address` varchar(15) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_attendance_types`
--

CREATE TABLE `tablet_attendance_types` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `descricao` varchar(200) DEFAULT NULL,
  `group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `preco` decimal(10,2) DEFAULT 0.00,
  `ativo` tinyint(1) DEFAULT 1,
  `cor` varchar(7) DEFAULT '#dc2626',
  `icone` varchar(50) DEFAULT 'utensils',
  `permite_extras` tinyint(1) DEFAULT 1,
  `tempo_limite` int(11) DEFAULT NULL COMMENT 'minutos',
  `desconto_crianca` decimal(5,2) DEFAULT 0.00,
  `idade_limite_crianca` int(11) DEFAULT 10,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `tablet_attendance_types`
--

INSERT INTO `tablet_attendance_types` (`id`, `nome`, `descricao`, `group_id`, `preco`, `ativo`, `cor`, `icone`, `permite_extras`, `tempo_limite`, `desconto_crianca`, `idade_limite_crianca`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Rodízio Tradicional', 'Rodízio com pratos tradicionais japoneses', 4, 129.00, 1, '#dc2626', 'utensils', 1, NULL, 0.00, 10, 1, '2025-06-10 23:10:35', '2025-06-10 23:23:57'),
(2, 'Rodízio Premium', 'Rodízio completo com pratos especiais', 1, 189.00, 1, '#7c2d12', 'crown', 1, NULL, 0.00, 10, 2, '2025-06-10 23:10:35', '2025-06-10 23:24:03'),
(3, 'À La Carte', 'Pedidos individuais do cardápio', 5, 0.00, 1, '#059669', 'list', 1, NULL, 0.00, 10, 3, '2025-06-10 23:10:35', '2025-06-10 23:24:07');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_avaliacoes`
--

CREATE TABLE `tablet_avaliacoes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sessao_id` bigint(20) UNSIGNED NOT NULL,
  `nota_geral` int(11) NOT NULL,
  `nota_comida` int(11) NOT NULL,
  `nota_atendimento` int(11) NOT NULL,
  `nota_ambiente` int(11) NOT NULL,
  `comentario` text DEFAULT NULL,
  `recomendaria` tinyint(1) NOT NULL,
  `pontos_positivos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pontos_positivos`)),
  `pontos_negativos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pontos_negativos`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_configs`
--

CREATE TABLE `tablet_configs` (
  `id` int(11) NOT NULL,
  `nome_restaurante` varchar(100) NOT NULL DEFAULT 'MAAD Restaurant',
  `logo_url` varchar(255) DEFAULT NULL,
  `sistema_ativo` tinyint(1) DEFAULT 1,
  `permite_pedidos` tinyint(1) DEFAULT 1,
  `tempo_atualizacao` int(11) DEFAULT 30 COMMENT 'segundos',
  `tempo_inatividade` int(11) DEFAULT 15 COMMENT 'minutos',
  `cor_primaria` varchar(7) DEFAULT '#dc2626',
  `cor_secundaria` varchar(7) DEFAULT '#ffffff',
  `tema` enum('light','dark') DEFAULT 'dark',
  `idioma` varchar(5) DEFAULT 'pt-BR',
  `moeda` varchar(3) DEFAULT 'BRL',
  `simbolo_moeda` varchar(5) DEFAULT 'R$',
  `taxa_servico` decimal(5,2) DEFAULT 10.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `tablet_configs`
--

INSERT INTO `tablet_configs` (`id`, `nome_restaurante`, `logo_url`, `sistema_ativo`, `permite_pedidos`, `tempo_atualizacao`, `tempo_inatividade`, `cor_primaria`, `cor_secundaria`, `tema`, `idioma`, `moeda`, `simbolo_moeda`, `taxa_servico`, `created_at`, `updated_at`) VALUES
(1, 'MAAD Restaurant', NULL, 1, 1, 30, 15, '#dc2626', '#ffffff', 'dark', 'pt-BR', 'BRL', 'R$', 10.00, '2025-06-10 23:10:35', '2025-06-10 23:10:35');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_config_branding`
--

CREATE TABLE `tablet_config_branding` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nome_restaurante` varchar(255) NOT NULL DEFAULT 'MAAD Restaurant',
  `logo_url` varchar(500) DEFAULT NULL,
  `cor_primaria` varchar(7) NOT NULL DEFAULT '#1a1a1a',
  `cor_secundaria` varchar(7) NOT NULL DEFAULT '#ff6b35',
  `cor_terciaria` varchar(7) NOT NULL DEFAULT '#ffffff',
  `slogan` varchar(255) DEFAULT 'Experiência Japonesa Autêntica',
  `fonte` varchar(100) NOT NULL DEFAULT 'DM Sans',
  `tema` varchar(50) NOT NULL DEFAULT 'dark',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tablet_config_branding`
--

INSERT INTO `tablet_config_branding` (`id`, `nome_restaurante`, `logo_url`, `cor_primaria`, `cor_secundaria`, `cor_terciaria`, `slogan`, `fonte`, `tema`, `created_at`, `updated_at`) VALUES
(1, 'MAAD Restaurant', NULL, '#1a1a1a', '#ff6b35', '#ffffff', 'Experiência Japonesa Autêntica', 'DM Sans', 'dark', '2025-06-10 20:17:31', '2025-06-10 20:17:31');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_config_contato`
--

CREATE TABLE `tablet_config_contato` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `telefone` varchar(50) NOT NULL,
  `whatsapp` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `endereco` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`endereco`)),
  `redes_sociais` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`redes_sociais`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tablet_config_contato`
--

INSERT INTO `tablet_config_contato` (`id`, `telefone`, `whatsapp`, `email`, `endereco`, `redes_sociais`, `created_at`, `updated_at`) VALUES
(1, '(11) 99999-9999', '(11) 99999-9999', 'contato@maadrestaurant.com.br', '{\"rua\": \"Rua dos Sushis, 123\", \"bairro\": \"Centro\", \"cidade\": \"São Paulo\", \"cep\": \"01234-567\"}', '{\"instagram\": \"@maadrestaurant\", \"facebook\": \"MAAD Restaurant\"}', '2025-06-10 20:17:31', '2025-06-10 20:17:31');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_config_geral`
--

CREATE TABLE `tablet_config_geral` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tempo_limite_pedido` int(11) NOT NULL DEFAULT 30,
  `max_pessoas_mesa` int(11) NOT NULL DEFAULT 12,
  `min_pessoas_mesa` int(11) NOT NULL DEFAULT 1,
  `permite_divisao_conta` tinyint(1) NOT NULL DEFAULT 1,
  `aceita_observacoes` tinyint(1) NOT NULL DEFAULT 1,
  `tempo_preparo_medio` int(11) NOT NULL DEFAULT 15,
  `limite_itens_por_pedido` int(11) NOT NULL DEFAULT 50,
  `permite_cancelamento` tinyint(1) NOT NULL DEFAULT 1,
  `tempo_cancelamento` int(11) NOT NULL DEFAULT 5,
  `taxa_servico` int(11) NOT NULL DEFAULT 10,
  `tempo_limite_mesa` int(11) NOT NULL DEFAULT 180,
  `moeda` varchar(10) NOT NULL DEFAULT 'BRL',
  `simbolo_moeda` varchar(10) NOT NULL DEFAULT 'R$',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tablet_config_geral`
--

INSERT INTO `tablet_config_geral` (`id`, `tempo_limite_pedido`, `max_pessoas_mesa`, `min_pessoas_mesa`, `permite_divisao_conta`, `aceita_observacoes`, `tempo_preparo_medio`, `limite_itens_por_pedido`, `permite_cancelamento`, `tempo_cancelamento`, `taxa_servico`, `tempo_limite_mesa`, `moeda`, `simbolo_moeda`, `created_at`, `updated_at`) VALUES
(1, 30, 12, 1, 1, 1, 15, 50, 1, 5, 10, 180, 'BRL', 'R$', '2025-06-10 20:17:31', '2025-06-10 20:17:31');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_config_precos`
--

CREATE TABLE `tablet_config_precos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tablet_config_precos`
--

INSERT INTO `tablet_config_precos` (`id`, `tipo`, `valor`, `descricao`, `ativo`, `created_at`, `updated_at`) VALUES
(1, 'rodizio_tradicional', 129.00, 'Rodízio Tradicional - Inclui itens básicos', 1, '2025-06-10 20:17:31', '2025-06-10 20:17:31'),
(2, 'rodizio_premium', 189.00, 'Rodízio Premium - Inclui todos os itens', 1, '2025-06-10 20:17:31', '2025-06-10 20:17:31');

-- --------------------------------------------------------

--
-- Estrutura stand-in para vista `tablet_dashboard_view`
-- (Veja abaixo para a view atual)
--
CREATE TABLE `tablet_dashboard_view` (
`mesas_ocupadas` bigint(21)
,`mesas_livres` bigint(22)
,`pedidos_pendentes` bigint(21)
,`pedidos_preparando` bigint(21)
,`chamadas_pendentes` bigint(21)
,`faturamento_hoje` decimal(32,2)
,`clientes_hoje` bigint(21)
,`atualizado_em` datetime
);

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_devices`
--

CREATE TABLE `tablet_devices` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `ip_address` varchar(15) DEFAULT NULL,
  `mac_address` varchar(17) DEFAULT NULL,
  `bateria` int(11) DEFAULT 100 COMMENT 'porcentagem',
  `ativo` tinyint(1) DEFAULT 1,
  `bloqueado` tinyint(1) DEFAULT 0,
  `mesa_id` bigint(10) UNSIGNED DEFAULT NULL,
  `wifi_nome` varchar(100) DEFAULT NULL,
  `wifi_sinal` int(11) DEFAULT 0 COMMENT 'porcentagem do sinal',
  `versao_app` varchar(20) DEFAULT NULL,
  `sistema_operacional` varchar(50) DEFAULT NULL,
  `ultima_atividade` timestamp NULL DEFAULT NULL,
  `ultima_sincronizacao` timestamp NULL DEFAULT NULL,
  `status` enum('online','offline','manutencao') DEFAULT 'offline',
  `observacoes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `tablet_devices`
--

INSERT INTO `tablet_devices` (`id`, `nome`, `ip_address`, `mac_address`, `bateria`, `ativo`, `bloqueado`, `mesa_id`, `wifi_nome`, `wifi_sinal`, `versao_app`, `sistema_operacional`, `ultima_atividade`, `ultima_sincronizacao`, `status`, `observacoes`, `created_at`, `updated_at`) VALUES
(1, 'Tablet Mesa 01', '192.168.1.101', NULL, 100, 1, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, 'offline', NULL, '2025-06-10 23:10:35', '2025-06-10 23:10:35'),
(2, 'Tablet Mesa 02', '192.168.1.102', NULL, 100, 1, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, 'offline', NULL, '2025-06-10 23:10:35', '2025-06-10 23:10:35'),
(3, 'Tablet Mesa 03', '192.168.1.103', NULL, 100, 1, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, 'offline', NULL, '2025-06-10 23:10:35', '2025-06-10 23:10:35'),
(4, 'Tablet Balcão 01', '192.168.1.104', NULL, 100, 1, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, 'offline', NULL, '2025-06-10 23:10:35', '2025-06-10 23:10:35'),
(5, 'Tablet Balcão 02', '192.168.1.105', NULL, 100, 1, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, 'offline', NULL, '2025-06-10 23:10:35', '2025-06-10 23:10:35');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_interacoes`
--

CREATE TABLE `tablet_interacoes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sessao_id` bigint(20) UNSIGNED NOT NULL,
  `mesa_id` bigint(20) UNSIGNED NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `observacoes` text DEFAULT NULL,
  `prioridade` varchar(10) NOT NULL DEFAULT 'normal',
  `status` varchar(20) NOT NULL DEFAULT 'pendente',
  `tempo_estimado` int(11) NOT NULL DEFAULT 5,
  `previsao_atendimento` timestamp NULL DEFAULT NULL,
  `atendido_em` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_item_adicionais`
--

CREATE TABLE `tablet_item_adicionais` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pedido_item_id` bigint(20) UNSIGNED NOT NULL,
  `additional_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura stand-in para vista `tablet_mesas_status_view`
-- (Veja abaixo para a view atual)
--
CREATE TABLE `tablet_mesas_status_view` (
`mesa_id` bigint(20) unsigned
,`mesa_nome` varchar(255)
,`mesa_numero` int(11)
,`mesa_tipo` enum('table','counter')
,`capacidade` int(11)
,`status` varchar(7)
,`sessao_id` bigint(20) unsigned
,`tipo_atendimento` varchar(50)
,`numero_pessoas` int(11)
,`nome_cliente` varchar(255)
,`abertura` timestamp
,`tempo_ocupacao_minutos` bigint(21)
,`valor_rodizio` decimal(10,2)
,`valor_extras` decimal(32,2)
,`valor_total_atual` decimal(33,2)
,`pedidos_pendentes` bigint(21)
,`interacoes_pendentes` bigint(21)
);

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_notifications`
--

CREATE TABLE `tablet_notifications` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensagem` text NOT NULL,
  `tipo` enum('info','warning','error','success') DEFAULT 'info',
  `tablet_id` int(11) DEFAULT NULL COMMENT 'NULL = todos os tablets',
  `ativo` tinyint(1) DEFAULT 1,
  `data_inicio` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_fim` timestamp NULL DEFAULT NULL,
  `prioridade` enum('baixa','normal','alta') DEFAULT 'normal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_pedidos`
--

CREATE TABLE `tablet_pedidos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sessao_id` bigint(20) UNSIGNED NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'pendente',
  `prioridade` varchar(10) NOT NULL DEFAULT 'normal',
  `observacoes` text DEFAULT NULL,
  `tempo_estimado` int(11) NOT NULL DEFAULT 15,
  `previsao_entrega` timestamp NULL DEFAULT NULL,
  `adicionado_por` varchar(255) DEFAULT 'cliente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tablet_pedidos`
--

INSERT INTO `tablet_pedidos` (`id`, `sessao_id`, `total`, `status`, `prioridade`, `observacoes`, `tempo_estimado`, `previsao_entrega`, `adicionado_por`, `created_at`, `updated_at`) VALUES
(1, 1, 0.00, 'pendente', 'normal', 'Sem wasabi', 15, '2025-06-10 23:42:29', 'cliente', '2025-06-10 23:27:29', '2025-06-10 23:27:29');

--
-- Acionadores `tablet_pedidos`
--
DELIMITER $$
CREATE TRIGGER `update_sessao_valor_after_pedido_delete` AFTER DELETE ON `tablet_pedidos` FOR EACH ROW BEGIN
    UPDATE tablet_sessoes 
    SET valor_total = preco_total + (
        SELECT COALESCE(SUM(total), 0) 
        FROM tablet_pedidos 
        WHERE sessao_id = OLD.sessao_id
    ),
    updated_at = NOW()
    WHERE id = OLD.sessao_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_sessao_valor_after_pedido_insert` AFTER INSERT ON `tablet_pedidos` FOR EACH ROW BEGIN
    UPDATE tablet_sessoes 
    SET valor_total = preco_total + (
        SELECT COALESCE(SUM(total), 0) 
        FROM tablet_pedidos 
        WHERE sessao_id = NEW.sessao_id
    ),
    updated_at = NOW()
    WHERE id = NEW.sessao_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_sessao_valor_after_pedido_update` AFTER UPDATE ON `tablet_pedidos` FOR EACH ROW BEGIN
    UPDATE tablet_sessoes 
    SET valor_total = preco_total + (
        SELECT COALESCE(SUM(total), 0) 
        FROM tablet_pedidos 
        WHERE sessao_id = NEW.sessao_id
    ),
    updated_at = NOW()
    WHERE id = NEW.sessao_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_pedido_itens`
--

CREATE TABLE `tablet_pedido_itens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pedido_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `preco_adicionais` decimal(10,2) NOT NULL DEFAULT 0.00,
  `preco_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `observacoes` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pendente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tablet_pedido_itens`
--

INSERT INTO `tablet_pedido_itens` (`id`, `pedido_id`, `item_id`, `quantidade`, `preco_unitario`, `preco_adicionais`, `preco_total`, `observacoes`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 0.00, 0.00, 0.00, NULL, 'pendente', '2025-06-10 23:27:29', NULL),
(2, 1, 5, 1, 0.00, 0.00, 0.00, NULL, 'pendente', '2025-06-10 23:27:29', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_service_types`
--

CREATE TABLE `tablet_service_types` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `descricao` varchar(200) DEFAULT NULL,
  `icone` varchar(50) DEFAULT 'bell',
  `cor` varchar(7) DEFAULT '#dc2626',
  `ativo` tinyint(1) DEFAULT 1,
  `printer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `prioridade` enum('baixa','normal','alta','urgente') DEFAULT 'normal',
  `tempo_estimado` int(11) DEFAULT 5 COMMENT 'minutos',
  `som_notificacao` tinyint(1) DEFAULT 1,
  `mensagem_padrao` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `tablet_service_types`
--

INSERT INTO `tablet_service_types` (`id`, `nome`, `descricao`, `icone`, `cor`, `ativo`, `printer_id`, `prioridade`, `tempo_estimado`, `som_notificacao`, `mensagem_padrao`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Chamar Garçom', 'Solicitar atendimento do garçom', 'user-tie', '#dc2626', 1, 1, 'normal', 3, 1, 'Cliente solicitando atendimento', 1, '2025-06-10 23:10:35', '2025-06-10 23:14:34'),
(2, 'Pedir Copo', 'Solicitar copo adicional', 'glass-water', '#2563eb', 1, 1, 'baixa', 2, 1, 'Cliente precisa de copo', 2, '2025-06-10 23:10:35', '2025-06-10 23:23:22'),
(3, 'Pedir Hashi', 'Solicitar hashi (palitos)', 'utensils', '#059669', 1, 1, 'baixa', 2, 1, 'Cliente precisa de hashi', 3, '2025-06-10 23:10:35', '2025-06-10 23:23:25'),
(4, 'Pedir Guardanapo', 'Solicitar guardanapos', 'tissue', '#7c3aed', 1, 1, 'baixa', 1, 1, 'Cliente precisa de guardanapos', 4, '2025-06-10 23:10:35', '2025-06-10 23:23:27'),
(5, 'Pedir Conta', 'Solicitar a conta', 'receipt', '#dc2626', 1, 1, 'alta', 5, 1, 'Cliente quer fechar a conta', 5, '2025-06-10 23:10:35', '2025-06-10 23:23:31'),
(6, 'Reclamação', 'Registrar reclamação', 'exclamation-triangle', '#dc2626', 1, 1, 'urgente', 1, 1, 'Cliente tem uma reclamação', 6, '2025-06-10 23:10:35', '2025-06-10 23:23:34'),
(7, 'Elogio', 'Registrar elogio', 'heart', '#059669', 1, 1, 'baixa', 10, 1, 'Cliente quer fazer um elogio', 7, '2025-06-10 23:10:35', '2025-06-10 23:23:38'),
(8, 'Ajuda', 'Solicitar ajuda geral', 'question-circle', '#f59e0b', 1, 1, 'normal', 3, 1, 'Cliente precisa de ajuda', 8, '2025-06-10 23:10:35', '2025-06-10 23:23:43');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tablet_sessoes`
--

CREATE TABLE `tablet_sessoes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `mesa_id` bigint(20) UNSIGNED NOT NULL,
  `tipo_atendimento` varchar(50) NOT NULL,
  `numero_pessoas` int(11) NOT NULL,
  `nome_cliente` varchar(255) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `preco_unitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `preco_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `abertura` timestamp NOT NULL DEFAULT current_timestamp(),
  `fechamento` timestamp NULL DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ativa',
  `tempo_limite` timestamp NULL DEFAULT NULL,
  `forma_pagamento` varchar(50) DEFAULT NULL,
  `observacoes_fechamento` text DEFAULT NULL,
  `valor_total` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tablet_sessoes`
--

INSERT INTO `tablet_sessoes` (`id`, `mesa_id`, `tipo_atendimento`, `numero_pessoas`, `nome_cliente`, `observacoes`, `preco_unitario`, `preco_total`, `abertura`, `fechamento`, `status`, `tempo_limite`, `forma_pagamento`, `observacoes_fechamento`, `valor_total`, `created_at`, `updated_at`) VALUES
(1, 1, 'rodizio_tradicional', 4, 'João Silva', 'Mesa próxima à janela', 129.00, 516.00, '2025-06-10 23:20:02', NULL, 'ativa', '2025-06-11 02:20:02', NULL, NULL, 516.00, '2025-06-10 23:20:02', '2025-06-10 20:27:29');

-- --------------------------------------------------------

--
-- Estrutura stand-in para vista `tablet_statistics_today`
-- (Veja abaixo para a view atual)
--
CREATE TABLE `tablet_statistics_today` (
`data` date
,`sessoes_abertas` bigint(21)
,`sessoes_fechadas` bigint(21)
,`pedidos_criados` bigint(21)
,`faturamento_total` decimal(32,2)
,`ticket_medio` decimal(14,6)
,`avaliacoes_recebidas` bigint(21)
,`nota_media` decimal(14,4)
,`atualizado_em` datetime
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para vista `tablet_system_status`
-- (Veja abaixo para a view atual)
--
CREATE TABLE `tablet_system_status` (
`sistema` varchar(14)
,`mesas_ativas` bigint(21)
,`sessoes_ativas` bigint(21)
,`pedidos_pendentes` bigint(21)
,`interacoes_pendentes` bigint(21)
,`itens_disponiveis` bigint(21)
,`categorias_ativas` bigint(21)
,`precos_configurados` bigint(21)
,`verificado_em` datetime
);

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para vista `tablet_dashboard_view`
--
DROP TABLE IF EXISTS `tablet_dashboard_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tablet_dashboard_view`  AS SELECT (select count(0) from `tablet_sessoes` where `tablet_sessoes`.`status` = 'ativa') AS `mesas_ocupadas`, (select count(0) from `restaurant_tables` where `restaurant_tables`.`active` = 1) - (select count(0) from `tablet_sessoes` where `tablet_sessoes`.`status` = 'ativa') AS `mesas_livres`, (select count(0) from `tablet_pedidos` where `tablet_pedidos`.`status` = 'pendente') AS `pedidos_pendentes`, (select count(0) from `tablet_pedidos` where `tablet_pedidos`.`status` = 'preparando') AS `pedidos_preparando`, (select count(0) from `tablet_interacoes` where `tablet_interacoes`.`status` = 'pendente') AS `chamadas_pendentes`, (select sum(`tablet_sessoes`.`valor_total`) from `tablet_sessoes` where cast(`tablet_sessoes`.`fechamento` as date) = curdate() and `tablet_sessoes`.`status` = 'fechada') AS `faturamento_hoje`, (select count(0) from `tablet_sessoes` where cast(`tablet_sessoes`.`abertura` as date) = curdate()) AS `clientes_hoje`, current_timestamp() AS `atualizado_em` ;

-- --------------------------------------------------------

--
-- Estrutura para vista `tablet_mesas_status_view`
--
DROP TABLE IF EXISTS `tablet_mesas_status_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tablet_mesas_status_view`  AS SELECT `rt`.`id` AS `mesa_id`, `rt`.`name` AS `mesa_nome`, `rt`.`number` AS `mesa_numero`, `rt`.`type` AS `mesa_tipo`, `rt`.`capacity` AS `capacidade`, CASE WHEN `ts`.`id` is not null THEN 'ocupada' ELSE 'livre' END AS `status`, `ts`.`id` AS `sessao_id`, `ts`.`tipo_atendimento` AS `tipo_atendimento`, `ts`.`numero_pessoas` AS `numero_pessoas`, `ts`.`nome_cliente` AS `nome_cliente`, `ts`.`abertura` AS `abertura`, timestampdiff(MINUTE,`ts`.`abertura`,current_timestamp()) AS `tempo_ocupacao_minutos`, `ts`.`preco_total` AS `valor_rodizio`, coalesce((select sum(`tablet_pedidos`.`total`) from `tablet_pedidos` where `tablet_pedidos`.`sessao_id` = `ts`.`id`),0) AS `valor_extras`, `ts`.`preco_total`+ coalesce((select sum(`tablet_pedidos`.`total`) from `tablet_pedidos` where `tablet_pedidos`.`sessao_id` = `ts`.`id`),0) AS `valor_total_atual`, (select count(0) from `tablet_pedidos` where `tablet_pedidos`.`sessao_id` = `ts`.`id` and `tablet_pedidos`.`status` in ('pendente','preparando')) AS `pedidos_pendentes`, (select count(0) from `tablet_interacoes` where `tablet_interacoes`.`sessao_id` = `ts`.`id` and `tablet_interacoes`.`status` = 'pendente') AS `interacoes_pendentes` FROM (`restaurant_tables` `rt` left join `tablet_sessoes` `ts` on(`rt`.`id` = `ts`.`mesa_id` and `ts`.`status` = 'ativa')) WHERE `rt`.`active` = 1 ORDER BY `rt`.`type` ASC, `rt`.`number` ASC ;

-- --------------------------------------------------------

--
-- Estrutura para vista `tablet_statistics_today`
--
DROP TABLE IF EXISTS `tablet_statistics_today`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tablet_statistics_today`  AS SELECT cast(current_timestamp() as date) AS `data`, (select count(0) from `tablet_sessoes` where cast(`tablet_sessoes`.`abertura` as date) = curdate()) AS `sessoes_abertas`, (select count(0) from `tablet_sessoes` where cast(`tablet_sessoes`.`fechamento` as date) = curdate()) AS `sessoes_fechadas`, (select count(0) from `tablet_pedidos` where cast(`tablet_pedidos`.`created_at` as date) = curdate()) AS `pedidos_criados`, (select sum(`tablet_sessoes`.`valor_total`) from `tablet_sessoes` where cast(`tablet_sessoes`.`fechamento` as date) = curdate() and `tablet_sessoes`.`status` = 'fechada') AS `faturamento_total`, (select avg(`tablet_sessoes`.`valor_total`) from `tablet_sessoes` where cast(`tablet_sessoes`.`fechamento` as date) = curdate() and `tablet_sessoes`.`status` = 'fechada') AS `ticket_medio`, (select count(0) from `tablet_avaliacoes` where cast(`tablet_avaliacoes`.`created_at` as date) = curdate()) AS `avaliacoes_recebidas`, (select avg(`tablet_avaliacoes`.`nota_geral`) from `tablet_avaliacoes` where cast(`tablet_avaliacoes`.`created_at` as date) = curdate()) AS `nota_media`, current_timestamp() AS `atualizado_em` ;

-- --------------------------------------------------------

--
-- Estrutura para vista `tablet_system_status`
--
DROP TABLE IF EXISTS `tablet_system_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tablet_system_status`  AS SELECT 'Sistema Tablet' AS `sistema`, (select count(0) from `restaurant_tables` where `restaurant_tables`.`active` = 1) AS `mesas_ativas`, (select count(0) from `tablet_sessoes` where `tablet_sessoes`.`status` = 'ativa') AS `sessoes_ativas`, (select count(0) from `tablet_pedidos` where `tablet_pedidos`.`status` in ('pendente','preparando')) AS `pedidos_pendentes`, (select count(0) from `tablet_interacoes` where `tablet_interacoes`.`status` = 'pendente') AS `interacoes_pendentes`, (select count(0) from `items` where `items`.`active` = 1 and `items`.`available` = 1) AS `itens_disponiveis`, (select count(0) from `categories` where `categories`.`active` = 1) AS `categorias_ativas`, (select count(0) from `tablet_config_precos` where `tablet_config_precos`.`ativo` = 1) AS `precos_configurados`, current_timestamp() AS `verificado_em` ;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `additionals`
--
ALTER TABLE `additionals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `additionals_additional_category_id_foreign` (`additional_category_id`);

--
-- Índices para tabela `additional_categories`
--
ALTER TABLE `additional_categories`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Índices para tabela `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Índices para tabela `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categories_group_id_foreign` (`group_id`);

--
-- Índices para tabela `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Índices para tabela `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groups_icon_id_foreign` (`icon_id`);

--
-- Índices para tabela `icons`
--
ALTER TABLE `icons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `icons_slug_unique` (`slug`);

--
-- Índices para tabela `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `items_category_id_foreign` (`category_id`),
  ADD KEY `items_group_id_foreign` (`group_id`),
  ADD KEY `items_printer_id_foreign` (`printer_id`);

--
-- Índices para tabela `item_additionals`
--
ALTER TABLE `item_additionals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_additionals_additional_id_foreign` (`additional_id`),
  ADD KEY `item_additionals_item_id_sort_order_index` (`item_id`,`sort_order`);

--
-- Índices para tabela `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Índices para tabela `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Índices para tabela `printers`
--
ALTER TABLE `printers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_active_is_main` (`active`,`is_main`);

--
-- Índices para tabela `print_queue`
--
ALTER TABLE `print_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `print_queue_printer_id_foreign` (`printer_id`),
  ADD KEY `print_queue_status_priority_scheduled_at_index` (`status`,`priority`,`scheduled_at`),
  ADD KEY `print_queue_type_source_index` (`type`,`source`),
  ADD KEY `print_queue_order_id_item_id_index` (`order_id`,`item_id`);

--
-- Índices para tabela `restaurant_tables`
--
ALTER TABLE `restaurant_tables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_number_type` (`number`,`type`),
  ADD KEY `idx_type_active` (`type`,`active`),
  ADD KEY `idx_number` (`number`);

--
-- Índices para tabela `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Índices para tabela `tablet_activity_logs`
--
ALTER TABLE `tablet_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_activity_logs_tablet` (`tablet_id`),
  ADD KEY `idx_tablet_activity_logs_created` (`created_at`);

--
-- Índices para tabela `tablet_attendance_types`
--
ALTER TABLE `tablet_attendance_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_attendance_types_ativo` (`ativo`),
  ADD KEY `fk_attendance_group` (`group_id`);

--
-- Índices para tabela `tablet_avaliacoes`
--
ALTER TABLE `tablet_avaliacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_avaliacoes_sessao_id` (`sessao_id`),
  ADD KEY `idx_tablet_avaliacoes_nota_geral` (`nota_geral`),
  ADD KEY `idx_tablet_avaliacoes_data` (`created_at`);

--
-- Índices para tabela `tablet_configs`
--
ALTER TABLE `tablet_configs`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `tablet_config_branding`
--
ALTER TABLE `tablet_config_branding`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `tablet_config_contato`
--
ALTER TABLE `tablet_config_contato`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `tablet_config_geral`
--
ALTER TABLE `tablet_config_geral`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `tablet_config_precos`
--
ALTER TABLE `tablet_config_precos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tipo` (`tipo`);

--
-- Índices para tabela `tablet_devices`
--
ALTER TABLE `tablet_devices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_devices_status` (`status`),
  ADD KEY `idx_tablet_devices_ativo` (`ativo`),
  ADD KEY `idx_tablet_devices_mesa` (`mesa_id`);

--
-- Índices para tabela `tablet_interacoes`
--
ALTER TABLE `tablet_interacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_interacoes_sessao_id` (`sessao_id`),
  ADD KEY `idx_tablet_interacoes_mesa_id` (`mesa_id`),
  ADD KEY `idx_tablet_interacoes_status` (`status`),
  ADD KEY `idx_tablet_interacoes_tipo` (`tipo`),
  ADD KEY `idx_tablet_interacoes_prioridade` (`prioridade`),
  ADD KEY `idx_tablet_interacoes_status_prioridade` (`status`,`prioridade`);

--
-- Índices para tabela `tablet_item_adicionais`
--
ALTER TABLE `tablet_item_adicionais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_item_adicionais_pedido_item` (`pedido_item_id`),
  ADD KEY `idx_tablet_item_adicionais_additional` (`additional_id`);

--
-- Índices para tabela `tablet_notifications`
--
ALTER TABLE `tablet_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tablet_id` (`tablet_id`),
  ADD KEY `idx_tablet_notifications_ativo` (`ativo`);

--
-- Índices para tabela `tablet_pedidos`
--
ALTER TABLE `tablet_pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_pedidos_sessao_id` (`sessao_id`),
  ADD KEY `idx_tablet_pedidos_status` (`status`),
  ADD KEY `idx_tablet_pedidos_prioridade` (`prioridade`),
  ADD KEY `idx_tablet_pedidos_created_at` (`created_at`),
  ADD KEY `idx_tablet_pedidos_sessao_status` (`sessao_id`,`status`);

--
-- Índices para tabela `tablet_pedido_itens`
--
ALTER TABLE `tablet_pedido_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_pedido_itens_pedido_id` (`pedido_id`),
  ADD KEY `idx_tablet_pedido_itens_item_id` (`item_id`),
  ADD KEY `idx_tablet_pedido_itens_status` (`status`);

--
-- Índices para tabela `tablet_service_types`
--
ALTER TABLE `tablet_service_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_service_types_ativo` (`ativo`),
  ADD KEY `fk_tablet_service_printer` (`printer_id`);

--
-- Índices para tabela `tablet_sessoes`
--
ALTER TABLE `tablet_sessoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tablet_sessoes_mesa_id` (`mesa_id`),
  ADD KEY `idx_tablet_sessoes_status` (`status`),
  ADD KEY `idx_tablet_sessoes_abertura` (`abertura`),
  ADD KEY `idx_tablet_sessoes_mesa_status` (`mesa_id`,`status`),
  ADD KEY `idx_tablet_sessoes_fechamento` (`fechamento`);

--
-- Índices para tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `additionals`
--
ALTER TABLE `additionals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de tabela `additional_categories`
--
ALTER TABLE `additional_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de tabela `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT de tabela `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `groups`
--
ALTER TABLE `groups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de tabela `icons`
--
ALTER TABLE `icons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de tabela `items`
--
ALTER TABLE `items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=323;

--
-- AUTO_INCREMENT de tabela `item_additionals`
--
ALTER TABLE `item_additionals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=236;

--
-- AUTO_INCREMENT de tabela `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de tabela `printers`
--
ALTER TABLE `printers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `print_queue`
--
ALTER TABLE `print_queue`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `restaurant_tables`
--
ALTER TABLE `restaurant_tables`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de tabela `tablet_activity_logs`
--
ALTER TABLE `tablet_activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tablet_attendance_types`
--
ALTER TABLE `tablet_attendance_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `tablet_avaliacoes`
--
ALTER TABLE `tablet_avaliacoes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tablet_configs`
--
ALTER TABLE `tablet_configs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tablet_config_branding`
--
ALTER TABLE `tablet_config_branding`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tablet_config_contato`
--
ALTER TABLE `tablet_config_contato`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tablet_config_geral`
--
ALTER TABLE `tablet_config_geral`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tablet_config_precos`
--
ALTER TABLE `tablet_config_precos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `tablet_devices`
--
ALTER TABLE `tablet_devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `tablet_interacoes`
--
ALTER TABLE `tablet_interacoes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tablet_item_adicionais`
--
ALTER TABLE `tablet_item_adicionais`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tablet_notifications`
--
ALTER TABLE `tablet_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tablet_pedidos`
--
ALTER TABLE `tablet_pedidos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tablet_pedido_itens`
--
ALTER TABLE `tablet_pedido_itens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `tablet_service_types`
--
ALTER TABLE `tablet_service_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `tablet_sessoes`
--
ALTER TABLE `tablet_sessoes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `additionals`
--
ALTER TABLE `additionals`
  ADD CONSTRAINT `additionals_additional_category_id_foreign` FOREIGN KEY (`additional_category_id`) REFERENCES `additional_categories` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_icon_id_foreign` FOREIGN KEY (`icon_id`) REFERENCES `icons` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `items_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `items_printer_id_foreign` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `item_additionals`
--
ALTER TABLE `item_additionals`
  ADD CONSTRAINT `item_additionals_additional_id_foreign` FOREIGN KEY (`additional_id`) REFERENCES `additionals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_additionals_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `print_queue`
--
ALTER TABLE `print_queue`
  ADD CONSTRAINT `print_queue_printer_id_foreign` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`id`);

--
-- Limitadores para a tabela `tablet_activity_logs`
--
ALTER TABLE `tablet_activity_logs`
  ADD CONSTRAINT `tablet_activity_logs_ibfk_1` FOREIGN KEY (`tablet_id`) REFERENCES `tablet_devices` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tablet_attendance_types`
--
ALTER TABLE `tablet_attendance_types`
  ADD CONSTRAINT `fk_attendance_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `tablet_avaliacoes`
--
ALTER TABLE `tablet_avaliacoes`
  ADD CONSTRAINT `fk_tablet_avaliacoes_sessao` FOREIGN KEY (`sessao_id`) REFERENCES `tablet_sessoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `tablet_devices`
--
ALTER TABLE `tablet_devices`
  ADD CONSTRAINT `fk_tablet_mesa` FOREIGN KEY (`mesa_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `tablet_interacoes`
--
ALTER TABLE `tablet_interacoes`
  ADD CONSTRAINT `fk_tablet_interacoes_mesa` FOREIGN KEY (`mesa_id`) REFERENCES `restaurant_tables` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tablet_interacoes_sessao` FOREIGN KEY (`sessao_id`) REFERENCES `tablet_sessoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `tablet_item_adicionais`
--
ALTER TABLE `tablet_item_adicionais`
  ADD CONSTRAINT `fk_tablet_item_adicionais_additional` FOREIGN KEY (`additional_id`) REFERENCES `additionals` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tablet_item_adicionais_pedido_item` FOREIGN KEY (`pedido_item_id`) REFERENCES `tablet_pedido_itens` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `tablet_notifications`
--
ALTER TABLE `tablet_notifications`
  ADD CONSTRAINT `tablet_notifications_ibfk_1` FOREIGN KEY (`tablet_id`) REFERENCES `tablet_devices` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tablet_pedidos`
--
ALTER TABLE `tablet_pedidos`
  ADD CONSTRAINT `fk_tablet_pedidos_sessao` FOREIGN KEY (`sessao_id`) REFERENCES `tablet_sessoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `tablet_pedido_itens`
--
ALTER TABLE `tablet_pedido_itens`
  ADD CONSTRAINT `fk_tablet_pedido_itens_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tablet_pedido_itens_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `tablet_pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `tablet_service_types`
--
ALTER TABLE `tablet_service_types`
  ADD CONSTRAINT `fk_tablet_service_printer` FOREIGN KEY (`printer_id`) REFERENCES `printers` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `tablet_sessoes`
--
ALTER TABLE `tablet_sessoes`
  ADD CONSTRAINT `fk_tablet_sessoes_mesa` FOREIGN KEY (`mesa_id`) REFERENCES `restaurant_tables` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
