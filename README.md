# microservices-dashboard
[![Gitter](https://badges.gitter.im/ordina-jworks/microservices-dashboard.svg)](https://gitter.im/ordina-jworks/microservices-dashboard?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[ ![Codeship Status for ordina-jworks/microservices-dashboard](https://codeship.com/projects/89e46fa0-1b60-0134-de15-0e8ad2af7d49/status?branch=master)](https://codeship.com/projects/159640)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f49a317f145e4f2fb0a596c9b99d1675)](https://www.codacy.com/app/ordina-jworks/microservices-dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ordina-jworks/microservices-dashboard&amp;utm_campaign=Badge_Grade)
[![][license img]][license]
[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/ordina-jworks/microservices-dashboard.svg)](http://isitmaintained.com/project/ordina-jworks/microservices-dashboard "Average time to resolve an issue")
[![Percentage of issues still open](http://isitmaintained.com/badge/open/ordina-jworks/microservices-dashboard.svg)](http://isitmaintained.com/project/ordina-jworks/microservices-dashboard "Percentage of issues still open")
[ ![Download](https://api.bintray.com/packages/ordina-jworks/microservices-dashboard-server/microservices-dashboard-ui/images/download.svg) ](https://bintray.com/ordina-jworks/microservices-dashboard-server/microservices-dashboard-ui/_latestVersion)

## Overview

The primary goal of this project is to visualize links between microservices and the encompassing ecosystem.
This AngularJS application consumes endpoints exposed by [microservices-dashboard-server](https://github.com/ordina-jworks/microservices-dashboard-server).
It displays four columns: UI, Resources, Microservices and Backends.
Each of these columns show nodes and links between them.
The information for these links come from Spring Boot Actuator health and mappings endpoints, pact consumer-driven-contract-tests and hypermedia indexes, which are aggregated in the [microservices-dashboard-server](https://github.com/ordina-jworks/microservices-dashboard-server) project.

## Reference documentation

To learn everything there is to know about the Microservices Dashboard, please consult the [reference documentation](http://ordina-jworks.github.io/microservices-dashboard/1.0.0).

## Screenshots

<img width="1440" alt="screen shot 2016-07-27 at 09 26 14" src="https://cloud.githubusercontent.com/assets/6663110/17167270/8af65fac-53dc-11e6-999d-e298b4a6d84f.png">

<img width="1440" alt="screen shot 2016-07-27 at 09 26 26" src="https://cloud.githubusercontent.com/assets/6663110/17167273/8aff9b62-53dc-11e6-9e12-f1301371815f.png">

<img width="1440" alt="screen shot 2016-07-27 at 09 26 41" src="https://cloud.githubusercontent.com/assets/6663110/17167271/8af7c1da-53dc-11e6-996b-0d4e15ab7236.png">

<img width="1440" alt="screen shot 2016-07-27 at 09 27 52" src="https://cloud.githubusercontent.com/assets/6663110/17167272/8af96094-53dc-11e6-9503-06a984519f13.png">

<img width="1440" alt="screen shot 2016-07-27 at 09 29 51" src="https://cloud.githubusercontent.com/assets/6663110/17167310/b88e08c0-53dc-11e6-9f82-76a986e88862.png">

## Setting up the dashboard

There are two ways of getting up and running with the microservices-dashboard.
Either by running a sample, or by creating your own instance of the dashboard.

The microservices-dashboard consists of two components: the UI and the server.
This repository contains the UI while the server is located under the [microservices-dashboard-server](https://github.com/ordina-jworks/microservices-dashboard-server) repository.
These two components can either be packaged and deployed together as a single Spring Boot application (as explained in the [microservices-dashboard-server README](https://github.com/ordina-jworks/microservices-dashboard-server#using-a-vanilla-spring-boot-application)), or separately as a NodeJS application and a Spring Boot application.
In case of the former, the UI is served from the embedded Tomcat inside the Spring Boot application.
In case of the latter, the UI is ran separately on a NodeJS server, while the Spring Boot application simply exposes the JSON API.

### Using a sample

The samples can be found in the [microservices-dashboard-server repository](https://github.com/ordina-jworks/microservices-dashboard-server/tree/master/samples).

### Using a vanilla Spring Boot application

First you need to setup a simple Spring Boot project (using [start.spring.io](http://start.spring.io) for example).
Microservices-dashboard-server requires Java 8 or later.

Add the microservices-dashboard-server as a dependency to your new Spring Boot's dependencies:

```xml
<dependency>
	<groupId>be.ordina</groupId>
	<artifactId>microservices-dashboard-server</artifactId>
	<version>x.y.z</version>
</dependency>
```

In case you use a `SNAPSHOT` version, add the JFrog OSS Artifactory repository:

```xml
<repositories>
	<repository>
		<id>oss-snapshots</id>
		<name>JFrog OSS Snapshots</name>
		<url>https://oss.jfrog.org/simple/oss-snapshot-local/</url>
		<snapshots>
			<enabled>true</enabled>
		</snapshots>
	</repository>
</repositories>
```

Pull in the Microservices Dashboard Server configuration via adding `@EnableMicroservicesDashboardServer` to your configuration:

```java
@SpringBootApplication
@EnableMicroservicesDashboardServer
public class MicroservicesDashboardServerApplication {
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
```

### Using a separate UI and server

You can run the UI separately as well by building and running the UI code on NodeJS.
Ideally the Spring Boot server shouldn't serve the UI in this case.

#### Excluding the UI from the Spring Boot application

```xml
<dependency>
	<groupId>be.ordina</groupId>
	<artifactId>microservices-dashboard-server</artifactId>
	<version>x.y.z</version>
	<exclusions>
	  <exclusion>
	    <artifactId>microservices-dashboard-ui</artifactId>
	    <groupId>be.ordina</groupId>
	   </exclusion>
	</exclusions>
</dependency>
```

#### Building and running the UI from source

First a basic build should be done:
```
npm install
```
Then bower dependencies should be installed:
```
bower install
```
Use gulp to serve the resources using the configuration file:
```
gulp serve
```
Building the application
```
gulp build
```
If you want to build the dashboard to be run another server
```
gulp build --standalone
```

You can configure the dashboard server by modifying the **baseUrl** in gulp/conf.js

Note:

The server needs to be started to get any data in the dashboard: [microservices-dashboard-server](https://github.com/ordina-jworks/microservices-dashboard-server)

## TODO

- Single run instances gulp build
- Cleanup gulp files
- Serve directly from src, not .tmp
- Remove unused tasks
- Add bump tasks

## Contributing

Contributors to this project agree to uphold its [code of conduct][1].

There are several ways in which you can contribute to microservices-dashboard:

 - Open a [pull request][2]. Please see the [contributor guidelines][3] for details.
 - Chat with fellow users [on Gitter][4].

## Licence

Microservices Dashboard is open source software released under the [Apache 2.0 license][5].

[license]:LICENSE-2.0.txt
[license img]:https://img.shields.io/badge/License-Apache%202-blue.svg
[1]: CODE_OF_CONDUCT.md
[2]: https://help.github.com/articles/using-pull-requests/
[3]: CONTRIBUTING.md
[4]: https://gitter.im/ordina-jworks/microservices-dashboard
[5]: http://www.apache.org/licenses/LICENSE-2.0.html
