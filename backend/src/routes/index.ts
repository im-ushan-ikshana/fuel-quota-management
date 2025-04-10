/**
 * @file index.ts
 * @description Main router file for the Express server. -- main router file
 * @author @im-ushan-ikshana
 */

import { Router } from 'express';                       //import router from express
import authRoutes from './auth.routes';                 // import auth routes
import userRoutes from './user.routes';                 // import user routes
import vehicleRoutes from './vehicle.routes';           // import vehicle routes
import stationRoutes from './station.routes';           // import station routes

//import the express router -- built in functionality of express to create a router object
const router = Router();

//Add all routes here - this is the main router
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/stations', stationRoutes);

//export the router for use in other files -- handles as a module (can be used in server and test files)
export default router;
