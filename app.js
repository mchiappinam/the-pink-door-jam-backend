const express = require('express');
var indexRouter = require('./routes/index');
var cors = require('cors');


const app = express();
app.use(cors())
app.use(express.json());
app.use('/', indexRouter);
app.use(express.static(__dirname));
//app.use("/images", express.static(__dirname+"/images"));

app.listen(3000, () => {
    console.log('listening on port 3000');
})
