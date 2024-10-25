const express = require("express");
const Project = require("../models/Project");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    // Allow only CSV files
    if (path.extname(file.originalname) !== ".csv") {
      return cb(new Error("Only CSV files are allowed!"), false);
    }
    cb(null, true);
  },
});
router.get("/export", async (req, res) => {
  try {
    const projects = await Project.find();
    let csvData = "name,description,dueDate,status\n";
    projects.forEach((project) => {
      csvData += `${project.name},${project.description},${project.dueDate.toISOString()},${project.status}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("projects.csv");
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to import projects from CSV
router.post("/import", upload.single("file"), (req, res) => {
  const results = [];

  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a CSV file!" });
  }

  // Process the uploaded CSV file
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      // Validate and filter the data
      const validProjects = results.filter((project) => {
        return (
          project.name &&
          project.description &&
          project.dueDate &&
          ["pending", "active", "completed"].includes(project.status)
        );
      });

      if (validProjects.length === 0) {
        return res.status(400).json({ message: "No valid projects to import!" });
      }

      try {
        // Insert valid data into the database
        await Project.insertMany(validProjects);
        res.json({ message: "Projects imported successfully!" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      } finally {
        // Remove the uploaded file after processing
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
    })
    .on("error", (error) => {
      res.status(500).json({ message: `Error reading CSV: ${error.message}` });
    });
});

module.exports = router;
