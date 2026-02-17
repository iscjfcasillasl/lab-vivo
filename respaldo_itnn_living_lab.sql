-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: itnn_living_lab
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `text` varchar(255) NOT NULL,
  `days` int(11) NOT NULL DEFAULT 1,
  `done` tinyint(1) NOT NULL DEFAULT 0,
  `progress` tinyint(4) NOT NULL DEFAULT 0,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `priority` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_project_id_foreign` (`project_id`),
  KEY `activities_created_by_foreign` (`created_by`),
  CONSTRAINT `activities_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `activities_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1090,162,'Mecanización de guardarrayas (tractor)',2,0,0,NULL,'07:00:00','15:00:00','high','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1091,162,'Eliminación de biomasa seca combustible',1,0,0,NULL,'08:00:00','14:00:00','high','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1092,162,'Marcaje y apertura de cepas en perímetro',2,0,0,NULL,'07:00:00','13:00:00','high','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1093,162,'Insolación del suelo (desinfección solar)',3,0,0,NULL,NULL,NULL,'high','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1094,162,'Plantación de Nopal/Agave en borde interior',2,0,0,NULL,'06:00:00','12:00:00','high','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1095,162,'Trasplante de árboles al perímetro',3,0,0,NULL,'07:00:00','14:00:00','high','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1096,163,'Habilitación del espacio físico',2,0,0,NULL,'08:00:00','16:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1097,163,'Armado de mesas de trabajo',3,0,0,NULL,'08:00:00','14:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1098,163,'Instalación de estructura de sombra',1,0,0,NULL,'07:00:00','13:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1099,163,'Preparación de sustrato',1,0,0,NULL,'08:00:00','12:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1100,163,'Llenado de bolsas/charolas',2,0,0,NULL,'07:00:00','14:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1101,163,'Siembra de Moringa y Crotalaria',1,0,0,NULL,'06:00:00','11:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1102,163,'Esquejado de Cocoite y Botón de Oro',3,0,0,NULL,'07:00:00','13:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1103,163,'Riego y control de plántulas',30,0,0,NULL,'06:00:00','10:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1104,164,'Lavado exhaustivo de tambos de 200L',1,0,0,NULL,'08:00:00','14:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1105,164,'Desinfección con cloro diluido',1,0,0,NULL,'09:00:00','12:00:00','critical','2026-02-17 08:44:14','2026-02-17 09:51:56'),(1106,164,'Corte de tubos PVC en estación de corte',2,0,0,NULL,'07:00:00','15:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1107,164,'Perforado de orificios para canastillas',2,0,0,NULL,'07:00:00','15:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1108,164,'Pegado y armado de 80 torres verticales',4,0,0,NULL,'07:00:00','16:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1109,164,'Enterrado de tambos (reservorios)',2,0,0,NULL,'07:00:00','14:00:00','high','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1110,164,'Nivelación del sistema',1,0,0,NULL,'08:00:00','13:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1111,164,'Conexión de bombas y nebulizadores',3,0,0,NULL,'08:00:00','16:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1112,164,'Pruebas de fuga y configuración timers',2,0,0,NULL,'09:00:00','15:00:00','critical','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1113,165,'Instalación de postes de madera',2,0,0,NULL,'07:00:00','14:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1114,165,'Tendido de alambre galvanizado',1,0,0,NULL,'08:00:00','13:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1115,165,'Tensores y anclajes',1,0,0,NULL,'08:00:00','12:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1116,165,'Instalación de riego localizado',2,0,0,NULL,'07:00:00','15:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1117,165,'Siembra de plántulas de Maracuyá',1,0,0,NULL,'06:00:00','11:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1118,165,'Sistema de riego semiautomatizado',4,0,0,NULL,NULL,NULL,'high','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1119,166,'Firma de acuerdos',1,0,0,NULL,'10:00:00','12:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1120,166,'Taller de seguridad (EPP)',1,0,0,NULL,'08:00:00','14:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1121,166,'Automatización y pruebas de fuga',2,0,0,NULL,'08:00:00','16:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1122,166,'Protocolo de cierre pre-vacacional',1,0,0,NULL,'09:00:00','13:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1123,166,'Puesta en Marcha Integral',3,0,0,NULL,'07:00:00','17:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14'),(1124,166,'Evaluación de germinación en Vivero',1,0,0,NULL,'08:00:00','12:00:00','medium','2026-02-17 08:44:14','2026-02-17 08:44:14');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `activity_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `action` varchar(255) NOT NULL,
  `old_progress` tinyint(4) DEFAULT NULL,
  `new_progress` tinyint(4) DEFAULT NULL,
  `justification` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_activity_id_foreign` (`activity_id`),
  KEY `activity_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `activity_logs_activity_id_foreign` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1105,1,'edited',0,0,'Prevenir infecciones o la propagacion de bacterias','2026-02-17 09:51:56','2026-02-17 09:51:56');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_01_01_000001_create_projects_table',1),(5,'2024_01_01_000002_create_activities_table',1),(6,'2024_01_01_000003_add_socialite_to_users_table',1),(7,'2024_01_01_000004_add_progress_to_activities_table',2),(8,'2024_01_01_000005_add_permissions_and_logs',3),(9,'2024_01_01_000006_add_approved_to_users',4),(10,'2026_02_17_044443_add_status_to_users_table',5);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(255) NOT NULL DEFAULT '#000000',
  `icon` varchar(255) DEFAULT NULL,
  `key` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projects_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (162,'Escudo Verde','Seguridad civil y mitigación de incendios mediante guardarrayas y barreras vivas.','#f59e0b','ri-shield-line','escudo','2026-02-17 08:44:14','2026-02-17 08:44:14'),(163,'Vivero Integral','Producción propia de planta forestal y forrajera (Moringa, Cocoite, Amapa).','#145d8a','ri-seedling-line','vivero','2026-02-17 08:44:14','2026-02-17 11:31:26'),(164,'Aeroponía','Validación tecnológica de cultivos intensivos en torres verticales.','#1d308b','ri-water-flash-line','aeroponia','2026-02-17 08:44:14','2026-02-17 10:53:37'),(165,'Maracuyá','Cultivo demostrativo de alto valor en estructura de ramada.','#f59e0b','ri-lightbulb-line','maracuya','2026-02-17 08:44:14','2026-02-17 08:44:14'),(166,'Gestión y Control','Seguridad, automatización, pruebas y puesta en marcha.','#6366f1','ri-settings-3-line','gestion','2026-02-17 08:44:14','2026-02-17 08:44:14');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('2aiqDYRnfquO400Neca45ZFgqx63qeJpcEjtaVL6',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiN2JRbjJyRm5LcHlwdTZLM3Q1NFhjZ1JOWFhGNGlLQUgwTXJob3ZtdyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjY6Imh0dHA6Ly9sb2NhbGhvc3QvcHJveWVjdG8taXRubi9sYXJhdmVsX2FwcC9wdWJsaWMvcGVuZGluZy1hcHByb3ZhbCI7czo1OiJyb3V0ZSI7czoxNjoicGVuZGluZy1hcHByb3ZhbCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjc7fQ==',1771303936),('4c1P6yjEQ7gEiy8Gas6c89oKYzpgDoF06rc4lRhM',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWUxUb0VzWURIcElmYmFMWVVYVjFuOEMwS3VwQUxGTGx3UHNJTGhpUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTU6Imh0dHA6Ly9sb2NhbGhvc3QvcHJveWVjdG8taXRubi9sYXJhdmVsX2FwcC9wdWJsaWMvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1771302360),('7OdCqn7CkNd5g3ki0tYsXYLGiriJ2ljOW31DhjKh',6,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiY0hBZkdTdzJuZUVaOVo4ZnZrSHo5QWpuQlk3NHphSldsUXg0a2IyWiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Nzg6Imh0dHA6Ly9sb2NhbGhvc3QvcHJveWVjdG8taXRubi9sYXJhdmVsX2FwcC9wdWJsaWMvYXBpL3Byb2plY3RzP3Q9MTc3MTI5OTYzNzExOCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6Njt9',1771299637),('eRvLjjZxxU7z4w74YmcGzIoOM70Rt11ZWA32cFRS',8,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiOFZZQkxPQU91Vk9RbENQeldIcVZVdDkycUEyRVRZZGt1dE5BM1NZZCI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo1OToiaHR0cDovL2xvY2FsaG9zdC9wcm95ZWN0by1pdG5uL2xhcmF2ZWxfYXBwL3B1YmxpYy9kYXNoYm9hcmQiO31zOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo2NjoiaHR0cDovL2xvY2FsaG9zdC9wcm95ZWN0by1pdG5uL2xhcmF2ZWxfYXBwL3B1YmxpYy9wZW5kaW5nLWFwcHJvdmFsIjtzOjU6InJvdXRlIjtzOjE2OiJwZW5kaW5nLWFwcHJvdmFsIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6ODt9',1771304026),('lTeXUPg0XtdBTlonxDiKOYQTX41B9PzJAg621usn',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiWEFCbnpsTzhWMjkwVWVFclZwTFl3TlNEelp4OTkwWHBSdGx1UW5NQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTk6Imh0dHA6Ly9sb2NhbGhvc3QvcHJveWVjdG8taXRubi9sYXJhdmVsX2FwcC9wdWJsaWMvYXBpL3VzZXJzIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO30=',1771303965),('xkHHoIcSou1FrG3cB9GkbcNyNNNJly5EHxNwuJPU',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiM2cxNmdyT2NsQkNadm5GR3FFbFVyQWtQTDJ1ZkVoMlhjTXNKMXAwaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTU6Imh0dHA6Ly9sb2NhbGhvc3QvcHJveWVjdG8taXRubi9sYXJhdmVsX2FwcC9wdWJsaWMvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1771303947);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `approved` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Departamento Centro de Computo','admin_service@nortenayarit.tecnm.mx','active',NULL,NULL,NULL,'2026-02-17 03:53:03','2026-02-17 09:37:20','109615364764654974467','https://lh3.googleusercontent.com/a/ACg8ocJXCX9qn28bZKb9_d5AZDjiVPr4U4Zs-ZcQF2HLShzxnqA9a6w=s96-c','superadmin',1),(6,'Jose F. Casillas Lomeli','jfcasillasl@nortenayarit.tecnm.mx','active',NULL,NULL,NULL,'2026-02-17 09:44:45','2026-02-17 09:48:08','111875323713444732909','https://lh3.googleusercontent.com/a/ACg8ocL6fLi4FVCN3RkMoOWWk7ElIjW1gQ0zVNEPNU9a24Ku6JDQF_c=s96-c','user',1),(7,'Drone Quetzalcoatl','drone01@nortenayarit.tecnm.mx','pending',NULL,NULL,NULL,'2026-02-17 11:21:57','2026-02-17 11:21:57','104199749225864361645','https://lh3.googleusercontent.com/a/ACg8ocIeEo-OXeiRAKHTzGrTsx_q21HKLoJv3G4fGEv9mq4-t8c9Eyc=s96-c','user',0),(8,'NAS ITNN','cc_nas@nortenayarit.tecnm.mx','pending',NULL,NULL,NULL,'2026-02-17 11:29:10','2026-02-17 11:29:10','114532895634682791054','https://lh3.googleusercontent.com/a/ACg8ocL2HMwGbM0NBFqAMsa2Aj_AXWcHQTv55wfLz4glqYU6kR0Kvw=s96-c','user',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-16 22:07:33
