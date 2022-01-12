var express = require('express');
var router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');

const multer = require('multer');
var fileExtension = require('file-extension')

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "192.168.1.11",
  user: "thepinkdoorjam",
  password: "thepinkdoorjam123",
  database: "users"
});

/* GET users listing. */
router.post('/register', async function (req, res, next) {
  try {
    let { username, email, password } = req.body;

    const hashed_password = md5(password.toString())

    const checkUsername = `SELECT username FROM users WHERE username = ?`;
    con.query(checkUsername, [username], (err, result, fields) => {

      if (undefined !== result && !result.length) {
        const sql = `INSERT INTO users (username, email, password) VALUES ( ?, ?, ? )`
        con.query(
          sql, [username, email, hashed_password],
          (err, result, fields) => {
            if (err) {
              res.send({ status: 0, error: err });
            } else {
              //let token = jwt.sign({ data: result }, 'secret')
              res.send({ status: 2, error: "Registered successfully! Please log in!" });
              //console.log(result);
            }

          })
      } else {
        res.send({ status: 0, error: 'Username in use already.' });
      }
    })
  } catch (error) {

    res.send({ status: 0, error: error });
  }
});

router.post('/login', async function (req, res, next) {

  try {
    let { username, password } = req.body;

    const hashed_password = md5(password.toString())
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`
    con.query(
      sql, [username, hashed_password],
      function (err, result, fields) {
        if (undefined !== result && result.length) {
          if (err) {
            res.send({ status: 0, error: err });
          } else {
            let token = jwt.sign({ data: result }, 'secret')
            res.send({ status: 1, data: result, token: token });
            //console.log(result);
          }
        } else {
          res.send({ status: 0, error: 'User or password incorrect' });
        }

      })
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});



//           ** IMAGE UPLOAD **

// Configure Storage
var storage = multer.diskStorage({

  // Setting directory on disk to save uploaded files
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../images");
  },

  // Setting name of file saved
  filename: function (req, file, cb) {
    cb(null, 'img-' + Date.now() + '.' + fileExtension(file.originalname))
  }
})

var upload = multer({
  storage: storage,
  limits: {
    //Limit: 8MB
    fileSize: 1024 * 1024 * 8,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      //Error 
      cb(new Error('Please upload JPG and PNG images only!'))
    }
    //Success 
    cb(undefined, true)
  }
})

router.post('/upload', upload.single('uploadedImage'), (req, res, next) => {
  const file = req.file
  console.log(req);
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.status(200).send({
    statusCode: 200,
    status: 'success',
    uploadedFile: file,
    newFileName: file.filename
  })

}, (error, req, res, next) => {
  res.status(400).send({
    error: error.message
  })
})



module.exports = router;
