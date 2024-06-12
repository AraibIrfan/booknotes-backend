import express from 'express'
import axios from 'axios'
import pg from 'pg'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001;

const db = new pg.Client({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    connectionString: process.env.PSQL_DATABASE_URL
})

db.connect()
app.use(cors());
app.get('/', async (req, res) => {
    try {
        const response = await db.query('SELECT author_name,book_name,description,rating FROM book JOIN author ON author.author_id = book.author_id ORDER BY rating DESC')
        const result = response.rows
        res.json(result)
        console.log(result)
    } catch (error) {
        console.error(error)
    }
})

app.get("/api-sortbyauthor",async (req,res)=>{
   try {
    const response = await db.query('SELECT author_name,book_name,description,rating FROM book JOIN author ON author.author_id = book.author_id ORDER BY author_name ASC')
    const result = response.rows
    res.json(result)
   } catch (error) {
    console.error(error)
   }
})

app.get("/api-sortbytitle",async (req,res)=>{
    try {
        const response = await db.query('SELECT author_name,book_name,description,rating FROM book JOIN author ON author.author_id = book.author_id ORDER BY book_name ASC')
        const result = response.rows
        res.json(result)
    } catch (error) {
        console.error(error)
    }
})
app.listen(port, () => {

    console.log(`Server is running on port ${port}`)
})

