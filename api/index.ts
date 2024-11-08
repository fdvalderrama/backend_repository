const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/getAll", (req, res) => {
  const filePath = path.join(__dirname, "products.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading productos.json:", err);
      res.status(500).send("Error reading file");
    } else {
      const products = JSON.parse(data);
      res.json(products);
    }
  });
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
