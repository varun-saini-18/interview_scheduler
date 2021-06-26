
// Fetch all the participants from db to insert participants in dropdown

fetch('https://manage-interviews.herokuapp.com/get_participants')
    .then(response => response.json())
    .then(data => {
        jQuery(document).ready(function ($) {
            var comboTree1;
            comboTree1 = $('#justAnInputBox').comboTree({
                source: data.data,
                isMultiple: true,
                cascadeSelect: false,
                collapse: true,
                selectableLastNode: true,
            });
        });
    });

// Fill the details of current meet_id that need to be editted

let id = window.location.href;
id = id.split("interview/")[1];
let url = 'https://manage-interviews.herokuapp.com/get_interview_detail/' + id;

fetch(url)
    .then(response => response.json())
    .then(data => {
        let previous_interviewees = "Previous Intervieews : ";
        let begin_time = moment(data.data[0].meet_begin).format("MMMM Do YYYY, h:mm:ss a");
        let end_time = moment(data.data[0].meet_end).format("MMMM Do YYYY, h:mm:ss a");
        data.data.forEach(element => {
            previous_interviewees += element.participant_email + "  -  ";
        });
        document.getElementById("prev_intervieews").innerHTML = previous_interviewees.substring(0, previous_interviewees.length - 5);
        document.getElementById("prev_begin_time").innerHTML = "Previous beginning time was : " + begin_time;
        document.getElementById("prev_end_time").innerHTML = "Previous ending time was : " + end_time;

    });


// Function to schedule the interviews

function schedule() {
    document.getElementById("edit-schedule").innerHTML="Please Wait!!";
    document.getElementById("edit-schedule").disabled = true;

    var beginDate = document.getElementById("beginDate").value;
    beginDate = beginDate.split("-");
    beginDate = new Date(beginDate[0], beginDate[1] - 1, beginDate[2]);
    beginDate = beginDate.getTime();

    var beginTime = document.getElementById("beginTime").value;
    beginTime = beginTime.split(":");
    beginTime = beginTime[0] * 60 * 60 + beginTime[1] * 60;
    beginTime = beginTime * 1000;

    var endDate = document.getElementById("endDate").value;
    endDate = endDate.split("-");
    endDate = new Date(endDate[0], endDate[1] - 1, endDate[2]);
    endDate = endDate.getTime();

    var endTime = document.getElementById("endTime").value;
    endTime = endTime.split(":");
    endTime = endTime[0] * 60 * 60 + endTime[1] * 60;
    endTime = endTime * 1000;

    var totalBeginTime = beginDate + beginTime;
    var totalEndTime = endDate + endTime;

    if (totalBeginTime > totalEndTime) {
        alert('Enter Valid Time!');
        return;
    }

    var intervieews = document.getElementById("justAnInputBox").value;
    intervieews = intervieews.split(", ");

    const url = '/edit-interview/' + id;
    fetch(url, {
        method: "POST",
        body: JSON.stringify({
            "intervieews": intervieews,
            "totalBeginTime": totalBeginTime,
            "totalEndTime": totalEndTime
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then((data) => {
        console.log(data)
        if (!!data.message) {
            alert(data.message);
            document.getElementById("edit-schedule").innerHTML="Try Again!!";
            document.getElementById("edit-schedule").disabled = false;
        }
        else if (!!data.data.error) {
            alert('error = ' + data.data.error + '. Conflicting intervieews are : ' + data.data.conflicting_intervieews);
            document.getElementById("edit-schedule").innerHTML="Try Again!!";
            document.getElementById("edit-schedule").disabled = false;
        }
        else {
            alert('Successfully registered your meeting!');
            window.location.href = "https://manage-interviews.herokuapp.com/show_all_interviews";
        }

    })

}

