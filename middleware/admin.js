// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import UserModel from "../models/userModel.js";

//========================

// CHECK IF USER IS ADMIN
export async function admin (req, res, next) {
  try {
    const user = await UserModel.findById(req.token.userId)
    if (!user.isAdmin) {
      const err = new Error ("No administrator rights!")
      err.statusCode = 400;
      throw err
    }
    next()
  } catch (err) {
    next(err);
  }
};

