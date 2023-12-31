const express = require("express");
const routes = require("./routes");
const db = require("./schemas");
const cookieParser = require("cookie-parser");

const app = express();

app.set("port", 3000);
app.use("/api", [express.json(), express.urlencoded({ extended: false }), cookieParser(), routes]);

app.listen(app.get("port"), () => {
    console.log(app.get("port"), "is running.");
});
