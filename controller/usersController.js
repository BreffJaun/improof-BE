// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import sgMail from '@sendgrid/mail';

// I M P O R T:  F U N C T I O N S
import UserModel from '../models/userModel.js';

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y 
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue"
const SENDGRID_KEY = process.env.SENDGRID_API_KEY 
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL;
const BE_HOST = process.env.BE_HOST;
const FE_HOST = process.env.FE_HOST;

//========================

// ALL USERS (GET)
// export async function getTalents (req, res, next) {
//   try {
//     res.json(await UserModel.find());
//   }catch (err) {
//     next(err);
//   }
// }

// ADD USER (POST)
export async function addUser (req, res, next) {
  try {
    const newUser = req.body;
    // in the UserModel we check if the given email-address is unique
    const hashedPassword = await bcrypt.hash(newUser.profile.password, 10);
    const initials = newUser.profile.firstName[0].toUpperCase() + newUser.profile.lastName[0].toUpperCase();
    let createdUser;
    if(newUser.profile.isTalent) {
      createdUser = await UserModel.create({...newUser, 
        profile: {...newUser.profile, password: hashedPassword, isTalent: true, initials: initials}})     
    }
    if(newUser.profile.isRecruiter) {
      createdUser = await UserModel.create({...newUser, password: hashedPassword, isRecruiter: true, initials: initials}) 
    }

    // VERIFY EMAIL IMPLEMENT BEGIN //
    sgMail.setApiKey(SENDGRID_KEY)
    const verifyToken = jwt.sign(
      {
        email: newUser.email, 
        _id: createdUser._id
      }, 
      JWT_KEY,
      {expiresIn: '1h'}
      )
    const msg = {
      to: newUser.profile.email, // Change to your recipient
      from: SENDGRID_EMAIL, // Change to your verified sender
      subject: "VERIFICATION of your 'improof' account",
      // text: `To verify your email, please click on this link: http://localhost:2404/users/verify/${verifyToken}`,
      html: `
      <div>
      <p>Hi ${newUser.profile.firstName}, </p>

      <p>We're happy you signed up for 'improof'. To start your journey and explore
      your projects, please verify your email.</p>

      <p style="background-color: orange; border-radius: 7px; width: 80px; height: 20px; text-decoration: none;">
      <a href="${BE_HOST}/users/verify/${verifyToken}">
      Verify now</a></p>      
    
      <p>Welcome to improof!<br>
      Your 'improof' Team </p>
      
      <div>`,
    }
    const response = await sgMail.send(msg);
    // VERIFY EMAIL IMPLEMENT END //

    res.status(201).json({
      message: "Please verify your account via the link in the email we send you, to use your Profile.", 
      status: true,
      data: ""
    })
  }catch (err) {
    next(err);
  }
};

// VERIFY EMAIL FOR USER ACCOUNT (GET)
export async function verifyEmail (req, res, next) {
  try {
    const verifyToken = req.params.token;
    const decodedVerifyToken = jwt.verify(verifyToken, JWT_KEY);
    const id = decodedVerifyToken._id;
    const user = await UserModel.findById(id);
    const updatedUser = await UserModel.findByIdAndUpdate(id, 
      {...user, meta: {...user.meta, isVerified: true}, new: true}
    )
    // const user = await UserModel.findByIdAndUpdate(id, {meta: {isVerified: true}})
    res.json({
      message: 'E-Mail is now SUCCESSFULLY verified!',
      status: true,
      data: ""
    });
    // res.redirect(`${BE_HOST}/login`);
    // if we have a frontend, we can direct the successful verification to the login page
  }catch (err) {
    next(err);
  }
};

