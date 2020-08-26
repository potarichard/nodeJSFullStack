const mongoose = require('mongoose')

// book tábla, sokkal tobb columnal
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  publishDate: {
    type: Date,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  coverImage: {
    type: Buffer,
    required: true
  },
  coverImageType: {
    type: String,
    required: true
  },
  author: {                                           // ez itt mar egy join pont, az author idja lesz itt amit databasebol vesz ki
    type: mongoose.Schema.Types.ObjectId,     
    required: true,
    ref: 'Author'                                     // melyik adattablat nezze, ennek egyezni kell azzal amit authornal megadtunk: module.exports = mongoose.model('Author', authorSchema)
  }
})

bookSchema.virtual('coverImagePath').get(function() {                   // virtual function azt jelenti hogy csinalunk egy functiont coverImagePath nevvel ?, es adat alapjan megmnondjuk hogy hol van a file systembe a kep
  if (this.coverImage != null && this.coverImageType != null) {         // igen jol gondoltam, book.coverImagePath  egy olyan property lesz mintha csak databaseben lenne tarolva, mint a tobbi pl book neve, de ugye ez felteteles dolog hogy van path a kephez, mind1 ilyet is lattunk
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
  }
})

module.exports = mongoose.model('Book', bookSchema)       // a Book okt mongoose modelkent exportaljuk, ugye igy orokol egy csomo adatbazis tulajdonsagot, magan a 
                                                          // Book classon, vagy egy book peldanyon lehet vegezni adatbazis muveleteket (keres, hozzaad, modosit....)