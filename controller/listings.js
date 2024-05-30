const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("index.ejs", { allListing });
}

module.exports.renderNewForm = (req, res) => {
    res.render("new.ejs");
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const destination = await Listing.findById(id).populate({path: "reviews", populate:{
        path:"author",
      }
    }).populate("owner");
    if(!destination){
        req.flash("error", "listing does not exist");
        res.redirect("/listings");
    }else{
    res.render("show.ejs", { destination });
    }
}

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url + ".." + filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; 
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "listing does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload", "/upload/w_50");
    res.render("edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing});
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}