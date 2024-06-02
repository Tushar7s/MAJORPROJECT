const nodemailer = require('nodemailer');
const User = require("../models/user.js");

// Function to generate a 6-digit random number
function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Function to send OTP to user's email
async function sendOtpToEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'patidartushar78@gmail.com', // Your Gmail email address
            pass: 'yght krkp hdwc fslq' // Your Gmail password or application-specific password
        }
    });

    const mailOptions = {
        from: '22bit076@ietdavv.edu.in', // Sender address
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

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Generate OTP and send to email
        const otp = generateRandomNumber();
        await sendOtpToEmail(email, otp);

        // Store email and OTP in session for later verification
        req.session.otp = otp;
        req.session.email = email;
        req.session.username = username;
        req.session.password = password;

        res.redirect("/verify");
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
        const { newPassword } = req.body;
        const { email } = req.session; // Get the email from the session

        if (!email) {
            throw new Error('Email not found in session');
        }
        // Update the user's password
        await User.findOneAndUpdate(
            { email: email }, 
            { $set: { password: newPassword } },
            { new: true, runValidators: true }
        );

        // Clear session variables
        delete req.session.email;
        delete req.sesssion.verifyOtp;

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
