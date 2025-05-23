import { Router } from "express";
import fuelStationRouter from "./routes/fuelStation.routes";
import fuelOperatorRouter from "./routes/fuelOperators.routes";
import authRouter from "./routes/auth.routes";
import adminRouter from "./routes/admin.routes";
import mainRouter from "./routes/routes";
import transactionRouter from "./routes/transactions.routes";
import vehicleRouter from "./routes/vehicles.routes";


const v1router = Router();

//define router info
v1router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API of fuel management system",
    version: "1.0.0",
  });
});

//add all the routes here
v1router.use("/fuel/operators", fuelOperatorRouter);
v1router.use("/fuel/stations", fuelStationRouter);
v1router.use("/auth", authRouter);
v1router.use("/admin", adminRouter);
v1router.use("/main", mainRouter);
v1router.use("/transactions", transactionRouter);
v1router.use("/vehicles", vehicleRouter);


export default v1router;
