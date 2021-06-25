

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
        table_data+='<table id="'+element[0]+'" style="background-color:rgb(226, 228, 146);"><thead><th>Begin Time : '+ element[1] +'</th><th>End Time : '+ element[2] +'</th><th>'+element[3]+'</th><th>Edit</th></thead><tbody></tbody></table>'
    });
    
    document.getElementById("table").innerHTML = table_data
})
