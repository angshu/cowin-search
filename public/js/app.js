(function() {
document.querySelector('#selectSearchOption').addEventListener('change', (e) => {
    var selectSearchOption = document.querySelector('#selectSearchOption');
    if (selectSearchOption.value === 'district') {
        document.getElementById("divDistrict").style.display = "block";
        document.getElementById("divPincode").style.display = "none";
    } else {
        document.getElementById("divDistrict").style.display = "none";
        document.getElementById("divPincode").style.display = "block";
    }
})

document.querySelector('#linkShowLogin').addEventListener('click', (e) => {
    document.getElementById("divMobileForm").style.display = "block";
    document.getElementById("divOtpForm").style.display = "none";
})

var otptxnId, token;
document.querySelector('#btnSubmitMobile').addEventListener('click', (e) => {
    e.preventDefault();
    const data = { mobileNumber : document.querySelector('#mobileNumber').value }
    token = null;
    fetch("/generateOTP", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        response.json()
        .then((data) => {
            if (data.error) {
                document.querySelector('.message-1').textContent = data.error;
            } else {
                console.log("otp generate => ", data)
                otptxnId = data.txnId;
            }
        })
    })
    document.getElementById("divMobileForm").style.display = "none";
    document.getElementById("divOtpForm").style.display = "block";
})

document.querySelector('#btnSubmitOtp').addEventListener('click', (e) => {
    e.preventDefault();
    const otpValue = document.querySelector('#otpInput').value;
    const data = { otptxnId, otpValue}

    fetch("/confirmOTP", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        response.json()
        .then((data) => {
            if (data.error) {
                document.querySelector('.message-1').textContent = data.error;
            } else {
                console.log("otp confirmation => ", data)
                token = data.token;
                document.getElementById("divMobileForm").style.display = "none";
                document.getElementById("divOtpForm").style.display = "none";
                document.getElementById("linkShowSchedule").click();
            }
        })
    })
    
})

document.querySelector('#btnSearchForSchedule').addEventListener('click', (e) => {
    e.preventDefault();
    const keepPolling = document.querySelector('#keepPolling').checked;
    if (keepPolling) {
        crawl(0);
    }
    querySchedule();
})

var myPrefs = { "centers": [], "pincodes" : [] }; 
document.querySelector('#btnSubmitPref').addEventListener('click', (e) => {
    e.preventDefault();
    var favCenters = document.getElementById("favCenters").value;
    if (favCenters && favCenters.trim()) {
        var centerList = favCenters.split(",").filter(e => e.trim() != "");
        myPrefs.centers = [];
        if (centerList.length > 0) {
            myPrefs.centers = centerList.map(e => e.trim());
        }
    }
    var favPinccodes = document.getElementById("favPincodes").value;
    if (favPinccodes && favPinccodes.trim()) {
        var pincodes = favPinccodes.split(",").filter(e => e.trim() != "");
        myPrefs.pincodes = [];
        if (pincodes.length > 0) {
            myPrefs.pincodes = pincodes.map(e => e.trim());
        }
    }
    
    document.getElementById("linkShowSchedule").click();
})

const querySchedule = function() {
    const districtId = document.querySelector('#districtList').value;
    const appDate = document.querySelector('#appDate').value;
    const ageGroup = document.querySelector('#ageGroup').value;
    const pincode = document.querySelector('#pincode').value;
    const searchBy = document.querySelector('#selectSearchOption').value;
    
    document.querySelector('.message-1').textContent = 'Loading..';

    const data = {
        districtId,
        appDate,
        ageGroup,
        pincode,
        searchBy,
        token
    }

    fetch("/searchForCenters", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        response.json()
        .then((data) => {
            if (data.error) {
                document.querySelector('.message-1').textContent = data.error;
            } else {
                document.querySelector('.message-1').textContent = "Results: Found - " + data.centers.length;
                showSearchResults(data.centers);
            }
        })
    })
}

const crawl = function(counter) {
    if(counter < 30) {
        querySchedule();
        const keepPolling = document.querySelector('#keepPolling').checked;
        if (!keepPolling) {
            console.log("Polling stopped.")
            return;
        }
        setTimeout(function() {
            counter++;
            crawl(counter);
        }, 60000);
    }
}

