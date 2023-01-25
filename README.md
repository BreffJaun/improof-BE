# **Backend-Template**

This is a simple template for a backend with express.js and connection to mongoDB.

# Used Dependencies in this template
- dotenv
- mongoose
- express
- cors
- morgan
- faker (to feed database with fake data to test with)
- jasonwebtoken (jwt => to create tokens)
- bcrypt (for hashing passwords)
- cookieParser (to create cookies)
- multer (for uploading files)
- sgMail (to implement automatic sending emails)

# Folder structure:
- controller
- middleware
- models
- routes
- seeding

# to start
create .env file with 4 Variables after this schema: 

DB_USER=          Your Mongodb Username     
DB_PASS=          Your MongdoDB Password    
DB_HOST=          Your MongoDB Host     
DB_NAME=          Your MongoDb DataBase Name    
PORT=             Port for your Localhost   
SECRET_JWT_KEY=   Set your own key to encrypt your webtoken with    
SENDGRID_API_KEY= If you use sendGrid, place here your automatically created key which you get from the sendGrid website.   
    
You can copy the following empty scheme and paste it in your .env file to fill it out:

DB_USER=        
DB_PASS=        
DB_HOST=        
DB_NAME=        
PORT=       
SECRET_JWT_KEY=     
SENDGRID_API_KEY=       


If you use a "!" or a "?" in your password, it could be required to change it with the following combinations:
! === %21
? === %40

Type in terminal
1.  npm i 
2.  npm start
