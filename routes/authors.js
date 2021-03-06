const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')


// szami a requestek sorrendje, mert a server top -> bottom nezi a matching urleket a requestre es ha pl. lat egy ilyet hogy router.get('/new'), router.get('/:id'),
//  akkor ha router.get('/:id' lenne elobb akkor lehet olyan eset h /authors/new, es nezi hogy aha, az id az "new" es az alapjan megy tovabb, ez nagyon edge case de lehetnek ilyenk.

// All Authors Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {    // get requestnel csak a urlbe van parameterkent az ertek, nem a bodyba kuldi.
    searchOptions.name = new RegExp(req.query.name, 'i')    // i- case insensitive.
  }
  try {
    const authors = await Author.find(searchOptions)      // ugye itt is Author modell van hasznalva ami mongoose schema, ergo adatabla csomo methoddal., alapbol mindet, ha van search akkor csak olyanokat amik like name.
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Author Route
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() })     // ejs-nek at lesz adva, az author, tud majd vele dolgozni a html-en
})

// Create Author Route
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name                                   // POST request a bodyba kuldi az infot
  })
  try {
    const newAuthor = await author.save()                 // az author mongoose modelkent van exportolva, szoval olyan mintha lenne egy classom, amibe csak egy name field van, de extendelem a mongoosemodelt, igy egy csomo database related methodot tudok hasznalni, ilyena  save is
    res.redirect(`authors/${newAuthor.id}`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)                       // url ben hozzacsapott id  (router.get('/:id'), konkretan latszik az urlben
    const books = await Book.find({ author: author.id }).limit(6).exec()
    res.render('authors/show', {
      author: author,
      booksByAuthor: books
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', { author: author })
  } catch {
    res.redirect('/authors')
  }
})

router.put('/:id', async (req, res) => {                              // from browser you can only do get and post request,  PUT, DELETE request no, need to install method override
  let author
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render('authors/edit', {
        author: author,
        errorMessage: 'Error updating Author'
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    await author.remove()
    res.redirect('/authors')
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.redirect(`/authors/${author.id}`)
    }
  }
})

module.exports = router