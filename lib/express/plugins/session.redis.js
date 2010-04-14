var kiwi    = require('kiwi'),
    redis   = kiwi.require('redis-client'),
    express = kiwi.require('express')

var utils          = require('express/utils'),
    session_plugin = require('express/plugins/session')

// --- RedisStore
exports.RedisStore = session_plugin.Store.extend({

  /**
   * Datastore name.
   */

  name: 'Redis',

  /**
   * Initialize in-redis db session store.
   */

  constructor: function() {
    var store = this

    store.db  = redis.createClient()
    store.db.stream.addListener("connect", function() {
      store.db.select(42)
      if(process.env['MIGRATE_EXPRESS_SESSIONS'])
        store.db.flushdb();
    })
    store.db.stream.addListener("close", function (inError) {
      throw new Error("Redis store went away??")
    })
  },

  /**
   * Fetch session with the given _sid_ or
   * a new Session is created.
   *
   * @param  {number} sid
   * @param  {function} callback
   * @api private
   */

  fetch: function(sid, callback) {
    var store = this;
    this.db.get('session-'+sid, function(err, value) {
      if(message == null)
        store.generate(callback)
      else {
        var session = JSON.parse(value.toString())
        session.touch = function() {
          this.lastAccess = Number(new Date)
        }
        callback(null, session)
      }
    })
  },

  /**
   * Commit _session_ data.
   *
   * @param  {Session} session
   * @param  {function} callback
   * @api private
   */

  commit: function(session, callback) {
    this.db.set('session-'+session.id, JSON.stringify(session), function(err) {
      if (callback) callback(null, session)
    })
  },

  /**
   * Clear all sessions.
   *
   * @param  {function} callback
   * @api public
   */

  clear: function(callback) {
    this.db.flushdb(function () {
      if (callback) callback()
    })
  },

  /**
   * Destroy session using the given _sid_.
   *
   * @param  {int} sid
   * @param  {function} callback
   * @api public
   */

  destroy: function(sid, callback) {
    this.db.del('session-'+sid, function(err) {
      if (callback) callback(sid)
    });
  },

  /**
   * Pass the number of sessions currently stored.
   *
   * @param  {function} callback
   * @api public
   */

  length: function(callback) {
    this.db.keys('session-*', function(err, keys) {
      callback(null, keys.toString().split(/\s+/).length)
    })
  },

  /**
   * Reap sessions older than _ms_.
   *
   * @param  {int} ms
   * @param  {function} callback
   * @api private
   */

  reap: function(ms, callback) {
    var store     = this,
        threshold = Number(new Date(Number(new Date) - ms))

    this.db.keys("session-*", function(err, sid) {
      store.db.get(sid.toString(), function(err, session) {
        if (session == null || session.lastAccess < threshold)
          store.destroy(sid)
      })
    })
    if (callback) callback()
  },

  /**
   * Creates and passes a shiny new session.
   *
   * @param {function} callback
   * @api public
   */

  generate: function(callback) {
    callback(null, new session_plugin.Base(utils.uid()))
  }
})
