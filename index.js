const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios');
const dotenv = require('dotenv')

dotenv.config()



const PORT = process.env.NODE_ENV == 'development' ? 3000 : process.env.PORT
const app = express()

app.use(bodyParser.urlencoded({
    extended: false
}));

// application/json parsing json incoming request

app.use(bodyParser.json());

//allowing CORS
app.use(cors());

// /api/rates?base=CZK&currency=EUR,GBP,USD
app.get('/api/rates', (req, res, next) => {

    const codes = [
                    "CAD","HKD","ISK","PHP","DKK","HUF","CZK","AUD",
                    "RON","SEK","IDR","INR","BRL","RUB","HRK","JPY",
                    "THB","CHF","SGD","PLN","BGN","TRY","CNY","NOK",
                    "NZD","ZAR","USD","MXN","ILS","GBP","KRW","MYR", "EUR"
                ]
    const queries_allowed = ['base', 'currency']
    const checker = [] // if both query are present, the sum of the elements in the array should be 2
        for (const method of queries_allowed) {
            if(req.query.hasOwnProperty(method)){
                checker.push(parseInt(1))
            }else{
                checker.push(parseInt(0))
            }
        }

        const sum_checker = checker.reduce( (a,b)=> a+b, 0 )
        const base = req.query.base.toUpperCase()

        if( sum_checker == 2 ){
           const check_base_param = codes.find( e => e == base )
           if(!check_base_param){
                const err = {}
                err.message = 'Ops, Code not found in currency code list'
                err.statusCode = 500
                next(err)
           }else{
                const filter_codes = req.query.currency.split(',')
                const present_codes = []
                const absent_codes = []
                for (const code of filter_codes) {
                    const find_code = codes.find( e => e == code )
                    if(!find_code){
                        absent_codes.push(code)
                    }else{
                        present_codes.push(code)
                    }
                }
                if( present_codes.length > 1 ){
                    // https://api.exchangeratesapi.io/latest?base=PHP&symbols=USD,GBP
                    axios.get('https://api.exchangeratesapi.io/latest', { params: 
                    { 
                        base:base, 
                        symbols:present_codes.join().toUpperCase().toString()
                     }
                 }).then ( result => {
                        res.status(200).json({
                            data: result.data,
                            statusCode: 200
                        })
                    }).catch( err => next(err))
                }else{
                    const err = {}
                    err.message =  `Ops, All specified ${absent_codes} not present in he list of currency`
                    err.statusCode = 404
                    next(err)
                }
           }
        }else{
            const err = {}
            err.message = 'Ops, incorrect query passed, check your query parameters'
            err.statusCode = 500
            next(err)
        }
})


app.get('/', (req, res, next) => {

    return res.status(200).json({
        message: 'Welcome to the application entry point',
        statusCode: 200,
    })
})


// error handler 
app.use( (error, req, res, next) => {
    const statusCode = error.statusCode || 500
    const message = error.message 
    // console.log(error)
    return res.status(statusCode).json({
        statusCode: statusCode,
        message: message
    })
})


app.listen(PORT, ()=> console.log(`server connected on port:${PORT}`)  )