const express = require("express");
const { authenticateDevice } = require("../controllers/authController");

const router = express.Router();

router.post("/device", authenticateDevice);

module.exports = router;
