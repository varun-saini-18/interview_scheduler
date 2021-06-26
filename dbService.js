const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

var db_config = {
    host: 'bemvgo8nokzzatzk1jik-mysql.services.clever-cloud.com',
    user: 'u2jnj1s64todnegn',
    password: 'oF2UhdcDwSfqp6dIxbmC',
    database: 'bemvgo8nokzzatzk1jik'
};



var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config);
    connection.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
        else {
            console.log('Connected');
        }
    });
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            handleDisconnect();
        }
    });
}

handleDisconnect();


class DbService {

    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async setInterview(intervieews, totalBeginTime, totalEndTime) {
        try {
            const existing_interviews = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM meets INNER JOIN all_meets ON meets.meet_id = all_meets.id WHERE meets.participant_email IN ?;";
                connection.query(query, [[intervieews]], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            let existing_begin_time = [], existing_end_time = [];
            existing_interviews.forEach(element => {
                existing_begin_time.push(element.meet_begin);
                existing_end_time.push(element.meet_end);
            });
            let conflicting_intervieews = new Set();
            for (let index = 0; index < existing_interviews.length; index++) {
                if (!(existing_begin_time[index] >= totalEndTime || existing_end_time[index] <= totalBeginTime)) {
                    conflicting_intervieews.add(existing_interviews[index].participant_email);
                }
            }
            if (conflicting_intervieews.size) {
                conflicting_intervieews = Array.from(conflicting_intervieews);

                return {
                    error: 'Time slot Not Available',
                    conflicting_intervieews: conflicting_intervieews
                }
            }
            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO all_meets ( meet_begin,meet_end) VALUES (?,?);";
                connection.query(query, [totalBeginTime, totalEndTime], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result['insertId']);
                })
            });
            await new Promise((resolve, reject) => {
                const all_intervieews = [];
                intervieews.forEach(element => {
                    all_intervieews.push([element, insertId]);
                });
                const query = "INSERT INTO meets (participant_email,meet_id) VALUES ?;";
                connection.query(query, [all_intervieews], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            return {
                id: insertId
            };
        } catch (error) {
            console.log(error);
        }
    }

    async editInterview(meetId, intervieews, totalBeginTime, totalEndTime) {
        try {
            const meetIdAsArray = []
            meetIdAsArray.push(meetId);
            const existing_interviews = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM meets INNER JOIN all_meets ON meets.meet_id = all_meets.id WHERE meets.participant_email IN ? AND meets.meet_id NOT IN ?;";
                connection.query(query, [[intervieews], [meetIdAsArray]], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            let existing_begin_time = [], existing_end_time = [];
            existing_interviews.forEach(element => {
                existing_begin_time.push(element.meet_begin);
                existing_end_time.push(element.meet_end);
            });
            let conflicting_intervieews = new Set();
            for (let index = 0; index < existing_interviews.length; index++) {
                console.log(existing_begin_time[index], totalBeginTime, existing_end_time[index], totalEndTime)
                if (!(existing_begin_time[index] >= totalEndTime || existing_end_time[index] <= totalBeginTime)) {
                    conflicting_intervieews.add(existing_interviews[index].participant_email);
                }
            }
            if (conflicting_intervieews.size) {
                conflicting_intervieews = Array.from(conflicting_intervieews);

                return {
                    error: 'Time slot Not Available',
                    conflicting_intervieews: conflicting_intervieews
                }
            }
            await new Promise((resolve, reject) => {
                const query = "DELETE FROM `meets` WHERE meet_id = ? ;";
                connection.query(query, [meetId], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            await new Promise((resolve, reject) => {
                const query = "DELETE FROM `all_meets` WHERE id = ? ;";
                connection.query(query, [meetId], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO all_meets ( meet_begin,meet_end) VALUES (?,?);";
                connection.query(query, [totalBeginTime, totalEndTime], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result['insertId']);
                })
            });
            await new Promise((resolve, reject) => {
                const all_intervieews = [];
                intervieews.forEach(element => {
                    all_intervieews.push([element, insertId]);
                });
                const query = "INSERT INTO meets (participant_email,meet_id) VALUES ?;";
                connection.query(query, [all_intervieews], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            return {
                id: insertId
            };
        } catch (error) {
            console.log(error);
        }
    }

    async get_interview_detail(meet_id) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM meets INNER JOIN all_meets ON meets.meet_id = all_meets.id WHERE all_meets.id=?;";
                connection.query(query, [meet_id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async get_participants() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users;";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }


    async get_interviews() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM all_meets INNER JOIN meets ON all_meets.id = meets.meet_id ORDER BY all_meets.id;";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }




}

module.exports = DbService;


