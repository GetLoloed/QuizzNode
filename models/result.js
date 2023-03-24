let my = require('../config/database');
let moment = require('moment');
moment.locale('fr');

class Result {
  constructor(d) {
    if (d == null) {
      this._id = null;
      this._user = null;
      this._total = null;
      this._correct = null;
      this._created = null;
      this._modified = null;
    } else {
      this._id = d.id;
      this._user = d.user;
      this._total = d.total;
      this._correct = d.correct;
      this._created = d.created;
      this._modified = d.modified;
    }
  }

  get id() {
    return this._id;
  }
  get user() {
    return this._user;
  }
  get total() {
    return this._total;
  }
  get correct() {
    return this._correct;
  }
  get created() {
    return moment(this._created);
  }
  get modified() {
    return moment(this._modified);
  }

  set id(x) {
    return this._id;
  }
  set user(x) {
    return this._user;
  }
  set total(x) {
    return this._total;
  }
  set correct(x) {
    return this._correct;
  }
  set created(x) {
    return this._created;
  }
  set modified(x) {
    return this._modified;
  }

  static all(callback) {
    my.query("SELECT * FROM results ORDER BY correct DESC LIMIT 9", (err, result) => {
      callback(result.map((d) => new Result(d)));
    });
  }

  static create(user, total, correct, callback) {
    my.query(
      "INSERT INTO results (user, total, correct) VALUES (?, ?, ?)",
      [user, total, correct],
      (err, res) => {
        callback(res);
      }
    );
  }
}

module.exports = Result;
