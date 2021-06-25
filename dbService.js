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
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }  
      else
      {
          console.log('Connected');
      }                                   // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else { 
        handleDisconnect();   
                                              // connnection idle timeout (the wait_timeout
        // throw err;                                  // server variable configures this)
      }
    });
  }
  
  handleDisconnect();


class DbService {

    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }


    async setInterview(intervieews,totalBeginTime,totalEndTime) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO all_meets ( meet_begin,meet_end) VALUES (?,?);";
                connection.query(query, [totalBeginTime,totalEndTime] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result['insertId']);
                })
            });
            await new Promise((resolve, reject) => {
                const all_intervieews = [];
                intervieews.forEach(element => {
                    all_intervieews.push([element,insertId]);
                });
                const query = "INSERT INTO meets (participant_email,meet_id) VALUES ?;";
                connection.query(query, [all_intervieews] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            return {
                id : insertId
            };
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

    async bookTicket(user_id,train_num,src,dest) {
        try {
            const seatsReserved = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM trains WHERE train_num = ?;";
                connection.query(query,[train_num], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results[0].seats_res);
                })
            });
            const seat_num = seatsReserved + 1;
            const coach_num = 'A' + Math.floor(seat_num/40+1);
            let seat_type = 'Upper';
            if(seat_num%3==0)
                seat_type = 'Lower';
            else if(seat_num%3==1)
                seat_type = 'Middle';
            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO tickets (user_id, train_num, src,dest,Seat_num,Coach_num,Seat_type) VALUES (?,?,?,?,?,?,?);";
                connection.query(query, [user_id,train_num,src,dest,seat_num,coach_num,seat_type] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.insertId);
                })
            });
            const updateSeats = await new Promise((resolve, reject) => {
                const sql = "UPDATE trains SET seats_res = seats_res + 1 WHERE  train_num = ?";
                connection.query(sql, [train_num], (err, results) => {resolve('OK');})
            });
            return {
                id : insertId
            };
        } catch (error) {
            console.log(error);
        }
    }

    
}

module.exports = DbService;


