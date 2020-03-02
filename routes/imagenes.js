let express = require('express');
let app = express();
const path = require('path');
const fs = require('fs');

app.get('/:tabla/:img', (req, res, next) => {
    let tabla = req.params.tabla;
    let img = req.params.img;

    const pathImagen = path.resolve(__dirname, `../uploads/${tabla}/${img}`);
    if(fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        const pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImagen);
    }
});

module.exports = app;