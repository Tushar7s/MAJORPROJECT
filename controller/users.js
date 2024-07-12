const nodemailer = require('nodemailer');
const User = require("../models/user.js");
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
// Function to generate a 6-digit random number
function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Function to send OTP to user's email
async function sendOtpToEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL2, // Your Gmail email address
            pass: process.env.PASS2 // Your Gmail password or application-specific password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL1, // Sender address
        to: email, // Recipient address
        subject: 'Your OTP for verification', // Subject line
        text: `Your OTP is: ${otp}` // Plain text body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Throw an error if email sending fails
    }
}
module.exports.renderDeleteUser = (req, res) => {
    res.render("users/deleteUser.ejs");
}

module.exports.match = async (req, res) => {
    try {
        let { email } = req.body;
        let verifyOtp = generateRandomNumber();
        let registered = await User.findOne({ email: email });
        if (registered) {
            sendOtpToEmail(email, verifyOtp);
            req.session.email = email;
            req.session.verifyOtp = verifyOtp;
            res.render("users/verifyUser.ejs");
        } else {
            req.flash("error", "Invalid Email");
            res.redirect("/deleteUser");
        }
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listings");
    }

}

module.exports.final = async (req, res) => {
    try {
        let { otp } = req.body;
        let { verifyOtp, email } = req.session;
        if (parseInt(otp) === verifyOtp) {
            await User.findOneAndDelete({ email: email });
            delete req.session.email;
            delete req.session.verifyOtp;
            req.flash("success", "User deleted succesfully");
            res.redirect("/logout");
        } else {
            req.flash("error", "Incorrect Otp");
            res.redirect("/verifyUser");
        }
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listings");
    }

}
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Generate OTP and send to email
        const otp = generateRandomNumber();
        await sendOtpToEmail(email, otp);
        let registered = await User.findOne({ email: email });
        if (!registered) {
            req.session.otp = otp;
            req.session.email = email;
            req.session.username = username;
            req.session.password = password;

            res.redirect("/verify");
        } else {
            req.flash("error", "E-mail already in use");
            res.redirect("/signup");
        }
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.verify = async (req, res) => {
    res.render("users/verify.ejs");
}

module.exports.check = async (req, res) => {
    let { otp } = req.body;
    const { otp: sessionOtp, email, username, password } = req.session;

    if (parseInt(otp) === sessionOtp) {
        // OTP is correct, finalize user registration
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        delete req.session.otp; // Clear OTP from session
        delete req.session.email; // Clear email from session
        delete req.session.username; // Clear username from session
        delete req.session.password; // Clear password from session

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust");
            res.redirect("/listings");
        })
    } else {
        req.flash("error", "Incorrect OTP");
        res.redirect("/verify");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}
module.exports.forgot = async (req, res) => {
    res.render("users/forgot.ejs");
}
module.exports.validate = async (req, res) => {
    try {
        const { id } = req.params;
        let { email } = req.body;
        let available = await User.findOne({ email: email });
        if (available) {
            const verifyOtp = generateRandomNumber();
            await sendOtpToEmail(email, verifyOtp);
            req.session.email = email;
            req.session.verifyOtp = verifyOtp;
            res.redirect("/verifyLogin");
        } else {
            req.flash("error", "User not found");
            res.redirect("/forgot");
        }
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/login");
    }
};
module.exports.isOtp = async (req, res) => {
    res.render("users/verifyLogin.ejs");
};
module.exports.valid = async (req, res) => {
    let { otp } = req.body;
    const { email, verifyOtp } = req.session;
    if (parseInt(otp) == verifyOtp) {
        res.render("users/reset.ejs");
    } else {
        req.flash("error", "incorrect otp");
        res.redirect("/verifyLogin");
    }
};

module.exports.reset = async (req, res) => {
    try {
        const password = req.body.password;
        const email = req.session.email; // Get the email from the session
        const user = await User.findOne({ email: email })
        if (!email) {
            throw new Error('Email not found in session');
        }
        // Update the user's password
        await user.setPassword(password);
        await user.save();

        // Clear session variables
        delete req.session.email;
        delete req.session.verifyOtp;

        res.redirect("/login");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/forgot");
    }
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to WanderLust!!");
    if (res.locals.redirectUrl) {
        res.redirect(res.locals.redirectUrl);
    } else {
        res.redirect("/listings");
    }
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        } else {
            req.flash("success", "you are logged out");
            res.redirect("/listings");
        }
    });
}
