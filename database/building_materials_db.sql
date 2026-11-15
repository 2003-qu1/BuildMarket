-- =======================================================================
-- Build Market – Construction Materials Store Database Schema & Seed Data
-- Database: building_materials_db
-- Compatible with MySQL 5.7+ / 8.0+ / MariaDB (XAMPP / phpMyAdmin)
-- =======================================================================

CREATE DATABASE IF NOT EXISTS `building_materials_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `building_materials_db`;

-- Set SQL modes and foreign key checks
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `inventory`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================================
-- 1. Table: users
-- =======================================================================
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `status` ENUM('active', 'suspended', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- 2. Table: admins
-- =======================================================================
CREATE TABLE `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `role_title` VARCHAR(100) NOT NULL DEFAULT 'Super Admin',
  `permissions` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- 3. Table: categories
-- =======================================================================
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `description_en` TEXT NULL,
  `description_ar` TEXT NULL,
  `image_url` VARCHAR(500) NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- 4. Table: products
-- =======================================================================
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `name_en` VARCHAR(255) NOT NULL,
  `name_ar` VARCHAR(255) NOT NULL,
  `description_en` LONGTEXT NULL,
  `description_ar` LONGTEXT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `sale_price` DECIMAL(12, 2) NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `low_stock_threshold` INT NOT NULL DEFAULT 10,
  `unit` VARCHAR(50) NOT NULL DEFAULT 'Piece',
  `image_url` VARCHAR(500) NOT NULL,
  `additional_images` JSON NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `weight` DECIMAL(10, 2) NULL,
  `brand` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_sku` (`sku`),
  INDEX `idx_products_featured` (`is_featured`),
  INDEX `idx_products_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- 5. Table: addresses
-- =======================================================================
CREATE TABLE `addresses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `recipient_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NULL,
  `street_address` TEXT NOT NULL,
  `building_number` VARCHAR(50) NULL,
  `postal_code` VARCHAR(20) NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_addresses_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- 6. Table: orders
-- =======================================================================
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(191) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `notes` TEXT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL,
  `delivery_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `payment_method` ENUM('Cash on Delivery', 'Bank Transfer', 'Credit Card') NOT NULL DEFAULT 'Cash on Delivery',
  `payment_status` ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_number` (`order_number`),
  INDEX `idx_orders_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- 7. Table: order_items
-- =======================================================================
CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name_en` VARCHAR(255) NOT NULL,
  `product_name_ar` VARCHAR(255) NOT NULL,
  `unit_price` DECIMAL(12, 2) NOT NULL,
  `quantity` INT NOT NULL,
  `total_price` DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- 8. Table: payments
-- =======================================================================
CREATE TABLE `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
  `transaction_reference` VARCHAR(100) NULL,
  `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  INDEX `idx_payments_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- 9. Table: inventory
-- =======================================================================
CREATE TABLE `inventory` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `change_type` ENUM('initial', 'order_deduct', 'restock', 'adjustment', 'order_cancel_restock') NOT NULL,
  `quantity_change` INT NOT NULL,
  `previous_stock` INT NOT NULL,
  `new_stock` INT NOT NULL,
  `reference_order_id` INT UNSIGNED NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reference_order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  INDEX `idx_inventory_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- SEED DATA
-- Default Passwords: Password123! (bcrypt hash: $2a$10$oY7bO1rXgI3eS4wGz2y9re717fRkgXpCqJ6wz0W8BfqoM5oXWqE.2 or similar)
-- We will use a standard bcrypt hash for 'admin123' and 'customer123':
-- $2b$10$EP0T/7gP.jH6QpA9yq9H7u04WqI1q6kO5O6TqY7bO1rXgI3eS4wGz => 'admin123'
-- =======================================================================

