
// Fetch all the participants from db

fetch('https://manage-interviews.herokuapp.com/get_participants')
    .then(response => response.json())
    .then(data => {
        jQuery(document).ready(function ($) {
            var comboTree1, comboTree2;
            comboTree1 = $('#justAnInputBox').comboTree({
                source: data.data,
                isMultiple: true,
                cascadeSelect: false,
                collapse: true,
                selectableLastNode: true,
            });
        });
    });


// Function to schedule the interviews

function schedule(){
    document.getElementById("schedule-btn").innerHTML="Please Wait!!";
    document.getElementById("schedule-btn").disabled = true;

    var beginDate = document.getElementById("beginDate").value;
    beginDate = beginDate.split("-");
    beginDate = new Date( beginDate[0], beginDate[1] - 1, beginDate[2]);
    beginDate = beginDate.getTime();

    var beginTime = document.getElementById("beginTime").value;
    beginTime = beginTime.split(":");
    beginTime = beginTime[0]*60*60+beginTime[1]*60;
    beginTime = beginTime * 1000;

    var endDate = document.getElementById("endDate").value;
    endDate = endDate.split("-");
    endDate = new Date( endDate[0], endDate[1] - 1, endDate[2]);
    endDate = endDate.getTime();

    var endTime = document.getElementById("endTime").value;
    endTime = endTime.split(":");
    endTime = endTime[0]*60*60+endTime[1]*60;
    endTime = endTime * 1000;
    
    var totalBeginTime = beginDate + beginTime;
    var totalEndTime = endDate + endTime;

    if(totalEndTime<totalBeginTime)
    {
        alert('Enter Valid Time!');
        return;
    }
    
    var intervieews = document.getElementById("justAnInputBox").value;
    intervieews = intervieews.split(", ");

    const url = '/schedule-interview';
    fetch(url, {
        method: "POST",
        body: JSON.stringify({
            "intervieews" : intervieews,
            "totalBeginTime" : totalBeginTime,
            "totalEndTime" : totalEndTime
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())  
    .then((data) => {
        if(!!data.message){
            document.getElementById("schedule-btn").innerHTML="Schedule Again!!";
            document.getElementById("schedule-btn").disabled = false;
            alert(data.message);
        }
        else if(!!data.data.error){
            document.getElementById("schedule-btn").innerHTML="Schedule Again!!";
            document.getElementById("schedule-btn").disabled = false;
            alert('error = '+ data.data.error + '. Conflicting intervieews are : ' + data.data.conflicting_intervieews);
            
        }
        else{
            alert('Successfully registered your meeting!');
            window.location.href = "https://manage-interviews.herokuapp.com/show_all_interviews";
        }
        
    })

}

