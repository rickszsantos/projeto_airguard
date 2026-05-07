const express = require("express");
const router = express.Router();
const AuthController = ("../controllers/AuthController.js");



app.post("/", AuthController.showlogin);

app.post("/login", AuthController.login);




