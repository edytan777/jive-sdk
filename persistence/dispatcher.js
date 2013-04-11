/*
 * Copyright 2013 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

var util            = require('util'),
    filePersistence = require('./file'),
    jive = require('../api');


var persistenceListener = null;

var Dispatcher = function () {
};

util.inherits(Dispatcher, events.EventEmitter);

var dispatcher = new Dispatcher();

function setListener( listener ) {
    if ( !listener ) {
        throw 'Cannot register an empty persistence listener.';
    }
    persistenceListener = listener;
}

function lazyInit() {
    if ( !persistenceListener ) {
        var persistence = jive.config.fetch()['persistence'];
        setListener( persistence || new filePersistence() );
    }
}

//////////////////////////////////////////////////////////////
// public
//////////////////////////////////////////////////////////////

exports.save = function (collectionID, key, data, callback) {
    lazyInit();
    persistenceListener.save(collectionID, key, data, callback);
};

exports.find = function (collectionID, keyValues, callback) {
    lazyInit();
    persistenceListener.find(collectionID, keyValues, callback);
};

exports.remove = function (collectionID, key, callback) {
    lazyInit();
    persistenceListener.remove(collectionID, key, callback);
};

exports.setListener = setListener;

