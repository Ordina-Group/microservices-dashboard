# microservices-dashboard

[![Join the chat at https://gitter.im/ordina-jworks/microservices-dashboard](https://badges.gitter.im/ordina-jworks/microservices-dashboard.svg)](https://gitter.im/ordina-jworks/microservices-dashboard?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Overview

The primary goal of this project is to visualize links between microservices and the encompassing ecosystem.
This AngularJS application consumes endpoints exposed by [microservices-dashboard-server](https://github.com/ordina-jworks/microservices-dashboard-server).
It displays four columns: UI, Resources, Microservices and Backends.
Each of these columns show nodes and links between them.
Currently only resources, microservices and backends are supported, although the UI-part is almost complete.
The information for these links come from Spring Boot Actuator health endpoints and hypermedia indexes, which are aggregated in the [microservices-dashboard-server](https://github.com/ordina-jworks/microservices-dashboard-server) project.

## Building from source

First a basic build should be done:
```
npm install
```
Then bower dependencies should be installed:
```
bower install
```

## Running

Use gulp to serve the resources using the configuration file:
```
gulp serve:conf
```

Note:

The server needs to be started to get any data in the dashboard: [microservices-dashboard-server](https://github.com/ordina-jworks/microservices-dashboard-server)

## Screenshots

<img width="1440" alt="screen shot 2016-04-07 at 10 56 44" src="https://cloud.githubusercontent.com/assets/6663110/14345954/11db9980-fcb0-11e5-963f-38bca041e5bb.png">

<img width="1440" alt="screen shot 2016-04-07 at 11 02 41" src="https://cloud.githubusercontent.com/assets/6663110/14345993/4fa2383c-fcb0-11e5-832d-10cbe2bdc2d6.png">

<img width="1440" alt="screen shot 2016-04-07 at 10 58 25" src="https://cloud.githubusercontent.com/assets/6663110/14345957/1496601a-fcb0-11e5-812b-b1abac778d79.png">

<img width="1440" alt="screen shot 2016-04-07 at 11 00 03" src="https://cloud.githubusercontent.com/assets/6663110/14345958/16809878-fcb0-11e5-8045-d4b6ff4b920a.png">

<img width="1440" alt="screen shot 2016-04-07 at 11 00 22" src="https://cloud.githubusercontent.com/assets/6663110/14345960/19004c10-fcb0-11e5-80dd-dd4e1eab25ab.png">

## TODO

- Single run instances gulp build
- Cleanup gulp files
- Serve directly from src, not .tmp
- Remove unused tasks
- Add bump tasks
