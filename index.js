const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios');
const { query } = require('express');

const PORT = 3000;
const app = express()

app.use(bodyParser.urlencoded({
    extended: false
}));

// application/json parsing json incoming request

app.use(bodyParser.json());

//allowing CORS
app.use(cors());


app.get('/welcome', (req, res, next) => {

    axios.get('https://api.exchangeratesapi.io/latest').then( result => {
        const prop = []
        for (const key in result.data.rates) {
            prop.push(key)
        }
        return res.status(200).json({
            message: 'Welcome to the application entry point',
            statusCode: 200,
            name: prop
        })
    }).catch( err => next(err))

    
})

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

        if( sum_checker == 2 ){
           const check_base_param = codes.find( e => e == req.query.base )
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
                }
           }
        }else{
            const err = {}
            err.message = 'Ops, incorrect query passed, check your query parameters'
            err.statusCode = 500
            next(err)
        }
})


// error handler 
app.use( (error, req, res, next) => {
    const statusCode = error.statusCode || 500
    const message = error.message 

    return res.status(statusCode).json({
        statusCode: statusCode,
        message: message
    })
})


app.listen(PORT, ()=> console.log(`server connected on port:${PORT}`)  )