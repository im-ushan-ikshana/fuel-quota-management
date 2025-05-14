USE fuel_quota_management;
CREATE TABLE `role` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `nic` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role` (
    `user_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department_of_motor_traffic` (
    `dmt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_no` VARCHAR(191) NOT NULL,
    `chassis_no` VARCHAR(191) NOT NULL,
    `engine_no` VARCHAR(191) NOT NULL,
    `owner_nic` VARCHAR(191) NOT NULL,
    `vehicle_brand` VARCHAR(191) NULL,
    `vehicle_model` VARCHAR(191) NULL,
    `vehicle_type` VARCHAR(191) NULL,
    `registered_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`dmt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle` (
    `vehicle_id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_no` VARCHAR(191) NOT NULL,
    `chassis_no` VARCHAR(191) NOT NULL,
    `engine_no` VARCHAR(191) NOT NULL,
    `vehicle_type` VARCHAR(191) NOT NULL,
    `qr_code` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `vehicle_registration_no_key`(`registration_no`),
    PRIMARY KEY (`vehicle_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fuel_station` (
    `station_id` INTEGER NOT NULL AUTO_INCREMENT,
    `station_name` VARCHAR(191) NOT NULL,
    `station_license` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `owner_user_id` INTEGER NOT NULL,

    PRIMARY KEY (`station_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fuel_quota` (
    `quota_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicle_id` INTEGER NOT NULL,
    `allocated_litres` DOUBLE NOT NULL,
    `used_litres` DOUBLE NOT NULL DEFAULT 0,
    `quota_period` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`quota_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fuel_transaction` (
    `transaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicle_id` INTEGER NOT NULL,
    `station_id` INTEGER NOT NULL,
    `operator_user_id` INTEGER NOT NULL,
    `pumped_litres` DOUBLE NOT NULL,
    `transaction_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_role` ADD CONSTRAINT `user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role` ADD CONSTRAINT `user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle` ADD CONSTRAINT `vehicle_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_station` ADD CONSTRAINT `fuel_station_owner_user_id_fkey` FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_quota` ADD CONSTRAINT `fuel_quota_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle`(`vehicle_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_transaction` ADD CONSTRAINT `fuel_transaction_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle`(`vehicle_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_transaction` ADD CONSTRAINT `fuel_transaction_station_id_fkey` FOREIGN KEY (`station_id`) REFERENCES `fuel_station`(`station_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_transaction` ADD CONSTRAINT `fuel_transaction_operator_user_id_fkey` FOREIGN KEY (`operator_user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
