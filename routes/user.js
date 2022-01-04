var express = require('express');
var router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');

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
        
        if(undefined !== result && !result.length){
        const sql = `INSERT INTO users (username, email, password) VALUES ( ?, ?, ? )`
        con.query(
          sql, [username, email, hashed_password],
        (err, result, fields) =>{
          if(err){
            res.send({ status: 0, error: err });
          }else{
            let token = jwt.sign({ data: result }, 'secret')
            res.send({ status: 1, data: result, token : token });
          }
         
        })
      }else{
        res.send({ status: 0, error: 'Username in use already.' });
      }
    });

    

   
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
    function(err, result, fields){
        if(undefined !== result && result.length){
            if(err){
              res.send({ status: 0, error: err });
            }else{
              let token = jwt.sign({ data: result }, 'secret')
              res.send({ status: 1, data: result, token: token });
            }
        }else{
          res.send({ status: 0, error: 'User or password incorrect' });
        }
     
    })
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});



module.exports = router;
