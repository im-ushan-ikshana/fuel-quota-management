/*
  Warnings:

  - A unique constraint covering the columns `[registration_no]` on the table `department_of_motor_traffic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chassis_no]` on the table `department_of_motor_traffic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[engine_no]` on the table `department_of_motor_traffic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nic]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `department_of_motor_traffic_registration_no_key` ON `department_of_motor_traffic`(`registration_no`);

-- CreateIndex
CREATE UNIQUE INDEX `department_of_motor_traffic_chassis_no_key` ON `department_of_motor_traffic`(`chassis_no`);

-- CreateIndex
CREATE UNIQUE INDEX `department_of_motor_traffic_engine_no_key` ON `department_of_motor_traffic`(`engine_no`);

-- CreateIndex
CREATE UNIQUE INDEX `user_nic_key` ON `user`(`nic`);
