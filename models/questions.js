let my = require('../config/database');
let moment = require('moment');
moment.locale('fr');

class Question {
  constructor(d) {
    if (d == null) {
      this._id = null;
      this._content = null;
      this._theme = null;
      this._validation = null;
      this._created = null;
      this._modified = null;
    } else {
      this._id = d.id;
      this._content = d.content;
      this._theme = d.theme;
      this._validation = d.validation;
      this._created = d.created;
      this._modified = d.modified;
    }
  }

  get id() {
    return this._id;
  }

  get content() {
    return this._content;
  }

  get theme() {
    return this._theme;
  }

  get validation() {
    return this._validation;
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

  set content(x) {
    return this._content;
  }

  set theme(x) {
    return this._theme;
  }

  set validation(x) {
    return this._validation;
  }

  set created(x) {
    return this._created;
  }

  set modified(x) {
    return this._modified;
  }

  static all(callback) {
    my.query('SELECT * FROM questions', (err, result) => {
      console.log(result);
      callback(result.map((d) => new Question(d)));
    });
  }
  static find(id, callback) {
    my.query('SELECT * FROM questions WHERE id = ?', [id], (err, result) => {
        callback(new Question(result[0]));
    });
    }

  static create(content, theme, validation, callback) {
    my.query(
      'INSERT INTO questions (content, theme, validation) VALUES (?, ?, ?)',
      [content, theme, validation],
      (err, res) => {
        callback(res);
      }
    );
  }
  static random(callback){
    my.query('SELECT q.id, a.id AS correct FROM questions as q INNER JOIN answers AS a ON q.id = a.question_id WHERE q.validation=1 && a.correct=1 ORDER BY rand()', (err, result)=>{
        callback(result);
    });
}
}

module.exports = Question;
