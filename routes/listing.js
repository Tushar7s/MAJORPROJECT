const express = require("express");
const router = express.Router(); // creating router object
const wrapAsync = require("../utils/wrapAsync.js");
router.use(express.urlencoded({extended:true})); 
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controller/listings.js");
const listing = require("../models/listing.js");
const multer = require("multer");
const {storage} = require("../cloudconfig.js");
const upload = multer({storage }) // kis folder main upload karna hai

router.route("/", (req, res) => {
    res.render("home.ejs");
})
router.
    route("/listings")
        .get(wrapAsync(listingController.index))
        .post(isLoggedIn,  upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));
         

    router.get("/listings/new", isLoggedIn, (listingController.renderNewForm));
router.post("/listings/search", (listingController.search));
    router.get("/category/:categoryName", isLoggedIn, (listingController.showCategory));

router.route("/listings/:id")
.get(wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing));

router.get("/listings/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));
router.delete("listings/:id/delete", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