-- Users (1 Admin, 2 Sample Customers)
-- Seeded default passwords hashed securely with bcrypt (10 rounds):
-- Admin (admin@buildmarket.com): admin123
-- Customers (ahmed@example.com, sarah@example.com): customer123
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `status`) VALUES
(1, 'Admin Qusay', 'admin@buildmarket.com', '$2a$10$dm.1vjull2u2sb9YZvDiz.DWGPbSJcpzhXfinFYS4WAeYWRA.lSpG', '+966501234567', 'admin', 'active'),
(2, 'Ahmed Al-Mansoor', 'ahmed@example.com', '$2a$10$s7o1aIQYwmTUqQ9Y/tDiwONWZXMZaBIbu8aXtKllo46GzMYPmv5py', '+966555112233', 'customer', 'active'),
(3, 'Sarah Jenkins', 'sarah@example.com', '$2a$10$s7o1aIQYwmTUqQ9Y/tDiwONWZXMZaBIbu8aXtKllo46GzMYPmv5py', '+966555998877', 'customer', 'active');

INSERT INTO `admins` (`id`, `user_id`, `role_title`, `permissions`) VALUES
(1, 1, 'Owner & Administrator', '{"all": true, "products": true, "orders": true, "inventory": true, "reports": true}');

-- Initial Product Categories (The 9 required categories)
INSERT INTO `categories` (`id`, `slug`, `name_en`, `name_ar`, `description_en`, `description_ar`, `image_url`, `display_order`) VALUES
(1, 'cement', 'Cement', 'إسمنت', 'Premium grade Portland cement, white cement, and masonry binding mixtures.', 'أسمنت بورتلاندي عالي الجودة، أسمنت أبيض، وخلاطات البناء القياسية.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', 1),
(2, 'steel-and-iron', 'Steel and Iron', 'حديد وصلب', 'Deformed reinforcing rebar, steel beams, mesh wire, and structural iron.', 'حديد تسليح عالي المقاومة، جسور فولاذية، وشبكات حديد إنشائية.', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80', 2),
(3, 'bricks-and-blocks', 'Bricks and Blocks', 'طوب وبلوك', 'Hollow concrete blocks, red clay bricks, insulated blocks, and paving stones.', 'بلك خرساني مفرغ، طوب أحمر، بلك بركاني عازل، وإنترلوك أرضيات.', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', 3),
(4, 'sand', 'Sand', 'رمل', 'Washed red dune sand, plaster sand, and fine silica sand for building.', 'رمل أحمر مغسول، رمل لياسة ناعم، ورمل سيليكا عالي النقاء.', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', 4),
(5, 'gravel-and-aggregates', 'Gravel and Aggregates', 'حصى وركام', 'Crushed rock aggregates in various sizes (3/8, 1/2, 3/4) and subbase material.', 'حصى وكنكري مكسر بمقاسات مختلفة ودفان ركام لتأسيس الخرسانة.', 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80', 5),
(6, 'plumbing-supplies', 'Plumbing Supplies', 'مستلزمات سباكة', 'PPR pipes, PVC drainage fittings, brass valves, and commercial water pumps.', 'أنابيب حرارية PPR، مواسير تصريف PVC، محابس نحاسية ومضخات مياه.', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80', 6),
(7, 'electrical-supplies', 'Electrical Supplies', 'مستلزمات كهربائية', 'Heavy-duty cables, distribution panels, circuit breakers, and conduits.', 'كابلات كهربائية مسلحة، قواطع تيار، لوحات توزيع وخراطيم تمديد.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', 7),
(8, 'paints', 'Paints', 'دهانات', 'Exterior weather-shield coatings, interior emulsions, primers, and sealers.', 'دهانات واجهات خارجية مقاومة، دهانات داخلية مائية، وأساسات وعوازل.', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80', 8),
(9, 'construction-tools', 'Construction Tools', 'أدوات بناء', 'Industrial concrete mixers, power trowels, measuring lasers, and safety gear.', 'خلاطات خرسانة، مناشير قص، أجهزة ليزر قياس، ومعدات سلامة مهنية.', 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80', 9);

-- Products Seed Data (Rich real construction items)
INSERT INTO `products` (`id`, `category_id`, `sku`, `name_en`, `name_ar`, `description_en`, `description_ar`, `price`, `sale_price`, `stock_quantity`, `low_stock_threshold`, `unit`, `image_url`, `is_featured`, `is_active`, `brand`) VALUES
-- Cement
(1, 1, 'CEM-001', 'Ordinary Portland Cement (OPC Type 1) 50kg', 'أسمنت بورتلاندي عادي (نوع 1) 50 كجم', 'High performance Portland cement conforming to ASTM C150 standards. Ideal for structural concrete, foundations, columns, and slabs.', 'أسمنت بورتلاندي عالي الجودة مطابق للمواصفات والمقاييس. مثالي للخرسانة المسلحة، القواعد، الأعمدة والأسقف.', 22.50, NULL, 450, 50, 'Bag', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', 1, 1, 'Yamama Cement'),
(2, 1, 'CEM-002', 'White Portland Cement 50kg', 'أسمنت أبيض بورتلاندي 50 كجم', 'Ultra-white high strength cement for decorative facades, precast panels, terrazzo, and aesthetic architectural finishes.', 'أسمنت فائق البياض عالي المتانة للواجهات الديكورية والقطع مسبقة الصب وأعمال التشطيبات المعمارية.', 38.00, 35.00, 180, 25, 'Bag', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', 0, 1, 'Saudi White Cement'),
(3, 1, 'CEM-003', 'Sulfate Resistant Cement (SRC) 50kg', 'أسمنت مقاوم للأملاح والكبريتات 50 كجم', 'Engineered specifically for underground structures and foundation works exposed to high soil sulfate and moisture levels.', 'مخصص للأساسات والأعمال الخرسانية تحت الأرض والمعرضة لنسب عالية من الأملاح والكبريتات والرطوبة.', 24.50, NULL, 300, 40, 'Bag', 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80', 1, 1, 'Southern Province'),

-- Steel and Iron
(4, 2, 'STL-012', 'Deformed Steel Rebar 12mm (Grade 60)', 'حديد تسليح مشرشر مقاس 12 ملم (درجة 60)', 'High-yield hot rolled ribbed reinforcing steel bar. Length: 12 meters. Standard structural grade for residential and commercial frameworks.', 'قضبان حديد تسليح مشرشرة عالية المقاومة بطول 12 متراً، معتمدة لكافة مشاريع البناء والإنشاءات الهيكلية.', 2850.00, 2750.00, 45, 10, 'Ton', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80', 1, 1, 'SABIC'),
(5, 2, 'STL-016', 'Deformed Steel Rebar 16mm (Grade 60)', 'حديد تسليح مشرشر مقاس 16 ملم (درجة 60)', 'Structural reinforcement steel rebar 16mm diameter, 12 meters length. Certified for heavy load foundations and columns.', 'حديد تسليح قطر 16 ملم طول 12 متر معتمد للأحمال الثقيلة والقواعد والأعمدة الحاملة.', 2880.00, NULL, 60, 10, 'Ton', 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=800&q=80', 1, 1, 'SABIC'),
(6, 2, 'STL-MSH', 'Welded Wire Mesh 8mm (2m x 5m)', 'شبك حديد تسليح مفرود 8 ملم (2×5 متر)', 'Electric resistance welded wire mesh for floor slabs, driveways, and concrete pavements.', 'شبك حديد تسليح مجلفن ملحوم للأرضيات والصبات الخرسانية بمقاس 2×5 متر.', 125.00, 115.00, 200, 30, 'Piece', 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80', 0, 1, 'Al-Ittefaq'),

-- Bricks and Blocks
(7, 3, 'BLK-020', 'Hollow Concrete Block 20x20x40 cm', 'بلك خرساني مفرغ 20×20×40 سم', 'Vibrated hollow concrete blocks with high compressive strength, perfect for external and load-bearing walls.', 'بلوك خرساني مجوف عالي الكبس والمقاومة، مناسب لبناء الجدران الخارجية والقواطع الإنشائية.', 2.80, NULL, 3500, 500, 'Piece', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', 1, 1, 'Modern Factory'),
(8, 3, 'BLK-INS', 'Thermal Insulated Red Clay Brick 20x20x40 cm', 'طوب أحمر فخاري عازل للحرارة 20×20×40 سم', 'Premium hollow clay brick featuring integrated polystyrene thermal insulation to reduce energy consumption.', 'طوب فخاري أحمر معزول بالفوم البوليسترين لتقليل استهلاك الطاقة وعزل درجات الحرارة العالية.', 4.50, 4.20, 1800, 300, 'Piece', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80', 1, 1, 'Red Bricks Co.'),

-- Sand
(9, 4, 'SND-WSH', 'Washed Red Plastering Sand (Tip Truck 18m³)', 'تريلا رمل أحمر مغسول للتشطيب واللياسة 18 م³', 'High purity screened red sand, double washed to remove salts and clay particles. Excellent for mortar and plaster.', 'رد تريلا رمل أحمر مغسول نقي ومفلتر خالي من الشوائب والأملاح لأعمال اللياسة والمونة الإسمنتية.', 650.00, 600.00, 25, 5, 'Truck (18m³)', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', 0, 1, 'Local Quarry'),
(10, 4, 'SND-WHT', 'Fine White Silica Sand 50kg Bag', 'كيس رمل سيليكا أبيض ناعم 50 كجم', 'Kiln-dried pure silica sand for specialized grouts, epoxy flooring, and exterior coatings.', 'رمل سيليكا أبيض نقي مجفف بالأفران للمواد الإيبوكسية والترويبات والخلطات الخاصة.', 18.00, NULL, 220, 30, 'Bag', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', 0, 1, 'Silica Co.'),

-- Gravel and Aggregates
(11, 5, 'GRV-34', 'Crushed Aggregate 3/4 Inch (Tip Truck 18m³)', 'رد تريلا حصى كنكري مكسر 3/4 بوصة (18 م³)', 'Machine-crushed limestone aggregates sized 3/4" (20mm) specifically graded for high strength structural concrete.', 'كنكري مكسر مقاس 3/4 بوصة خالي من الأتربة مخصص لصبات القواعد والأعمدة والخرسانة الجاهزة.', 720.00, NULL, 18, 4, 'Truck (18m³)', 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80', 0, 1, 'Crusher Direct'),
(12, 5, 'GRV-SUB', 'Base Coarse Subbase Road Base (18m³)', 'دفان سبيس تأسيسي معتمد للردم والطرق 18 م³', 'Graded stone subbase aggregate for site preparation, foundation bedding, and driveway compaction.', 'دفان صب بيس بمواصفات وزارة النقل لأعمال الردم والدك أسفل البلاطات وتأسيس المداخل.', 480.00, 450.00, 30, 5, 'Truck (18m³)', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80', 0, 1, 'Crusher Direct'),

-- Plumbing Supplies
(13, 6, 'PLM-PPR25', 'PPR Pipe Class 5 (25mm x 4m) Green', 'ماسورة بولي بروبلين خضراء PPR مقاس 25 ملم × 4 متر', 'German-standard PPR hot and cold water pressure pipes, corrosion resistant with 50-year service life.', 'مواسير حرارية خضراء للمياه الحارة والباردة مقاومة للتكلس والضغط العالي بضمان طويل.', 28.00, NULL, 400, 50, 'Piece', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80', 0, 1, 'AquaPipe Pro'),
(14, 6, 'PLM-PVC110', 'PVC Drainage Pipe 110mm (4 Inch) Class 4', 'ماسورة صرف صحي PVC مقاس 110 ملم (4 بوصة)', 'Heavy duty PVC pipe designed for underground gravity sewage, rainwater drainage, and soil stacks.', 'مواسير بلاستيك بي في سي للصرف الصحي وتصريف مياه الأمطار عالية التحمل وسهلة التركيب.', 45.00, 40.00, 250, 40, 'Piece', 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80', 0, 1, 'Gulf Plastic'),
(15, 6, 'PLM-PUMP1', 'Automatic Booster Water Pump 1HP', 'مضخة مياه دينامو ضغط أوتوماتيكي 1 حصان', 'Stainless steel impeller silent booster pump with automatic pressure switch and dry-run protection.', 'مضخة ماء صامتة دفع قوي 1 حصان بدينامو نحاس وحساس ضغط إلكتروني ذكي للحماية من الجفاف.', 420.00, 385.00, 35, 5, 'Unit', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', 1, 1, 'Calpeda Italy'),

-- Electrical Supplies
(16, 7, 'ELC-CBL6', 'Copper Building Wire 6mm² (100m Roll)', 'سلك كهرباء نحاس معزول 6 ملم² (لفة 100 متر)', 'Solid copper single-core THHN insulated building cable, fire-retardant standard for domestic & commercial power.', 'لفة سلك نحاس نقي معزول مقاوم للحرارة والحريق معتمد لدوائر التكييف والأفران.', 280.00, 260.00, 85, 15, 'Roll', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', 1, 1, 'Riyadh Cables'),
(17, 7, 'ELC-DB12', '12-Way 3-Phase Main Distribution Board (MDB)', 'لوحة توزيع كهرباء رئيسية 12 خط 3 فاز', 'Powder-coated metal distribution enclosure with neutral & earth bars, equipped with 100A main isolator.', 'طبلون كهرباء حديد معزول 12 خط 3 فاز مزود بقاطع رئيسي 100 أمبير ومواصفات أمان عالية.', 360.00, NULL, 40, 8, 'Piece', 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80', 0, 1, 'Schneider Electric'),

-- Paints
(18, 8, 'PNT-EXT', 'Weather-Resistant Exterior Emulsion Paint (18L)', 'دهان خارجي بروفايل مقاوم للعوامل الجوية (18 لتر)', 'Silicone-reinforced waterproof exterior paint offering supreme UV resistance and crack bridging.', 'دهان خارجي أكريليك مدعم بالسيليكون لحماية الواجهات من أشعة الشمس والأمطار والغبار.', 210.00, 195.00, 75, 12, 'Drum', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80', 1, 1, 'Jotun Paints'),
(19, 8, 'PNT-INT', 'Silk Matt Interior Acrylic Emulsion (18L)', 'دهان داخلي حريري نصف لمعة فاخر (18 لتر)', 'Eco-friendly odorless interior wall paint with superior washability and smooth silky finish.', 'دهان جدران داخلي نصف لمعة قابل للغسيل بدون رائحة نفاثة بتغطية ممتازة ونعومة فائقة.', 175.00, NULL, 90, 15, 'Drum', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', 0, 1, 'Jazeera Paints'),

-- Construction Tools
(20, 9, 'TLS-MXR', 'Heavy Duty Concrete Mixer 260L Electric', 'خلاطة أسمنت وخرسانة كهربائية سعة 260 لتر', 'Portable industrial batch concrete mixer with high torque motor, heavy steel drum, and reinforced transport wheels.', 'خلاطة خرسانة ومونة متنقلة بحوض فولاذي قوي ومحرك كهربائي عالي العزم مع كفرات سحب متينة.', 1650.00, 1499.00, 8, 2, 'Unit', 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80', 1, 1, 'Titan Pro Tools'),
(21, 9, 'TLS-WHL', 'Heavy Duty Steel Construction Wheelbarrow 100L', 'عربية بناء حديد متينة سعة 100 لتر بكفر صحراوي', 'Pneumatic tyre deep steel tray wheelbarrow reinforced for transporting rocks, cement, and wet concrete on sites.', 'عربية رمل وخرسانة حوض حديد سميك مع كفر هوائي عريض وشاسيه مدعم لتحمل أوزان البناء الشاقة.', 135.00, 120.00, 50, 10, 'Piece', 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80', 0, 1, 'MasterBuild'),
(22, 9, 'TLS-LSR', '360-Degree Self-Leveling Cross Line Laser Level', 'جهاز ميزان ليزر 360 درجة ذاتي الاستواء 16 خط', 'Green beam high visibility leveling tool with tripod, rechargeable battery, and magnetic wall bracket for masonry.', 'ميزان ليزر دقيق 16 خط أخضر ساطع مع حامل ثلاثي وبطارية قابلة للشحن لأعمال البناء والتشطيبات.', 290.00, 265.00, 22, 5, 'Unit', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80', 1, 1, 'Bosch Professional');

-- Initial Inventory Log records for seeded products
INSERT INTO `inventory` (`product_id`, `change_type`, `quantity_change`, `previous_stock`, `new_stock`, `notes`) 
SELECT `id`, 'initial', `stock_quantity`, 0, `stock_quantity`, 'Initial system stock import' 
FROM `products`;

-- Sample Customer Addresses
INSERT INTO `addresses` (`id`, `user_id`, `recipient_name`, `phone`, `city`, `district`, `street_address`, `building_number`, `is_default`) VALUES
(1, 2, 'Ahmed Al-Mansoor', '+966555112233', 'Riyadh', 'Al-Malqa', 'King Salman Road, Villa 42', '42', 1),
(2, 3, 'Sarah Jenkins', '+966555998877', 'Jeddah', 'Al-Shati', 'Corniche Road, Project Site B', '108', 1);

-- Sample Orders to populate Admin Dashboard metrics immediately
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `city`, `notes`, `subtotal`, `delivery_fee`, `tax`, `total_amount`, `status`, `payment_method`, `payment_status`, `created_at`) VALUES
(1, 'BM-2026-0001', 2, 'Ahmed Al-Mansoor', 'ahmed@example.com', '+966555112233', 'King Salman Road, Villa 42, Al-Malqa', 'Riyadh', 'Please deliver by morning to site contractor', 5700.00, 150.00, 0.00, 5850.00, 'Delivered', 'Bank Transfer', 'Paid', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'BM-2026-0002', 3, 'Sarah Jenkins', 'sarah@example.com', '+966555998877', 'Corniche Road, Project Site B, Al-Shati', 'Jeddah', 'Call before arrival', 2145.00, 80.00, 0.00, 2225.00, 'Processing', 'Cash on Delivery', 'Pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'BM-2026-0003', 2, 'Ahmed Al-Mansoor', 'ahmed@example.com', '+966555112233', 'King Salman Road, Villa 42, Al-Malqa', 'Riyadh', 'Urgent cement needed for ground floor pour', 900.00, 50.00, 0.00, 950.00, 'Pending', 'Cash on Delivery', 'Pending', NOW());

-- Order Items
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name_en`, `product_name_ar`, `unit_price`, `quantity`, `total_price`) VALUES
(1, 4, 'Deformed Steel Rebar 12mm (Grade 60)', 'حديد تسليح مشرشر مقاس 12 ملم (درجة 60)', 2850.00, 2, 5700.00),
(2, 20, 'Heavy Duty Concrete Mixer 260L Electric', 'خلاطة أسمنت وخرسانة كهربائية سعة 260 لتر', 1499.00, 1, 1499.00),
(2, 18, 'Weather-Resistant Exterior Emulsion Paint (18L)', 'دهان خارجي بروفايل مقاوم للعوامل الجوية (18 لتر)', 195.00, 2, 390.00),
(2, 22, '360-Degree Self-Leveling Cross Line Laser Level', 'جهاز ميزان ليزر 360 درجة ذاتي الاستواء 16 خط', 265.00, 1, 265.00),
(3, 1, 'Ordinary Portland Cement (OPC Type 1) 50kg', 'أسمنت بورتلاندي عادي (نوع 1) 50 كجم', 22.50, 40, 900.00);

-- Payments
INSERT INTO `payments` (`order_id`, `payment_method`, `amount`, `status`, `transaction_reference`) VALUES
(1, 'Bank Transfer', 5850.00, 'Completed', 'TRX-BANK-99812'),
(2, 'Cash on Delivery', 2225.00, 'Pending', NULL),
(3, 'Cash on Delivery', 950.00, 'Pending', NULL);
