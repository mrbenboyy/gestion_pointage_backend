import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import absenceReasonRoutes from "./routes/absenceReasonRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/absence-reasons", absenceReasonRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/stats", statsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
