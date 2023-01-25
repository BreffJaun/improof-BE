// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import {validationResult} from 'express-validator';

// C R E A T E   V A L I D A T O R
export const validateRequest = (req, res, next) => {
	const validationErrors = validationResult(req);
	if (validationErrors.isEmpty()) {
		return next();
	} 
	res.status(422).send({ errors: validationErrors.array() });
};