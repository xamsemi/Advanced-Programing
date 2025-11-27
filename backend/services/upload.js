const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('- Service Upload');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {        
        var tourId = req.params.tour_id;
        tourFolderName = "tour-" + tourId;
        pathName = './public/img/' + tourFolderName;
        if (!fs.existsSync(pathName)){
            fs.mkdirSync(pathName, { recursive: true });
        }
        cb(null,pathName); // Ordner für Tour-Bilder
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = upload;