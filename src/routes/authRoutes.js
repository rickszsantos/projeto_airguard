const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");



router.get("/", AuthController.showLogin);

router.get("/home", AuthController.showHome);

router.post("/login", AuthController.login);

router.get("/cadastro", AuthController.showCadastro);





module.exports = router;
