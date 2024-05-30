const Listing = require("./models/listing.js");
const review = require("./models/review.js");
const { listingSchema , reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        // if user is not logged in save originalUrl
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to perform this task");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.validateListing = async(req, res, next) => {
    console.log(req.body)
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let {errors} = reviewSchema.validate(req.body);
    if(errors){
        let errorMsg = errors.detail.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    }
        else{
            next();
        }
    }

    module.exports.isReviewAuthor = async (req, res, next) => {
        const { id, reviewId } = req.params;
        let Review = await review.findById(reviewId);
        if(!Review.author._id.equals(res.locals.currUser._id)){
            req.flash("error", "You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
    
        next();
    }