const showSearchResults = function(centers) {
    var tbody = document.getElementById("districtSearchResultTable").getElementsByTagName('tbody')[0];
    while (tbody.rows.length > 0) {
        tbody.deleteRow(0);
    }

    const populateCell = function (cell, value) {
        cell.innerHTML = value;
    }
    
    if (centers) {
        var foundMatchingPref = false;
        centers.forEach(c => {
            var row = tbody.insertRow();
            populateCell(row.insertCell(0), c.center_id);
            populateCell(row.insertCell(1), c.name);
            populateCell(row.insertCell(2), c.pincode);
            populateCell(row.insertCell(3), c.district_name);
            const centerSessions = c.sessions.filter(sess => sess.available_capacity > 0)
                    .map(function(cs) {
                        var res = {};
                        res.capacity = cs.available_capacity;
                        res.date = cs.date;
                        res.vaccine = cs.vaccine;
                        return res;
                    });
            const vaccineGroup = centerSessions.reduce(function (acc, obj) {
                                    let key = obj["vaccine"]
                                    if (!acc[key]) {
                                        acc[key] = []
                                    }
                                    acc[key].push(obj)
                                    return acc
                                }, {});
            var slots = [];                    
            for (var v in vaccineGroup) {
                slots.push(vaccineDates = v + ": " + vaccineGroup[v].map(cs => cs.date + "(" + cs.capacity + ")").join());
            }
            populateCell(row.insertCell(4), slots.join());
            if (myPrefs.centers.includes(c.center_id.toString())) {
                row.style.backgroundColor = '#ff0000';
                foundMatchingPref = true;
            } else if (myPrefs.pincodes.includes(c.pincode.toString())) {
                row.style.backgroundColor = '#ff0000';
                foundMatchingPref = true;
            }
        });

        var speechText = "Search complete. Found " + centers.length;
        if (foundMatchingPref) {
            speechText = speechText + ". Few match your preferences."
        }
        voiceNotify(speechText); 
    }           
}

var synth = window.speechSynthesis;
var voices = [];
const populateVoiceList = function() {
    if (!synth) {
        console.log("Could not initiate speech synthesis. Check your browser settings.");
        return;
    }
    voices = synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
        if ( aname < bname ) return -1;
        else if ( aname == bname ) return 0;
        else return +1;
    });
}

const voiceNotify = function(textToSpeak) {
    if (!synth) {
        return;
    }
    const notifyByVoice = document.querySelector('#voiceNotify').checked;
    if (!notifyByVoice) {
        return;
    }

    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    var utterThis = new SpeechSynthesisUtterance(textToSpeak);
    utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
    }

    utterThis.voice = voices[0];
    utterThis.pitch = "0.6";
    utterThis.rate = "0.8";
    synth.speak(utterThis);
}

var stateToDistrictMap = {};

const populateDistrictList = function(state, districts) {
    if (districts) {
        var districtListEl = document.getElementById("districtList");
        while (districtListEl.options.length > 0) {
            districtListEl.remove(0);
        } 
        for (var i = 0; i < districts.length; i++) {
            var aDist = districts[i];
            var el = document.createElement("option");
            el.textContent = aDist.district_name;
            el.value = aDist.district_id;
            districtListEl.appendChild(el);
        }
        if (!stateToDistrictMap[state]) {
            stateToDistrictMap[state] = districts;
        }
    }
}

const fetchDistictsForState = function() {
    const selectedState = document.getElementById("stateList").value;
    if (!selectedState) {
        return;
    }
    if (stateToDistrictMap[selectedState]) {
        populateDistrictList(selectedState, stateToDistrictMap[selectedState]);
        return;
    }

    fetch("/districts/" + selectedState, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        response.json()
        .then((data) => {
            if (data.error) {
                document.querySelector('.message-1').textContent = data.error;
            } else {
                const districts = data.result.districts || [];
                if (districts) {
                    populateDistrictList(selectedState, districts);
                }
            }
        })
    })
}

const fetchStateList = function() {
    fetch("/states", {
        method: 'GET',
        headers: {
           'Content-Type': 'application/json'
        }
    })
    .then(response => {
        response.json()
        .then((data) => {
            if (data.error) {
                document.querySelector('.message-1').textContent = data.error;
            } else {
                const states = data.result.states || [];
                if (states) {
                    var stateList = document.getElementById("stateList");
                    for (var i = 0; i < states.length; i++) {
                        var aState = states[i];
                        var el = document.createElement("option");
                        el.textContent = aState.state_name;
                        el.value = aState.state_id;
                        stateList.appendChild(el);
                    }
                    stateList.addEventListener('change', fetchDistictsForState);
                }
            }
        })
    })
}

populateVoiceList();
fetchStateList();

})()