import express from 'express'
import axios from 'axios'
import pg from 'pg'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyparser from 'body-parser';
dotenv.config()

const app = express()
const port = process.env.PORT || 3001;

const db = new pg.Client({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    connectionString: process.env.PSQL_DATABASE_URL,
    ssl: true
})

db.connect()
app.use(cors());
app.use(express.json())
app.use(bodyparser.json())
app.get('/', async (req, res) => {
    try {
        const response = await db.query('SELECT book_id,author_name,book_name,description,rating FROM book JOIN author ON author.author_id = book.author_id ORDER BY rating DESC')
        const result = response.rows
        res.json(result)
        console.log(result)
    } catch (error) {
        console.error(error)
    }
})

app.get("/api-sortbyauthor", async (req, res) => {
    try {
        const response = await db.query('SELECT author_name,book_name,description,rating FROM book JOIN author ON author.author_id = book.author_id ORDER BY author_name ASC')
        const result = response.rows
        res.json(result)
    } catch (error) {
        console.error(error)
    }
})

app.get("/api-sortbytitle", async (req, res) => {
    try {
        const response = await db.query('SELECT author_name,book_name,description,rating FROM book JOIN author ON author.author_id = book.author_id ORDER BY book_name ASC')
        const result = response.rows
        res.json(result)
    } catch (error) {
        console.error(error)
    }
})

app.post("/bookdata", async (req, res) => {
    try {
        const response = req.body
        const author_name = response.data.authorName
        const book_name = response.data.bookName
        const rating = response.data.rating
        const description = response.data.description

        const authorResult = await db.query('SELECT author_id from author WHERE author_name = $1',[author_name])
        let authorId;
        if(authorResult.rows.length === 0){
           const newAuthorResult =  await db.query('INSERT INTO author (author_name) VALUES ($1) RETURNING author_id',[author_name])
            authorId = newAuthorResult.rows[0].author_id
        }
        else{
            authorId = authorResult.rows[0].author_id
        }
       
        await db.query('INSERT INTO book (book_name,description,rating,author_id) VALUES ($1, $2, $3, $4)',[book_name,description,rating,authorId])
        res.redirect("/")
    } catch (error) {
        console.log(error)
    }
})
app.get('/notes/:book_id',async(req,res)=>{
    const bookId = req.params
    const book_id = parseInt(bookId.book_id)
    try {
        const response = await db.query('SELECT note FROM note WHERE book_id = $1',[book_id])
        const result = response.rows
        res.json(result) 
    } catch (error) {
        console.error(error)
    }
})
app.post('/notes/:book_id', async (req,res)=>{
   try {
    const response = req.body
    const bookId = req.params
    const note = response.notes.note
    const book_id = parseInt(bookId.book_id)
    await db.query('INSERT INTO note (note,book_id) VALUES ($1,$2)',[note,book_id])
   } catch (error) {
    console.error(error)
   }
    
})
app.listen(port, () => {

    console.log(`Server is running on port ${port}`)
})

