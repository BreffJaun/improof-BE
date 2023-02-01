// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

// I M P O R T:  F U N C T I O N S
import TalentModel from "../models/talentModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue";
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;

//========================

// GET List of all talents
export async function usersGetAll(req, res, next) {
  try {
    res.json(await TalentModel.find());
  } catch (err) {
    next(err);
  }
}

// POST (Add) a new Talent
export async function usersPostUser(req, res, next) {
  try {
    const newUser = req.body;
    // in the TalentModel we check if the given email-address is unique
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const createdUser = await TalentModel.create({
      ...newUser,
      password: hashedPassword,
    });

    // AVATAR IMPLEMENT BEGIN //
    if (req.file) {
      await TalentModel.findByIdAndUpdate(createdUser._id, {
        avatar: `http://localhost:2404/${req.file.path}`,
      });
    }
    // AVATAR IMPLEMENT END //

    // VERIFY EMAIL IMPLEMENT BEGIN //
    // sgMail.setApiKey(SENDGRID_KEY)
    // const verifyToken = jwt.sign(
    //   {email: newUser.email, _id: createdUser._id},
    //   JWT_KEY,
    //   {expiresIn: '1h'}
    //   )
    // const msg = {
    //   to: newUser.email, // Change to your recipient
    //   from: `${"fillIn@your.mail"}`, // Change to your verified sender
    //   subject: 'EMAIL VERIFICATION for the Record-Shop',
    //   text: `To verify your email, please click on this link: http://localhost:2404/users/verify/${verifyToken}`,
    //   html: `<p><a href="http://localhost:2404/users/verify/${verifyToken}">Verify your email!</a></p>`,
    // }
    // const response = await sgMail.send(msg);
    // VERIFY EMAIL IMPLEMENT END //

    // res.status(201).json({message: "Please verify your account via the link in the email we send you, to use your Profile."})
    res.status(201).json(createdUser);
  } catch (err) {
    next(err);
  }
}

// GET Verify new User via Email
export async function verifyEmail(req, res, next) {
  try {
    const verifyToken = req.params.token;
    const decodedVerifyToken = jwt.verify(verifyToken, JWT_KEY);
    const id = decodedVerifyToken._id;
    const user = await TalentModel.findByIdAndUpdate(id, { isVerified: true });
    res.json({ message: "E-Mail is now SUCCESSFULLY verified!" });
    // res.redirect('http://localhost:2404/login')
    // if we have a frontend, we can direct the successful verification to the login page
  } catch (err) {
    next(err);
  }
}

// POST Request email for forgotten password
export async function forgotPassword(req, res, next) {
  try {
    const userData = req.body;
    const userFromDb = await TalentModel.findOne({ email: userData.email });
    if (!userFromDb) {
      const err = new Error("There is no user with this email!");
      err.statusCode = 401;
      throw err;
    }

    // VERIFY EMAIL IMPLEMENT BEGIN //
    sgMail.setApiKey(SENDGRID_KEY);
    const verifyToken = jwt.sign(
      { email: userFromDb.email, _id: userFromDb._id },
      JWT_KEY,
      { expiresIn: "1h" }
    );
    const msg = {
      to: userFromDb.email, // Change to your recipient
      from: `${"fillIn@your.mail"}`, // Change to your verified sender
      subject: "SET A NEW PASSWORD for ......",
      text: `To change your password, please click on this link: http://localhost:2404/users/setnewpassword/${verifyToken}`,
      html: `<p><a href="http://localhost:2404/users/setnewpassword/${verifyToken}">Reset your password!</a></p>`,
    };
    const response = await sgMail.send(msg);
    // VERIFY EMAIL IMPLEMENT END //

    res
      .status(201)
      .json({ message: "You got send an Email to set your new password." });
  } catch (err) {
    next(err);
  }
}

// POST Change (forgotten) password after email request
export async function setNewPassword(req, res, next) {
  try {
    // FIRST REQUEST (EMAIL) //
    const verifyToken = req.params.token;
    const decodedVerifyToken = jwt.verify(verifyToken, JWT_KEY);
    // FIRST REQUEST (EMAIL) PAUSE... //

    // SECOND REQUEST (WITH SUBMIT / FORM) BEGIN //
    const id = decodedVerifyToken._id;
    const newPassword = req.body.password;
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await TalentModel.findByIdAndUpdate(id, {
        password: hashedPassword,
        isVerifiedTCP: false,
      });
      console.log(updatedUser);
      res.json({ message: "Set new Password was SUCCESSFUL!" });
      // SECOND REQUEST (WITH SUBMIT / FORM) END //

      // FIRST REQUEST (EMAIL) CONTINUE... //
    } else {
      const user = await TalentModel.findByIdAndUpdate(id, {
        isVerifiedTCP: true,
      });
      res.json({ message: "email for reset your password is verified" });
    }
    // FIRST REQUEST (EMAIL) END... //
  } catch (err) {
    next(err);
  }
}

