const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/api/items", (req, res) => {
  const query = req.query.q?.toLowerCase();
  const filePath = path.join(__dirname, "products.json");

  if (!query) {
    return res
      .status(400)
      .json({ error: "Se requiere un parámetro de búsqueda (query)." });
  }

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading products.json:", err);
      return res.status(500).send("Error reading file");
    }

    const productsData = JSON.parse(data);

    // Filtrar productos por el título que contenga el query
    const filteredProducts = productsData.products.filter((product) =>
      product.title.toLowerCase().includes(query)
    );

    // Mapear solo los campos necesarios
    const results = filteredProducts.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      thumbnail: product.thumbnail,
    }));

    res.json(results);
  });
});

const productsPath = path.join(__dirname, "products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

app.get("/api/items/:id", (req, res) => {
  const productId = parseInt(req.params.id, 10);

  const product = productsPath.products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
