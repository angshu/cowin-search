// Imports needed modules
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const Cowin = require('./utils/cowin')
const { createHash,} = require('crypto')

// Loads env variables
require('dotenv').config()

// Creates app
const app = express();

// Adds json parsing middleware
app.use(express.json());

// Initializes application port
const port = process.env.PORT || 3000;

// Define paths for Express config
const viewsPath = path.join(__dirname,'./templates/views');
const partialsPath = path.join(__dirname, './templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// Setup static directory to serve
app.use(express.static(path.join(__dirname, '../public')));

// Creates base URL route "/" and renders index view
app.get('', (req,res) => {
    res.render('index', {
        title: 'COWIN SEARCH',
    })
})


app.post('/searchByDistrict', async (req, res) => {
    const { 
        districtId, 
        appDate,
        ageGroup
    } = req.body

    if (!districtId || !appDate) {
        return res.status(404).send({
            error: "Please provide all information"
        })
    }

    try {
        const otphash = createHash('sha256').update('121416').digest('hex')
        console.log("otp hash:" + otphash)
        const schedules = await Cowin.getByDistrict(districtId, appDate)
        const centers = schedules.data.centers
        console.log("unfiltered count:" + centers.length)
        const filterAgeGroup = parseInt(ageGroup || 45)
        const availableCentersWithAge = centers.filter(function(c)  {
            if (c.sessions.length === 0)  {
               return false;
            }
            return c.sessions.find(e => e.available_capacity > 0 && e.min_age_limit === filterAgeGroup);
        })
        console.log("filtered count:" + availableCentersWithAge.length)
        return res.json({
            centers: availableCentersWithAge,
            message: "COWIN API call succeeded"
        })

    } catch(e) {
        console.log(e)
        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})

// Catch all route, renders 404 page
app.get('*', (req, res) => {
    res.render('404',
        {
            search: 'page'
        }
    )
})

// Directs app to listen on port specified previously
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})