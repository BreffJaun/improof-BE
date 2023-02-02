// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import {body} from 'express-validator';

// C R E A T E   V A L I D A T O R
export const projectValidator = [
  body("name")
    .notEmpty()
    .withMessage("A name for the project has to bet set!")
    .trim() // takes out whitespaces at the beginning and the end of an string
    .escape(), // changes special chars into normal chars
  body("description")
    .notEmpty()
    .withMessage("Please describe what about this project is about!")
    .trim()
    .escape()
]


