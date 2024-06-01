const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}
module.exports.verify = async(req, res) => {
    res.render("users/verify.ejs");
}
module.exports.check = async(req, res) => {
    let {otp} = req.body;
    res.send(otp);
}
module.exports.signup = async (req, res) => {
    try{
        let{username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err)=> {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust");
            res.redirect("/listings");
        })
    }catch(err){
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req,res) => {
    req.flash("success", "Welcome back to WanderLust!!");
    //jese hi logged in hoga wese hi passport is redirectUrl ko reset kar dega to hamare pass isme khali value
    //ayegi ise thik karne ke liye hum ise locally access kar lenge 
    if(res.locals.redirectUrl){
    res.redirect(res.locals.redirectUrl);
    }else{
        res.redirect("/listings")
    }
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
      if(err){
        next(err);
      }else{
        req.flash("success", "you are logged out");
        res.redirect("/listings");
      }
    })
}