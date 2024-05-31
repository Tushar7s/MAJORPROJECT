if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


app.use(express.static(path.join(__dirname, 'public')));//styling apply karne k liye use hota hai ye nhi to styling apply nahi hogi

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const user = require("./models/user.js");
const dbUrl = process.env.ATLASDB_URL
main().then(() =>{
    console.log("connected");
}).catch(err=>{
    console.log(err);
});
async function main( ){
    await mongoose.connect(dbUrl);
}
app.use(express.urlencoded({extended:true})); // to parse the values in req.body 
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);

//hamne ek router folder bana diya jisme sari listings rakhi hui hai to hame ab puri chiz likhne jaroorat nhi hai bas ye ek below line kafi hai 

 
//agar kisi se bhi match nhi hua to isse to ho hi jayega 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})
store.on("error", () => {
    console.log("ERRON IN MONGO SESSION STORE", err);
});
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};



app.use(session(sessionOptions));
app.use(flash());




app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



app.all("*", (req, res, next) =>{
    next(new ExpressError(404, "Page Not Found!"));
})
app.use((err, req, res, next) =>{
    let{statusCode = 500 , message = "Something Went Wrong"} = err;
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);
});
app.listen(8080, ()=>{
    console.log("server is listening");
})