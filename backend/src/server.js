const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const { version } = require("os");

const app = express();
const PORT = 3000;

const dbPath = path.join(__dirname, "resource/main.db");
const db = new Database(dbPath);

app.get("/", (req, res) => {
  res.json({
    name: "Где поесть недорого в Твери - API",
    version: "1.0.0",
    endpoints: {
      places: "GET /api/places",
      placeById: "GET /api/places/:id",
    },
  });
});

app.get("/api/places", (req, res) => {
  try {
    let sql = "SELECT * from places WHERE is_active = 1";
    const params = [];

    if (req.query.maxCheck) {
      sql += " AND avg_check <= ?";
      params.push(Number(req.query.maxCheck));
    }

    if (req.query.type) {
      sql += " AND type = ?";
      params.push(req.query.type);
    }

    if (req.query.district) {
      sql += " AND district = ?";
      params.push(req.query.district);
    }
    if (req.query.university) {
      sql += " AND near_university LIKE ?";
      params.push(req.query.university);
    }
    if (req.query.search) {
      sql += " AND name LIKE ?";
      params.push(req.query.search);
    }

    const sort = req.query.sort || "rating";
    if (sort === "price") {
      sql += " ORDER BY avg_check ASC";
    } else if (sort === "rating") {
      sql += " ORDER BY rating DESC";
    } else {
      sql += " ORDER BY name ASC";
    }

    const places = db.prepare(sql).all(...params);
    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`)
})