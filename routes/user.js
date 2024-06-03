const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

const userController = require("../controller/users.js");
const user = require("../models/user.js");
router.get("/verify", (userController.verify));
router.post("/check", (userController.check));
router.get("/forgot", (userController.forgot));
router.post("/forgot", (userController.validate));
router.get("/verifyLogin", (userController.isOtp));
router.post("/verifyLogin", (userController.valid));
router.get("/deleteUser", (userController.renderDeleteUser));
router.post("/deleteUser", (userController.match));
router.post("/verifyUser", (userController.final));
router.post("/reset", (userController.reset))
router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
     .get(userController.renderLoginForm)

     //authenticate se pehle saveRedirectUrl middleware ko call kar diya taki value erase na ho
     .post(saveRedirectUrl, passport.authenticate("local", 
{failureRedirect: "/login", 
failureFlash : true}), userController.login);



router.get("/logout", userController.logout)
module.exports = router;
