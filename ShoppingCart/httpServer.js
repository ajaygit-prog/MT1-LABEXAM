import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Shopping cart array
const cart = [
  {
    id: 1,
    productName: "Wireless Mouse",
    price: 799,
    quantity: 2,
  },
  {
    id: 2,
    productName: "Keyboard",
    price: 999,
    quantity: 1,
  },
  {
    id: 3,
    productName: "Headphones",
    price: 1499,
    quantity: 1,
  },
];

// Create HTTP server
const server = http.createServer((req, res) => {
  // GET /
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
    });

    res.end(`
            <h1>Welcome to Shopping Cart Management</h1>
            <p>Node.js HTTP Server is working successfully.</p>
        `);
  }

  // GET /cart
  else if (req.method === "GET" && req.url === "/cart") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(cart));
  }

  // GET /about
  else if (req.method === "GET" && req.url === "/about") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
    });

    res.end(`
            <h1>About Shopping Cart</h1>
            <p>This application manages shopping cart products.</p>
            <p>Created using Node.js HTTP and FS modules.</p>
        `);
  }

  // GET /home
  else if (req.method === "GET" && req.url === "/home") {
    const filePath = path.join(__dirname, "public", "index.html");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, {
          "Content-Type": "text/plain",
        });

        res.end("Error reading HTML file.");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
      });

      res.end(data);
    });
  }

  // POST /add-to-cart
  else if (req.method === "POST" && req.url === "/add-to-cart") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      // Prevent excessively large request bodies
      if (body.length > 100000) {
        res.writeHead(413, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            error: "Request body is too large",
          }),
        );

        req.destroy();
      }
    });

    req.on("end", () => {
      if (res.writableEnded) return;

      try {
        const product = JSON.parse(body);

        const { id, productName, price, quantity } = product;

        if (
          id === undefined ||
          !Number.isInteger(id) ||
          id <= 0 ||
          typeof productName !== "string" ||
          productName.trim() === "" ||
          typeof price !== "number" ||
          !Number.isFinite(price) ||
          price < 0 ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          res.writeHead(400, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              error: "Valid id, productName, price and quantity are required",
            }),
          );

          return;
        }

        const existingProduct = cart.find((item) => item.id === id);

        if (existingProduct) {
          res.writeHead(409, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              error: "Product ID already exists",
            }),
          );

          return;
        }

        cart.push({
          id,
          productName: productName.trim(),
          price,
          quantity,
        });

        res.writeHead(201, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            message: "Product added successfully",
            product,
          }),
        );
      } catch (error) {
        if (!res.writableEnded) {
          res.writeHead(400, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              error: "Invalid JSON request body",
            }),
          );
        }
      }
    });
  }

  
  else {
    res.writeHead(404, {
      "Content-Type": "application/json",
    }) ;

    res.end(
      JSON.stringify({
        error: "404 Not Found",
      }),
    );
  }
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
