-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 17, 2023 at 03:00 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laundry`
--

-- --------------------------------------------------------

--
-- Table structure for table `batch_items`
--

CREATE TABLE `batch_items` (
  `id` int(11) NOT NULL,
  `name` varchar(25) NOT NULL,
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sizes`)),
  `icon` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `batch_items`
--

INSERT INTO `batch_items` (`id`, `name`, `sizes`, `icon`) VALUES
(1, 'Jean', '[{\"size\":\"XS\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"S\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"M\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"L\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"XL\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"XXL\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}}]', 'jean.png'),
(2, 'Shirt', '[{\"size\":\"XS\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"S\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"M\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"L\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"XL\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"XXL\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}}]', 'shirt.png'),
(3, 'T-Shirt', '[{\"size\":\"XS\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"S\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"M\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"L\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"XL\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}},{\"size\":\"XXL\",\"price\":{\"iron\":10,\"wash\":12,\"dry\":10}}]', 't-shirt.png');

-- --------------------------------------------------------

--
-- Table structure for table `batch_status`
--

CREATE TABLE `batch_status` (
  `id` int(11) NOT NULL,
  `status` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `batch_status`
--

INSERT INTO `batch_status` (`id`, `status`) VALUES
(11, 'Cancelled'),
(10, 'Delivered'),
(5, 'Dried'),
(4, 'Drying'),
(8, 'Folding and Packing'),
(7, 'Ironed'),
(6, 'Ironing'),
(9, 'Ready for Pickup'),
(1, 'Waiting for Processing'),
(3, 'Washed'),
(2, 'Washing');

-- --------------------------------------------------------

--
-- Table structure for table `client_batch`
--

CREATE TABLE `client_batch` (
  `id` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `tagId` varchar(20) NOT NULL,
  `batch` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`batch`)),
  `currentStatus` int(11) NOT NULL,
  `cost` float NOT NULL,
  `dueDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `client_batch`
--

INSERT INTO `client_batch` (`id`, `clientId`, `tagId`, `batch`, `currentStatus`, `cost`, `dueDate`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'TAG00001', '[{\"itemId\":1,\"size\":\"XL\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":15},\"iron\":{\"cost\":15},\"totalCost\":40},{\"itemId\":2,\"size\":\"S\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"totalCost\":22},{\"itemId\":2,\"size\":\"XS\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"iron\":{\"cost\":10},\"totalCost\":32}]', 9, 94, '2023-10-16 18:30:00', '2023-10-12 06:03:01', '2023-10-17 12:15:58'),
(2, 1, 'TAG00002', '[{\"itemId\":1,\"size\":\"XS\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"totalCost\":22}]', 1, 22, '2023-10-16 18:30:00', '2023-10-17 04:39:39', '2023-10-17 12:17:00'),
(3, 1, 'TAG00003', '[{\"itemId\":2,\"size\":\"XS\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"iron\":{\"cost\":10},\"totalCost\":32},{\"itemId\":2,\"size\":\"XS\",\"dry\":{\"cost\":10},\"iron\":{\"cost\":10},\"totalCost\":20}]', 9, 52, '2023-10-17 18:30:00', '2023-10-17 06:06:46', '2023-10-17 09:08:44'),
(4, 1, 'TAG00004', '[{\"itemId\":3,\"size\":\"XS\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"totalCost\":22},{\"itemId\":2,\"size\":\"S\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"iron\":{\"cost\":10},\"totalCost\":32}]', 10, 54, '2023-10-17 18:30:00', '2023-10-17 06:07:30', '2023-10-17 12:04:31'),
(5, 1, 'TAG00005', '[{\"itemId\":3,\"size\":\"S\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"iron\":{\"cost\":10},\"totalCost\":32},{\"itemId\":1,\"size\":\"XS\",\"dry\":{\"cost\":19},\"wash\":{\"cost\":13},\"iron\":{\"cost\":13},\"totalCost\":45},{\"itemId\":2,\"size\":\"S\",\"dry\":{\"cost\":12},\"wash\":{\"cost\":16},\"iron\":{\"cost\":19},\"totalCost\":47},{\"itemId\":3,\"size\":\"S\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"totalCost\":22}]', 9, 146, '2023-10-17 20:30:00', '2023-10-17 06:08:03', '2023-10-17 12:06:33'),
(6, 1, 'TAG00006', '[{\"itemId\":1,\"size\":\"S\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"iron\":{\"cost\":10},\"totalCost\":32}]', 1, 32, '2023-10-22 18:30:00', '2023-10-17 06:08:19', '2023-10-17 06:08:19'),
(7, 2, 'TAG00007', '[{\"itemId\":1,\"size\":\"XS\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":13},\"totalCost\":23},{\"itemId\":2,\"size\":\"S\",\"wash\":{\"cost\":14},\"iron\":{\"cost\":10},\"totalCost\":24}]', 2, 47, '2023-10-17 07:30:00', '2023-10-17 09:07:18', '2023-10-17 09:58:36'),
(8, 1, 'TAG00008', '[{\"itemId\":1,\"size\":\"XS\",\"dry\":{\"cost\":10},\"iron\":{\"cost\":10},\"totalCost\":20},{\"itemId\":2,\"size\":\"XL\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":17},\"iron\":{\"cost\":10},\"totalCost\":37},{\"itemId\":2,\"size\":\"S\",\"iron\":{\"cost\":10},\"totalCost\":10}]', 2, 67, '2023-10-16 18:30:00', '2023-10-17 10:13:39', '2023-10-17 10:20:01'),
(9, 1, 'TAG00009', '[{\"itemId\":1,\"size\":\"XS\",\"wash\":{\"cost\":12},\"iron\":{\"cost\":10},\"totalCost\":22},{\"itemId\":2,\"size\":\"S\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"totalCost\":22}]', 1, 44, '2023-10-18 18:30:00', '2023-10-17 10:19:23', '2023-10-17 10:19:23'),
(10, 3, 'TAG00010', '[{\"itemId\":1,\"size\":\"XS\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"iron\":{\"cost\":10},\"totalCost\":32},{\"itemId\":2,\"size\":\"S\",\"dry\":{\"cost\":10},\"wash\":{\"cost\":12},\"totalCost\":22}]', 1, 54, '2023-10-16 18:30:00', '2023-10-17 12:01:04', '2023-10-17 12:01:04');

-- --------------------------------------------------------

--
-- Table structure for table `configurations`
--

CREATE TABLE `configurations` (
  `id` int(11) NOT NULL,
  `feature` varchar(30) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`))
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `configurations`
--

