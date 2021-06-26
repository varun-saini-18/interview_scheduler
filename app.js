const express = require('express');
const app = express();
const dbService = require('./dbService');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ 
  extended: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/views'));



app.get("/", (req, res) => {
    res.render("schedule_interviews");
});


app.get("/get_interviews", (req, res) => {
    const db = dbService.getDbServiceInstance();
    const result = db.get_interviews();
    result.then(scheduled_interviews => {
            let total_num_schedules = scheduled_interviews.length;
            let structured_schedules=[];
            let index=0;
            while(index<total_num_schedules)
            {
                let prev=scheduled_interviews[index].meet_id;
                let mbt=scheduled_interviews[index].meet_begin;
                let met=scheduled_interviews[index].meet_end;
                let arr=[]
                while(index<total_num_schedules&&scheduled_interviews[index].meet_id==prev)
                {
                    arr.push(scheduled_interviews[index].participant_email)
                    index++;
                }
                structured_schedules.push([prev,mbt,met,arr]);
            }
            res.json({data : structured_schedules})
        })
    .catch(err => console.log(err));
});


app.post('/schedule-interview',(request,response) => {
    const db = dbService.getDbServiceInstance();
    const {intervieews,totalBeginTime,totalEndTime}= request.body;
    if(intervieews.length<2){
        response.status(400).json({ message: 'There should be atleast two intervieews!'});
    }
    else if(totalEndTime<totalBeginTime||!totalEndTime||!totalBeginTime){
        response.status(400).json({message: 'Enter Valid Time'});
    }
    else{
        const result = db.setInterview(intervieews,totalBeginTime,totalEndTime);
        result.then(data => {
                response.json({data})
            })
        .catch(err => console.log(err));       
    }
    
})


app.get("/edit-interview/:id", (req, res) => {
    res.render("edit_interviews");
});


app.post('/edit-interview/:id',(request,response) => {
    const db = dbService.getDbServiceInstance();
    const {intervieews,totalBeginTime,totalEndTime}= request.body;
    const meetId = request.params.id;
    if(intervieews.length<2){
        response.status(400).json({ message: 'There should be atleast two intervieews!'});
    }
    else if(totalEndTime<totalBeginTime||!totalEndTime||!totalBeginTime){
        response.status(400).json({message: 'Enter Valid Time'});
    }
    else{
        const result = db.editInterview(meetId,intervieews,totalBeginTime,totalEndTime);
        result.then(data => {
                response.json({data : data})
            })
        .catch(err => console.log(err));       
    }
    
})

app.get("/show_all_interviews", (req, res) => {
    res.render("view_interviews");
});


app.get("/get_participants", (req, res) => {
    const db = dbService.getDbServiceInstance();
    const result = db.get_participants();
    result.then(data => {
            res.json({data : data})
        })
    .catch(err => console.log(err));
});


app.get("/get_interview_detail/:id", (req, res) => {
    const db = dbService.getDbServiceInstance();
    const result = db.get_interview_detail(req.params.id);
    result.then(data => {
            res.json({data : data})
        })
    .catch(err => console.log(err));
});



const port = process.env.PORT || '5000';
app.listen(port, () => console.log(`Server started on Port ${port}`));

