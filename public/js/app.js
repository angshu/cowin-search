
const btnSearchForSchedule = document.querySelector('#btnSearchForSchedule');
const districtIdInput = document.querySelector('#districtId');
const appDateInput = document.querySelector('#appDate');
const ageGroupInput = document.querySelector('#ageGroup');
const messageOne = document.querySelector('.message-1');
const selectSearchOption = document.querySelector('#selectSearchOption');
const pincodeInput = document.querySelector('#pincode');

selectSearchOption.addEventListener('change', (e) => {
    if (selectSearchOption.value === 'district') {
        document.getElementById("divDistrict").style.display = "block";
        document.getElementById("divPincode").style.display = "none";
    } else {
        document.getElementById("divDistrict").style.display = "none";
        document.getElementById("divPincode").style.display = "block";
    }
})


btnSearchForSchedule.addEventListener('click', (e) => {
    e.preventDefault();
    
    const districtId = districtIdInput.value;
    const appDate = appDateInput.value;
    const ageGroup = ageGroupInput.value;
    const pincode = pincodeInput.value;
    const searchBy = selectSearchOption.value;
    
    messageOne.textContent = 'Loading..';

    const data = {
        districtId,
        appDate,
        ageGroup,
        pincode,
        searchBy
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
                messageOne.textContent = data.error;
            } else {
                messageOne.textContent = "Results: Found - " + data.centers.length;
                renderSearchResultForDistrict(data.centers);
            }
        })
    })
})

const renderSearchResultForDistrict = function(centers) {
    var tbody = document.getElementById("districtSearchResultTable").getElementsByTagName('tbody')[0];
    while (tbody.rows.length > 0) {
        tbody.deleteRow(0);
    }
    
    if (centers) {
        centers.forEach(c => {
            var row = tbody.insertRow();
            var nameCell = row.insertCell(0);
            nameCell.innerHTML = c.name;
            var pinCell = row.insertCell(1);
            pinCell.innerHTML = c.pincode;
            var districtCell = row.insertCell(2);
            districtCell.innerHTML = c.district_name;
        });
    }           
}

const initializePage = function() {
    document.getElementById("divPincode").style.display = "none";
}