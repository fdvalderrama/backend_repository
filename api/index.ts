import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, "products.json");

// Endpoint para obtener productos filtrados por búsqueda
app.get("/api/items", (req, res) => {
  const query =
    typeof req.query.q === "string" ? req.query.q.toLowerCase() : undefined;

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al leer el archivo de productos" });
    }

    const productsData = JSON.parse(data);

    if (!query) {
      return res
        .status(400)
        .json({ error: "Se requiere un parámetro de búsqueda (query)." });
    }

    const filteredProducts = productsData.products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );

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

// Endpoint para obtener un producto específico por ID
app.get("/api/items/:id", (req, res) => {
  const productId = parseInt(req.params.id, 10);

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al leer el archivo de productos" });
    }

    const productsData = JSON.parse(data);
    const product = productsData.products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
  });
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
