

// Fetch all interviews and then append them to table


var url = '/get_interviews';
fetch(url)
    .then(function (response) {
    return response.json();
})
.then(function (data) {
    var result = data.data;
    var table_data = "";
    result.forEach(element => {
        let begin_time = moment(element[1]).format("MMMM Do YYYY, h:mm:ss a");
        let end_time = moment(element[2]).format("MMMM Do YYYY, h:mm:ss a");
        let edit_url = 'https://manage-interviews.herokuapp.com/edit-interview/'+element[0];
        table_data+='<table id="'+element[0]+'" style="background-color:rgb(226, 228, 146);"><thead><th>Begin Time : '+ begin_time +'</th><th>End Time : '+ end_time +'</th><th>'+element[3]+'</th><th><a href="'+ edit_url +'">Edit</a></th></thead><tbody></tbody></table>'
    });
    
    document.getElementById("table").innerHTML = table_data
})
