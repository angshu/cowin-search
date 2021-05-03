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


app.post('/searchForCenters', async (req, res) => {
    const { 
        districtId,
        pincode, 
        appDate,
        ageGroup,
        searchBy
    } = req.body

    if (!searchBy || !appDate) {
        return res.status(404).send({
            error: "Please provide Date"
        })
    }

    if (searchBy === 'district' && !districtId) {
        return res.status(404).send({
            error: "Please provide district id"
        })
    } 

    if (searchBy === 'pincode' && !pincode) {
        return res.status(404).send({
            error: "Please provide pincode"
        })
    } 

    try {
        const otphash = createHash('sha256').update('121416').digest('hex')
        console.log("otp hash:" + otphash)
        const schedules = searchBy === 'pincode' ? await Cowin.getByPincode(pincode, appDate) : await Cowin.getByDistrict(districtId, appDate)
        const centers = schedules.data.centers
        console.log("unfiltered count:" + centers.length)
        const ageLimit = ageGroup || 0;
        const filterAgeGroup = parseInt(ageLimit)
        const availableCenters = centers.filter(function(c)  {
            if (c.sessions.length === 0)  {
               return false;
            }
            return c.sessions.find(function(session) {
                if (filterAgeGroup > 0) {
                    return session.available_capacity > 0 && session.min_age_limit === filterAgeGroup;  
                } else {
                    return session.available_capacity > 0;
                }
            });
        })
        console.log("filtered count:" + availableCenters.length)
        return res.json({
            centers: availableCenters,
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