// GET a specific User
export async function usersGetSpecific(req, res, next) {
  try {
    if (!(await TalentModel.findById(req.params.id))) {
      const err = new Error("No USER with this id in Database!");
      err.statusCode = 422;
      throw err;
    }
    res.status(200).json(await TalentModel.findById(req.params.id));
  } catch (err) {
    next(err);
  }
}

// PATCH (Update) specific User
export async function usersPatchSpecific(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES //
    const userData = req.body;
    const id = req.params.id;
    // DEFINE NEEDED VARIABLES //

    // CHECK IF AUTHORIZED //
    if (id !== req.token.userId) {
      const err = new Error("Not Authorized!");
      err.statusCode = 401;
      throw err;
    }
    // CHECK IF AUTHORIZED //

    // CHECK & UPDATE EVERY GIVEN PARAMETER START //
    // CHECK FIRSTNAME START //
    if (userData.firstName) {
      const firstName = userData.firstName;
      const user = await TalentModel.findByIdAndUpdate(id, {
        firstName: firstName,
        new: true,
      });
    }
    // CHECK FIRSTNAME END //

    // CHECK LASTNAME START //
    if (userData.lastName) {
      const lastName = userData.lastName;
      const user = await TalentModel.findByIdAndUpdate(id, {
        firstName: firstName,
        new: true,
      });
    }
    // CHECK LASTNAME END //

    // CHECK EMAIL START //
    if (userData.email) {
      const userFromDb = await TalentModel.find(
        { email: userData.email },
        { id: { $not: req.params.id } }
      );
      console.log(userFromDb);
      if (userFromDb.length > 0) {
        const err = new Error("There is already a user with this email!");
        err.statusCode = 401;
        throw err;
      } else {
        const newEmail = userData.email;
        const updatedUser = await TalentModel.findByIdAndUpdate(id, {
          email: newEmail,
          new: true,
        });
      }
    }
    // CHECK EMAIL END //

    // CHECK PASSWORD START //
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await TalentModel.findByIdAndUpdate(id, {
        password: hashedPassword,
        new: true,
      });
    }
    // CHECK PASSWORD END //

    // CHECK AVATAR BEGIN //
    if (req.file) {
      await TalentModel.findByIdAndUpdate(id, {
        avatar: `http://localhost:2404/${req.file.path}`,
      });
    }
    // CHECK AVATAR END //
    // CHECK & UPDATE EVERY GIVEN PARAMETER END //

    res.json(await TalentModel.findById(id));
  } catch (err) {
    next(err);
  }
}

// Delete specific User
export async function usersDeleteSpecific(req, res, next) {
  try {
    if (req.params.id !== req.token.userId) {
      const err = new Error("Not Authorized! DELETE");
      err.statusCode = 401;
      throw err;
    }
    res.status(200).json(await TalentModel.findByIdAndDelete(req.params.id));
  } catch (err) {
    next(err);
  }
}

// POST Login a User
export async function usersPostLogin(req, res, next) {
  try {
    const userData = req.body;
    const userFromDb = await TalentModel.findOne({ email: userData.email });
    const isVerified = userFromDb.isVerified;
    if (!isVerified) {
      const err = new Error(
        "User is not verified yet, please verify yourself using the link in your email. If the link is older than an hour, please request a new one."
      );
      err.statusCode = 401;
      throw err;
    }
    if (!userFromDb) {
      const err = new Error("There is no user with this email!");
      err.statusCode = 401;
      throw err;
    }
    const checkPassword = await bcrypt.compare(
      userData.password,
      userFromDb.password
    );
    if (!checkPassword) {
      const err = new Error("Invalid password!");
      err.statusCode = 401;
      throw err;
    }
    const token = jwt.sign(
      {
        email: userFromDb.email,
        userId: userFromDb._id,
      },
      JWT_KEY,
      { expiresIn: "1d" }
    );

    // INSERT COOKIE CODE BEGIN //
    const oneHour = 1000 * 60 * 60;
    res
      .cookie("loginCookie", token, {
        maxAge: oneHour,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        auth: "loggedin",
        email: userFromDb.email,
        userId: userFromDb._id,
        message: "Login SUCCESSFUL!",
      });
    // INSERT COOKIE CODE BEGIN //
  } catch (err) {
    next(err);
  }
}

// GET Check if User is already loggedin (if token is still valid)
export async function usersChecklogin(req, res, next) {
  try {
    const token = req.cookies.loginCookie;
    const tokenDecoded = jwt.verify(token, JWT_KEY);
    console.log("Token in Cookie is valid. User is loggedin");
    res.status(200).end();
  } catch (err) {
    next(err);
    // res.status(401).end()
  }
}