INSERT INTO `configurations` (`id`, `feature`, `value`) VALUES
(1, 'late_pickup_fee', '10'),
(2, 'tax_on_bill', '18'),
(3, 'late_days', '30');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role`) VALUES
(1, 'admin'),
(2, 'client');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `city` varchar(20) DEFAULT NULL,
  `state` varchar(20) DEFAULT NULL,
  `role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `phone`, `city`, `state`, `role`) VALUES
(1, 'Rajdeep Singh', 'rajdeep', '$2a$10$mIWD2C/eZSUHumhm6f2g5.Z7VSBd17ab0sMKSNAmZ7i8lF7FF9qWG', 'developtechphp@gmail.com', '7973770361', 'Sangrur', 'Punjab', 2),
(2, 'Jashan Kaur', '', '', 'jashan@gmail.com', '9011022921', 'Sunam', 'Punjab', 2),
(3, 'Navjot Kaur', '', '', 'navjot@gmail.com', '9022204222', 'Dhuri', 'Punjab', 2),
(4, 'Simran Kaur', '', '', 'simran@gmail.com', '9323290322', 'Dhuri', 'Punjab', 2),
(5, 'Rajveer', '', '', 'rajveer@gmail.com', '9054590444', 'Sangrur', 'Punjab', 2),
(7, 'Rakesh', '', '', 'rakesh@gmail.com', '9054510010', NULL, NULL, 2),
(8, 'Jimmi', '', '', 'jimmi@gmail.com', '5374892344', NULL, NULL, 2),
(9, 'Rubika', '', '', 'rubika@gmail.com', '9482374988', 'Sangrur', 'Punjab', 2),
(10, 'Sunena', '', '', 'sunena@gmail.com', '9983273783', 'Sangrur', 'Punjab', 2),
(11, 'Lovely', '', '', 'lovely@gmail.com', '9019018883', 'Khanna', 'Punjab', 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `batch_items`
--
ALTER TABLE `batch_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `batch_status`
--
ALTER TABLE `batch_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `status` (`status`);

--
-- Indexes for table `client_batch`
--
ALTER TABLE `client_batch`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tagId` (`tagId`),
  ADD KEY `clientId` (`clientId`),
  ADD KEY `status` (`currentStatus`);

--
-- Indexes for table `configurations`
--
ALTER TABLE `configurations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`,`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `roleId` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `batch_items`
--
ALTER TABLE `batch_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `batch_status`
--
ALTER TABLE `batch_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `client_batch`
--
ALTER TABLE `client_batch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `configurations`
--
ALTER TABLE `configurations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `client_batch`
--
ALTER TABLE `client_batch`
  ADD CONSTRAINT `clientId` FOREIGN KEY (`clientId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `status` FOREIGN KEY (`currentStatus`) REFERENCES `batch_status` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `roleId` FOREIGN KEY (`role`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
