const router = require("express").Router();

//! Auth Router
router.use("/api/v1/auth", require("./Auth.js"));

//! Project Router
router.use("/api/v1/project", require("./Project.js"));

//! Payment Router
router.use("/api/v1/payment", require("./Payment.js"));

//! CSV Router
router.use("/api/v1/csv", require("./Csv.js"));

module.exports = router;
