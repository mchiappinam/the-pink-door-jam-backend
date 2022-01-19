var express = require('express');
var router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');

const multer = require('multer');
var fileExtension = require('file-extension')

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "192.168.1.11",
  user: "thepinkdoorjam-u",
  password: "c#:kGuN9M(w3>}gZ",
  database: "thepinkdoorjam"
});

/* GET users listing. */
router.post('/register', async function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
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
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);

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
//MySQL Upload
//enabled: 0=false, 1=forAll, 2=staffOnly
function insertImgSQL(fname) {
  try {
    const sql = `INSERT INTO products (filename, title, description, enabled) VALUES ( ?, ?, ?, ? )`
    con.query(
      sql, [fname, "Title 123", "Description 123", 1],
      (err, result, fields) => {
        if (err) {
          console.log("Error: " + err);
          return false;
        } else {
          return true;
        }
      })
  } catch (error) {
    console.log("Errorc: " + error);
    return false;
  }
}

//enabled: 0=false, 1=forAll, 2=staffOnly
router.get('/loadpics', async function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  try {
    const sql = `SELECT * FROM products ORDER BY id DESC`
    con.query(
      sql,
      (err, result, fields) => {
        if (undefined !== result && result.length) {
          if (err) {
            res.send({ status: 0, error: err });
          } else {
            res.send({ status: 1, data: result });
            //console.log(result);
          }
        } else {
          res.send({ status: 0, error: 'No products uploaded yet!' });
        }

      })
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

//enabled: 0=false, 1=forAll, 2=staffOnly
router.get('/loadpic:id', async function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  try {
    const sql = `SELECT * FROM products WHERE id = ?`
    con.query(
      sql, [req.params.id],
      (err, result, fields) => {
        if (undefined !== result && result.length) {
          if (err) {
            res.send({ status: 0, error: err });
          } else {
            res.send({ status: 1, data: result });
            //console.log(result);
          }
        } else {
          res.send({ status: 0, error: 'Product not found!' });
        }

      })
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

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
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  const file = req.file
  //console.log(req);
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  if (insertImgSQL(file.filename)) {
    res.status(400).send({
      statusCode: 400,
      error: "Image uploaded but an error occurred establishing a database connection",
      uploadedFile: file,
      newFileName: file.filename
    })
    return;
  }
  res.status(200).send({
    statusCode: 200,
    status: 'success',
    uploadedFile: file,
    newFileName: file.filename
  })

}, (error, req, res, next) => {
  res.status(400).send({
    statusCode: 400,
    error: error.message
  })
})



router.put('/editpic:id', async function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  try {
    let { title, description } = req.body;

    const sql = `UPDATE products SET title = ?, description = ? WHERE id = ?`
    con.query(
      sql, [title, description, req.params.id],
      (err, result, fields) => {
        if (err) {
          res.send({ status: 0, error: err });
        } else {
          res.send({ status: 1, data: result });
        }

      })

  } catch (error) {

    res.send({ status: 0, error: error });
  }
});



router.put('/likes', async function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  const uid = String(req.body.uid);
  const post_id = String(req.body.post_id);

  const values = [ uid, uid, post_id ]
  console.log(values);
  
  //To be implemented soon

    // const sql = `UPDATE products SET title = ?, description = ? WHERE id = ?`
    // con.query(
    //   sql, [uid, post_id],
    //   (err, result, fields) => {
    //     if (err) {
    //       res.send({ status: 0, error: err });
    //     } else {
    //       res.send({ status: 1, data: result });
    //     }

    //   });
});


module.exports = router;
