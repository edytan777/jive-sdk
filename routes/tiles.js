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

/**
 * These are global, publically available endpoints useful in the administration of the service
 * tiles, tile definitions, and other concerns.
 */

var url = require('url');
var q = require('q');
var jive = require("../api");
var dev = require('./dev');

// xxx todo - add oauth2 support end points here

exports.registration = function( req, res ) {
    var conf = jive.service.options;
    var clientId = conf.clientId;
    var secret = conf.clientSecret;
    var url = req.body['url'];
    var guid = req.body['guid'];
    var config = req.body['config'];
    var name = req.body['name'];
    var code = req.body['code'];

    var auth = req.headers['authorization'];
    if ( !jive.util.basicAuthorizationHeaderValid(auth, clientId, secret ) ) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end( JSON.stringify( { 'status': 403, 'error': 'Invalid or missing HMAC authorization header' } ) );
        return;
    }

    var completedResponse = false;

    var registerer = function( scope, instanceLibrary ) {
        instanceLibrary.findByScope(guid).then( function(tileInstance) {
            // the instance exists
            // update the config only
            if ( tileInstance ) {
                // update the config
                tileInstance['config'] = config;

                instanceLibrary.save(tileInstance).then(function() {
                    jive.events.emit("updateInstance." + name, tileInstance);
                    res.writeHead(204, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(tileInstance));
                    completedResponse = true;
                });

            } else {
                return instanceLibrary.register(clientId, url, config, name, code).then(
                    function( tileInstance ) {
                        jive.logger.info("registered instance", tileInstance );
                        instanceLibrary.save(tileInstance).then(function() {
                            jive.events.emit("newInstance." + name, tileInstance);
                            res.writeHead(201, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify(tileInstance));
                            completedResponse = true;
                        });

                    },
                     function(err) {
                        jive.logger.error('Registration failure for', scope);
                        jive.logger.debug(scope, err);
                        res.writeHead(502, { 'Content-Type': 'application/json' });
                        var statusObj = { status: 500, 'error': 'Failed to get acquire access token', 'detail' : err };
                        var body = JSON.stringify( statusObj );
                        res.end( body );
                        completedResponse = true;
                    } );
            }
        });

    };


    // try tiles
    jive.tiles.definitions.findByTileName( name).then( function( found ) {

        if ( found ) {
            registerer(guid, jive.tiles);
        }

    }).then( function() {
            // try extstreams
            jive.extstreams.definitions.findByTileName( name).then( function( found ) {
                completedResponse = true;
                if ( found ) {
                    registerer(guid, jive.extstreams);
                }
                else {
                    errorResponse(res);
                }
            });

            var errorResponse = function(res) {
                if (!completedResponse) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(
                        JSON.stringify({status: 400, message: "No tile or external stream definition was found for the given name '" + name + "'"}));
                    completedResponse = true;
                }
            }
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// development routes

exports.tiles = dev.tiles;
exports.installTiles = dev.installTiles;
