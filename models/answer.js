let my = require('../config/database');
let moment = require('moment');
moment.locale('fr');

class Answer {
  constructor(d) {
    if (d == null) {
      this._id = null;
      this._question_id = null;
      this._content = null;
      this._correct = null;
      this._created = null;
      this._modified = null;
    } else {
      this._id = d.id;
      this._question_id = d.question_id;
      this._content = d.content;
      this._correct = d.correct;
      this._created = d.created;
      this._modified = d.modified;
    }
  }

  get id() {
    return this._id;
  }

  get question_id() {
    return this._question_id;
  }

  get content() {
    return this._content;
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

  set question_id(x) {
    return this._question_id;
  }

  set content(x) {
    return this._content;
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
    my.query('SELECT * FROM answers', (err, result) => {
      console.log(result);
      callback(result.map((d) => new Answer(d)));
    });
  }

  static create(question_id, content, correct, callback) {
    my.query(
      'INSERT INTO answers (question_id, content, correct) VALUES (?, ?, ?)',
      [question_id, content, correct],
      (err, res) => {
        callback(res);
      }
    );
  }
  static find(id, callback) {
    my.query('SELECT * FROM answers WHERE question_id = ? ORDER BY rand()', [id], (err, result) => {
      callback(result.map((d) => new Answer(d)));
    });
  }
}

module.exports = Answer;
