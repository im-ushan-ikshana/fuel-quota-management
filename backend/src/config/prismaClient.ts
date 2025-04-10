/**
 * @file prismaClient.ts
 * @description Prisma client configuration file. -- Prisma client configuration file
 * @author @im-ushan-ikshana
 */
import { PrismaClient } from '@prisma/client';

// Create a new PrismaClient instance -- create a new instance of the Prisma client
const prisma = new PrismaClient();

//export the Prisma client instance -- export the Prisma client instance for use in other files
export default prisma;
