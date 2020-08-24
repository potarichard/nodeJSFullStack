const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {

    res.render("index")

})

module.exports = router         // kulvilagnak kiexportalom a routert, csak azt, ugye angularnal ez az egesz egy export class Router lenne es ugy veszi at mas