const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
const { ref, push, set } = require("firebase/database");
const database = require("./firebaseConfig");

app.use(cors());
app.use(express.json());

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

app.get("/api/items/:id", (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const filePath = path.join(__dirname, "products.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading products.json:", err);
      return res.status(500).send("Error reading file");
    }

    const productsData = JSON.parse(data);

    // Buscar el producto por id
    const product = productsData.products.find((p) => p.id === productId);

    if (product) {
      // Excluir la imagen en la respuesta
      const { images, ...productWithoutImage } = product;
      res.json(productWithoutImage);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });
});

// Ruta para agregar una venta en Firebase
app.post("/api/addSale", (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res
      .status(400)
      .json({ error: "El campo 'productId' es requerido." });
  }

  // Crear una referencia a la ubicación de las ventas en la base de datos
  const salesRef = ref(database, "sales");
  const newSaleRef = push(salesRef); // Crear una nueva clave única para la venta

  // Crear el objeto de venta con el ID del producto y la fecha actual
  const saleData = {
    productId,
    date: new Date().toISOString(), // Formato de fecha ISO (datetime)
  };

  // Insertar la nueva venta en Firebase
  set(newSaleRef, saleData)
    .then(() => {
      res.status(201).json({ message: "Venta añadida exitosamente." });
    })
    .catch((error) => {
      console.error("Error al agregar la venta:", error);
      res
        .status(500)
        .json({ error: "Error al agregar la venta en la base de datos." });
    });
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
