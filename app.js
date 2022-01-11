const express = require('express');
var indexRouter = require('./routes/index');
var cors = require('cors');


const app = express();
app.use(cors())
app.use(express.json());
app.use('/', indexRouter);
app.use('/images',express.static('images'))

app.listen(4000, () => {
    console.log('listening on port 4000');
})
