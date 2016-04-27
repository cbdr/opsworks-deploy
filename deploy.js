#! /usr/bin/env node
/*
    Copyright 2015 CareerBuilder, LLC

    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
 */
var Deploy = {
    run: function(options, callback) {
        var AWS = require('aws-sdk');
        AWS.config.region = options.region || 'us-east-1';
        var opsWorks = new AWS.OpsWorks();
        var AppService = require('./lib/app_service')(opsWorks);
        var DeploymentService = require('./lib/deployment_service')(opsWorks);

        var appService = new AppService(options.revision);
        var deploymentService = new DeploymentService(options.stackId, options.layerId, options.appId, options.rolling);

        appService.updateApp(options.appId, function updateAppResponse() {
            deploymentService.deploy(function deployResponse(status) {
                callback(null, {
                    status: status
                });
            });
        });
    }
};
module.exports = Deploy;

// Command-line
if (!module.parent) {
    var argv = require('minimist')(process.argv.slice(2));
    var options = {
        region: argv.region,
        stackId: argv.stack || process.env.AWS_StackId,
        layerId: argv.layer || process.env.AWS_LayerId,
        appId: argv.app || process.env.AWS_AppId,
        revision: argv.revision,
        rolling: argv.rolling
    };

    Deploy.run(options, function(err, result) {
        if (err) {
            console.error(err.stack);
            process.exit(1);
        }
        else {
            console.log('Full Deployment complete!  Result: ' + result.status);
            process.exit(0);
        }
    });
}
