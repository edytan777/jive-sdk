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

var task = require('./task');
var scheduler = new (require('./scheduler'));

exports.build = function( runnable, interval, context ) {
    return new task(runnable, interval, context );
};

exports.schedule = function(task, key, interval, context) {
    return scheduler.schedule( task, key, interval, context );
};

exports.unschedule = function( key ) {
    scheduler.unschedule(key);
};

exports.clearAllTasks = function() {
    scheduler.shutdown();
}