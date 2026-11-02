import express from "express";

const app = express();
const PORT = 4000;

app.use(express.json());

let cart = [
  {
    id: 1,
    productName: "Wireless Mouse",
    price: 799,
    quantity: 2,
    category: "Electronics",
  },
  {
    id: 2,
    productName: "Keyboard",
    price: 999,
    quantity: 1,
    category: "Electronics",
  },
  {
    id: 3,
    productName: "Notebook",
    price: 100,
    quantity: 5,
    category: "Stationery",
  },
];


function isValidProduct(product, requireId = false) {
  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return false;
  }

  const { id, productName, price, quantity, category } = product;

  if (requireId && (!Number.isInteger(id) || id <= 0)) {
    return false;
  }

  return (
    typeof productName === "string" &&
    productName.trim() !== "" &&
    typeof price === "number" &&
    Number.isFinite(price) &&
    price >= 0 &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    typeof category === "string" &&
    category.trim() !== ""
  );
}


app.get("/cart", (req, res) => {
  res.status(200).json(cart);
});


app.get("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid product ID" ,
    });
  }

  const product = cart.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  res.status(200).json({
    ...product,
    totalPrice: product.price * product.quantity,
  });
});

// POST /cart
// Add a new product
app.post("/cart", (req, res) => {
  const product = req.body;

  if (!isValidProduct(product, true)) {
    return res.status(400).json({
      error: "Valid id, productName, price, quantity and category are required",
    });
  }

  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    return res.status(409).json({
      error: "Product ID already exists",
    });
  }

  const newProduct = {
    id: product.id,
    productName: product.productName.trim(),
    price: product.price,
    quantity: product.quantity,
    category: product.category.trim(),
  };

  cart.push(newProduct);

  res.status(201).json({
    message: "Product added successfully",
    product: newProduct,
  });
});

// PUT /cart/:id
// Update an existing product
app.put("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid product ID",
    });
  }

  const productIndex = cart.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  const updates = req.body;

  if (
    !updates ||
    typeof updates !== "object" ||
    Array.isArray(updates) ||
    Object.keys(updates).length === 0
  ) {
    return res.status(400).json({
      error: "Provide product details to update",
    });
  }

  const allowedFields = ["productName", "price", "quantity", "category"];

  const invalidFields = Object.keys(updates).filter(
    (key) => !allowedFields.includes(key),
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: "Invalid fields. ID cannot be updated.",
    });
  }

  const updatedProduct = {
    ...cart[productIndex],
    ...updates,
  };

  if (!isValidProduct(updatedProduct, true)) {
    return res.status(400).json({
      error: "Invalid product details",
    });
  }

  updatedProduct.productName = updatedProduct.productName.trim();
  updatedProduct.category = updatedProduct.category.trim();

  cart[productIndex] = updatedProduct;

  res.status(200).json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

// DELETE /cart/:id
// Delete a product
app.delete("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid product ID",
    });
  }

  const productIndex = cart.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  const deletedProduct = cart.splice(productIndex, 1)[0];

  res.status(200).json({
    message: "Product deleted successfully",
    product: deletedProduct,
  });
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON request body",
    });
  }

  res.status(500).json({
    error: "Internal server error",
  });
});

// Handle invalid endpoints
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
