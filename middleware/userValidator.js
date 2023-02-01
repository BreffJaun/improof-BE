// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import {body} from 'express-validator';

// C R E A T E   V A L I D A T O R
export const userValidator = [
  body("profile.firstName")
    .notEmpty()
    .withMessage("Firstname has to bet set!")
    .isAlpha("de-DE", {ignore: " -"})
    .withMessage("Firstname contains not allowed signs!")
    .trim() // takes out whitespaces at the beginning and the end of an string
    .escape(), // changes special chars into normal chars
  body("profile.lastName")
    .notEmpty()
    .trim()
    .isLength({max:20})
    .escape(),
  body("profile.email")
    .notEmpty()
    .withMessage("Email has to be set!")
    .trim()
    .isEmail(),
  body("profile.password")
    .notEmpty()
    .withMessage("Password has to bet set!")
    .trim()
    .isStrongPassword()
    .withMessage("Password isn't safe enough!")
    .isLength({min:8})
]

// export const userUpdateValidator = [
//   body("profile.firstName")
//     .optional()
//     .isAlpha("de-DE", {ignore: " -"})
//     .withMessage("Firstname contains not allowed signs!")
//     .trim() // takes out whitespaces at the beginning and the end of an string
//     .escape(), // changes special chars into normal chars
//   body("profile.lastName")
//     .optional()
//     .trim()
//     .isLength({max:20})
//     .escape(),
//   body("profile.email")
//     .optional()
//     .trim()
//     .isEmail()
//     .normalizeEmail(),
//   body("profile.password")
//     .optional()
//     .trim()
//     .isStrongPassword()
//     .withMessage("Password isn't safe enough!")
//     .isLength({min:8})
// ]

// normalize() => changes all chars to lowerCase

