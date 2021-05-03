const axios = require("axios");

const APP_BASE_URL = `https://cdn-api.co-vin.in/api/v2/appointment/sessions`

module.exports = {
    getByDistrict: (districtId, apptDate) => axios({
        method:"GET",
        url : APP_BASE_URL + `/calendarByDistrict`,
        headers: {
            "content-type":"application/x-www-form-urlencoded"
        },
        params: {
            district_id:districtId,
            date:apptDate
        }
    }),
    getByPincode: (pincode, apptDate) => axios({
        method:"GET",
        url : APP_BASE_URL + `/calendarByPin`,
        headers: {
            "content-type":"application/x-www-form-urlencoded"
        },
        params: {
            pincode:pincode,
            date:apptDate
        }
    })
}
