require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const cors = require("cors");

app.use(cors({
  origin: "*"
}));

app.listen(PORT, () => {
  console.log(`Servidor ClassFlow en puerto ${PORT}`);
});