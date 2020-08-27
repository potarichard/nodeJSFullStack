const mongoose = require('mongoose')
const Book = require('./book')

// a schema olyan mint egy table a oracle databaseben, egy db name column al
const authorSchema = new mongoose.Schema({
  name: {                                       
    type: String,
    required: true
  }
})
                                                                        // next a callback, azaz, ha minden oke, mehet tovabb, azert nem lamda mert kell a this.id
                                                                        // normal functionnal mert majd author.removot fogok hivni es a this-nek majd arra az authorra kell vonatkozni
                                                                        // es abszolut nem lesz koze az "itteni" this referenciahoz, ami itt his az csak egy sema! ertem!
//1. In regular functions the this keyword represented the object that called the function, which could be the window, the document, a button or whatever., ahhonaan hivva lett a function, tehat nem ahol definialva lett, arra vonatkozik a this, szal ha pl classon kivulrol hivok egy function abba a this, az ures lehet. this hivaskor "ujradefinialodik"
//2. With arrow functions the this keyword always represents the object that defined the arrow function.   itt pont "forditva" normal javas mukodes van, tehat a this a definialaskor megadott kornyezetre referencia, ha classon belul van egy arrow functon akkor ott a this az mindig a classra ref, nem arra a kornyezetre ahol hivva lett.                                                               
authorSchema.pre('remove', function(next) {                             // authornak vannak bookjai, ha torlom az author maradnak book ok author nelkul, ugye erre van az hogy
                                                                        // pre -> mielott torolnenk az authort, nezze meg tartozik e ehhez az authorhoz konyv, ha igen thrwo error
  Book.find({ author: this.id }, (err, books) => {
    if (err) {
      next(err)
    } else if (books.length > 0) {
      next(new Error('This author has books still'))
    } else {
      next()
    }
  })
})

module.exports = mongoose.model('Author', authorSchema)