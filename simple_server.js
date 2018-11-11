'use strict'

const express = require('express');
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log('run server on port ' + port)
})

app.get('/api', function(req, res) {
    res.status(200).send({msg: 'Hello', msg1: 'HAHA'})
})