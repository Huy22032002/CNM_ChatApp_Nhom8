require("dotenv").config();

const { connectDB } = require("./src/configs/connectRDS");
connectDB();

const { syncDB } = require("./src/configs/syncDB"); //dang loi tao indexes ltuc

const PORT = process.env.PORT;

const app = require("./src/app");

app.listen(PORT, (req, res) => {
  console.log(`listen on PORT ${PORT}`);
});
