let my = require('../config/database');
let moment = require('moment')
moment.locale('fr')
class User {
    constructor(d){
        if(d == null){
            this._id = null
            this._username = null
            this._password = null
            this._created = null
            this._modified = null
        }else{
            this._id = d.id
            this._username = d.username
            this._password = d.password
            this._created = d.created
            this._modified = d.modified
        }
    }
    get id(){
        return this._id
}
    get username(){
        return this._name
}
    get password(){
        return this._password
}
    get created(){
        return moment(this._created)
}
get modified(){
    return moment(this._modified)
}
   
set id(x){
        return this._id
}
    set username(x){
        return this._username
}
    set password(x){
        return this._password
}
    set created(x){
        return this._created
}
    set modified(x){
        return this._modified
}

static all(callback){
    my.query("SELECT * FROM users",(err,result)=>{
        console.log(result);
        callback(result.map((d)=> new User(d)))
    })
}
static create(password,username,callback){
    my.query('INSERT INTO users (username,password) VALUES(?,?)', [username,password], (err,res) =>{
        callback(res)
    })
}
static login(username, password, callback) {
    my.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, result) => {
        if (result.length == 1) {
          callback(new User(result[0]));
        } else {
          callback(null);
        }
      }
    );
  }
  static find(username, callback) {
    my.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
      callback(new User(result[0]));
    });
  }
}
module.exports =User