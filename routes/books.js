const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()           // queryt modositgatjuk majd de kell egy sema, gondolom valmi alap sema jellegut ad a Book.find(), csak felepitunk egy queryt es kesobb executoljuk
                                    // nem csak az osszes bookot akarjuk latni, hanem keresni is akarunk pl nev alapjan, na ezek szuresehez kell itt felepiteni  a queryt
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))    // turn into case insensitive
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)           // less than or equal to the date, gte greater than...
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)            // req.query.publishedAfter  ezek mind az urlbol jonnek
  }
  try {
    const books = await query.exec()
    res.render('books/index', {         // itt egy komplett objectet adunk at
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', async (req, res) => {
  const book = new Book({                             // a sok re.body.akarmi   ezeket a feltelepitett body parser miatt tudja, @RequestBody sprinfgnel
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book, req.body.cover)                   // stringge alkitott cover kep

  try {
    const newBook = await book.save()
    res.redirect(`books/${newBook.id}`)
  } catch {
    renderNewPage(res, book, true)
  }
})

// Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
                           .populate('author')
                           .exec()
    res.render('books/show', { book: book })
  } catch {
    res.redirect('/')
  }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
})

// Update Book Route
router.put('/:id', async (req, res) => {
  let book

  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    if (book != null) {
      renderEditPage(res, book, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Book Page
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})                                   // query authors so we can create a params object, and inject it to the ejs page
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)                                       // formfields partialsba lehet hasznalni, bar nem, mert ott konkretan author van beinjectalva
  } catch {
    res.redirect('/books')
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')               // springben volt ilyen, bytearraykent lett tarolva a kep
    book.coverImageType = cover.type
  }
}

module.exports = router