// LOGIN (POST)
export async function login(req, res, next) {
  try {
    const userData = req.body.profile;
    const userFromDb = await UserModel.findOne({profile: {email: userData.email}});
    const id = userFromDb._id;
    const isVerified = userFromDb.meta.isVerified;
    const loginCount = userFromDb.meta.loginCount;
    if(!isVerified) {
        const err = new Error("User is not verified yet, please verify yourself using the link in your email. If the link is older than an hour, please request a new one.");
        err.statusCode = 401;
        throw err;
    }
    const checkPassword = await bcrypt.compare(userData.password, userFromDb.profile.password);
    if(!checkPassword) {
      const err = new Error("Invalid password!");
      err.statusCode = 401;
      throw err; 
    }

    // FIRST LOGIN CHECK START //
    if (loginCount > 0) {
      const updatedUser = await UserModel.findByIdAndUpdate(id, 
        {meta: {firstLogin: false}}
      );
    }
    const updatedUser = await UserModel.findByIdAndUpdate(id, 
      {meta: {loginCount: loginCount+1}}
    )
    // FIRST LOGIN CHECK END //

    const token = jwt.sign(
      {
        email: userData.email, 
        userId: userFromDb._id
      }, 
      JWT_KEY, 
      {expiresIn: "1d"})

      // INSERT COOKIE CODE START //
      const oneHour = 1000*60*60;
      res.cookie('loginCookie', token, 
      {
        maxAge: oneHour,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json(
      {
        auth: 'loggedin',
        email: userData.email, 
        userId: userFromDb._id,
        message: "Login SUCCESSFUL!",
        status: true,
        data: ""
      })
      // INSERT COOKIE CODE BEGIN //
  } catch (err) {
    next(err);
  }
};

// CHECK IF ALREADY LOGGED IN (AND IF TOKEN IS STILL VALID) (GET)
export async function checkLogin(req, res, next) {
  try {
    const token = req.cookies.loginCookie;
    const tokenDecoded = jwt.verify(token, JWT_KEY);
    console.log('Token in Cookie is valid. User is loggedin');
    res.status(200).end();
  } catch (err) {
    next(err);
  }
};


// FORGOT PASSWORD (POST)
export async function forgotPassword(req, res, next) {
  try {
    const userData = req.body.profile;
    const userFromDb = await UserModel.findOne({profile: {email: userData.email}});
    if (!userFromDb) {
      const err = new Error("There is no user with this email!");
      err.statusCode = 401;
      throw err;
    }

    // VERIFY EMAIL IMPLEMENT BEGIN //
    sgMail.setApiKey(SENDGRID_KEY);
    const verifyToken = jwt.sign(
      { email: userData.email, _id: userFromDb._id },
      JWT_KEY,
      { expiresIn: "1h" }
    );
    const msg = {
      to: userData.email,   // Change to your recipient
      from: SENDGRID_EMAIL, // Change to your verified sender
      subject: "SET A NEW PASSWORD for your 'improof' Account",
      // text: `To change your password, please click on this link: ${BE_HOST}/users/setnewpassword/${verifyToken}`,
      html: `
      <div>
      <p>Hi ${userFromDb.profile.userName}, </p>

      <p>a request has been received to change the password 
      for your 'improof' account</p>

      <p><a href="${BE_HOST}/users/reset/${verifyToken}" 
      style="background-color: orange; border-radius: 7px; width: 50px; height: 20px; text-decoration: none;">
      Reset password</a></p>      
    
      <p>If you did not initiate this request, please contact 
      us immediately at ${SENDGRID_EMAIL}</p>

      <p>Thank you,<br>
      your Coffy Paste Team </p>
      
      <div>`,
    };
    const response = await sgMail.send(msg);
    // VERIFY EMAIL IMPLEMENT END //
    res
      .status(201)
      .json({ 
        message: "You got send an Email to set your new password.", 
        status: true,
        data: ""
      });
  } catch (err) {
    next(err);
  }
}

// VERIFY RESET TOKEN (GET)
export async function verifyResetToken(req, res, next) {
  try {
    const verifyToken = req.params.token;
    const decodedVerifyToken = jwt.verify(verifyToken, JWT_KEY);
    const id = decodedVerifyToken._id;
    const user = await UserModel.findByIdAndUpdate(id, {meta: {isVerifiedTCP: true}});
    res.redirect(`${FE_HOST}/setnewpassword`);
  } catch (err) {
    next(err);
  }
}


// SET NEW PASSWORD (POST)
export async function setNewPassword (req, res, next) {
  try {
    // CHECK IF ACCOUNT IS VERIFIED TO SET NEW PASSWORD
    const email = req.body.profile.email;
    const userFromDb = await UserModel.findOne({meta: {email: email}});
    if (!userFromDb.isVerifiedTCP) {
      res
        .status(422)
        .json({ 
          message: "Account NOT verified to change password", 
          status: false,
          data: ""
        });
    }
    // CHANGE AND ENCRYPT NEW PASSWORD
    const id = userFromDb._id;
    const newPassword = req.body.profile.password;
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await UserModel.findByIdAndUpdate(id, 
        {profile: {password: hashedPassword}},
        {meta: {isVerifiedTCP: false}}
        );
      console.log(updatedUser);
      res.status(200).json({ 
        message: "Set new Password was SUCCESSFUL!", 
        status: true,
        data: ""
      });
    } else {
      res.status(422).json({ 
        message: "Set new Password FAILED!",
        status: false,
        data: ""
      });
    }
  } catch (err) {
    next(err);
  }
};


// GET A USER (GET)
export async function getUser(req, res, next) {
  try {
    if (!(await UserModel.findById(req.params.id))){
      const err = new Error("No USER with this id in Database!");
      err.statusCode = 422;
      throw err; 
    } 
    const user = await UserModel.findById(req.params.id);
    res.status(200).json({
      userData: user,
      message: 'Search was SUCCESSFUL!',
      status: true,
      data: ""
    });
  }catch (err) {
    next(err);
  }
};

// UPDATE A USER (PATCH)
export async function updateUser(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES //
    const userData = req.body;
    const id = req.params.id
    // DEFINE NEEDED VARIABLES //

    // IMPORTANT: A additionally check (after auth) if the given id is the same id as in the token. We do that, because we want that the user could only change his own profile.
    // CHECK IF AUTHORIZED START//
    if (id !== req.token.userId) {
      const err = new Error("Not Authorized!");
      err.statusCode = 401;
      throw err;
    }
    // CHECK IF AUTHORIZED END//
    
    // ## CHECK & UPDATE EVERY GIVEN PARAMETER START ## //
    // ** UPDATE PROFILE START ** //
    // CHECK FIRSTNAME START //
    if(userData.profile.firstName) {
      const firstName = userData.profile.firstName;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {firstName: firstName, new: true}});
    } 
    // CHECK FIRSTNAME END //

    // CHECK LASTNAME START //
    if(userData.lastName) {
      const lastName = userData.profile.lastName;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {lastName: lastName, new: true}});
    } 
    // CHECK LASTNAME END //

    // CHECK EMAIL START //
    if(userData.profile.email) {
      const email = userData.profile.email;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {email: email, new: true}});
      // ALTERNATIVE VERSION - PLEASE CHECKOUT ! ! !
      // const userFromDb = await UserModel.find(
      //   {email: userData.email}, 
      //   {id: {$not: req.params.id}
      // });
      // console.log(userFromDb);
      // if(userFromDb.length > 0) {
      //   const err = new Error("There is already a user with this email!");
      //   err.statusCode = 401;
      //   throw err; 
      // } else {
      //   const newEmail = userData.email;
      //   const updatedUser = await UserModel.findByIdAndUpdate(id, {email: newEmail, new: true});
      // }
    }
    // CHECK EMAIL END //
    
    // CHECK PASSWORD START //
    if(userData.profile.password) {
      const hashedPassword = await bcrypt.hash(userData.profile.password, 10);
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {password: hashedPassword, new: true}});
    } 
    // CHECK PASSWORD END //

    // CHECK AVATAR BEGIN //
    if(req.file) {
      await UserModel.findByIdAndUpdate(id, 
        {profile: {avatar: `${BE_HOST}/${req.file.path}`}});
    }
    // CHECK AVATAR END //

    // CHECK DESCRIPTION START //
    if(userData.profile.description) {
      const description = userData.profile.description;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {description: description, new: true}});
    } 
    // CHECK DESCRIPTION END //

    // CHECK GOAL START //
    if(userData.profile.goal) {
      const goal = userData.profile.goal;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {goal: goal, new: true}});
    } 
    // CHECK GOAL END //

    // CHECK POSITION START //
    if(userData.profile.position) {
      const position = userData.profile.position;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {position: position, new: true}});
    } 
    // CHECK POSITION END //

    // CHECK TOOLSANDSKILLS START //
    if(userData.profile.toolsAndSkills) {
      const toolsAndSkills = userData.profile.toolsAndSkills;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {toolsAndSkills: toolsAndSkills, new: true}});
    } 
    // CHECK TOOLSANDSKILLS END //
    // ** UPDATE PROFILE END ** //

    // ** UPDATE CONTACT START ** //
    // CHECK MOBILE START //
    if(userData.contact.mobile) {
      const mobile = userData.contact.mobile;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {mobile: mobile, new: true}});
    } 
    // CHECK MOBILE END //

    // CHECK WEBSITE START //
    if(userData.contact.website) {
      const website = userData.contact.website;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {website: website, new: true}});
    } 
    // CHECK WEBSITE END //

    // CHECK ONLINE1 START //
    if(userData.contact.online1) {
      const online1 = userData.contact.online1;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {online1: online1, new: true}});
    } 
    // CHECK ONLINE1 END //

    // CHECK ONLINE2 START //
    if(userData.contact.online2) {
      const online2 = userData.contact.online2;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {online2: online2, new: true}});
    } 
    // CHECK ONLINE2 END //

    // CHECK ONLINE3 START //
    if(userData.contact.online3) {
      const online3 = userData.contact.online3;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {online3: online3, new: true}});
    } 
    // CHECK ONLINE3 END //

    // CHECK COMPANY START //
    if(userData.contact.company) {
      const company = userData.contact.company;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {company: company, new: true}});
    } 
    // CHECK COMPANY END //
    // ** UPDATE CONTACT END ** //

    // ** UPDATE LOCATION START ** //
    // CHECK STREET START //
    if(userData.location.street) {
      const street = userData.location.street;
      const user = await UserModel.findByIdAndUpdate(id, 
        {location: {street: street, new: true}});
    } 
    // CHECK STREET END //

    // CHECK ZIP START //
    if(userData.location.zip) {
      const zip = userData.location.zip;
      const user = await UserModel.findByIdAndUpdate(id, 
        {location: {zip: zip, new: true}});
    } 
    // CHECK ZIP END //

    // CHECK CITY START //
    if(userData.location.city) {
      const city = userData.location.city;
      const user = await UserModel.findByIdAndUpdate(id, 
        {location: {city: city, new: true}});
    } 
    // CHECK CITY END //
    // ** UPDATE LOCATION END ** //

    // ** UPDATE META START ** //
    // CHECK DARKMODE START //
    if(userData.meta.darkMode) {
      const darkMode = userData.location.darkMode;
      const user = await UserModel.findByIdAndUpdate(id, 
        {meta: {darkMode: darkMode, new: true}});
    }
    // CHECK DARKMODE END //

    // CHECK COLORTHEME START //
    if(userData.meta.colorTheme) {
      const colorTheme = userData.location.colorTheme;
      const user = await UserModel.findByIdAndUpdate(id, 
        {meta: {colorTheme: colorTheme, new: true}});
    }
    // CHECK COLORTHEME END //
    // ** UPDATE META END ** //
    // ## CHECK & UPDATE EVERY GIVEN PARAMETER END ## //    
    const updatedUser = await UserModel.findById(id);
    res.status(200).json({
      userData: updatedUser,
      message: 'Update was SUCCESSFUL!',
      status: true,
      data: ""
    });
  }catch (err) {
    next(err);
  }
};

// Delete specific User
export async function deleteUser (req, res, next) {
  try {
     // IMPORTANT: A additionally check (after auth) if the given id is the same id as in the token. We do that, because we want that the user could only change his own profile.
    if (req.params.id !== req.token.userId) {
      const err = new Error("Not Authorized! DELETE");
      err.statusCode = 401;
      throw err;
    }
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      userData: deletedUser,
      message: 'Delete was SUCCESSFUL!',
      status: true,
      data: ""
    });
  }catch (err) {
    next(err);
  }
}




