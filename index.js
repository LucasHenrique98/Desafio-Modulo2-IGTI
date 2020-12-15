import express from "express";
const app = express();
import { promises as fs } from "fs";
import router from "./routes/gradesRouter.js";
app.use(express.json());
app.use("/grades", router);

app.listen(3000, async () => {
  try {
    await fs.readFile("grades.json");
  } catch (err) {
    console.log(err);
  }
});
