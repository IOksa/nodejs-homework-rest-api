const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const crypto = require("node:crypto");

const {User} = require("../../models/user");

const {HttpError, sendEmail} = require("../../helpers");

const {BASE_URL} = process.env;

const register = async(req, res)=> {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if(user){
        throw HttpError(409, "Email is used");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = crypto.randomUUID();

    const newUser = await User.create({...req.body, password: hashPassword, avatarURL, verificationToken});

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click verify email</a>`,
        text: `
        To confirm your registration, please click on link below\n
        ${BASE_URL}/users/verify/${verificationToken}`
    };

   
    await sendEmail(verifyEmail);

    res.status(201).json({
        user:{
            email: newUser.email,
            subscription: newUser.subscription,
        }
    })
}


module.exports = register;