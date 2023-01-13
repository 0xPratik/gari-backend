"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const mongoose_1 = __importDefault(require("mongoose"));
const db = "mongodb+srv://rw_minningdb:erodWeokldQASDlold34QW@production-main.y7axy.mongodb.net/minningdb?retryWrites=true&w=majority";
const app = (0, express_1.default)();
if (db) {
    mongoose_1.default
        .connect(db, {
        readPreference: "secondaryPreferred",
    })
        .then(() => console.log("db connected"))
        .catch((err) => console.log("DB Connection Failed", err));
}
app.use((0, morgan_1.default)("dev"));
const allowedOrigins = ["https://pre-mint.chingari.io"];
const options = {
    origin: allowedOrigins,
};
app.use((0, cors_1.default)(options));
app.use(express_1.default.json());
app.use("/api/", index_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`RUNNING ON PORT ${PORT}`);
});
