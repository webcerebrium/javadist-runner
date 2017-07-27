# javadist-runner
Command-Line utility that downloads remote Java distribution zip (built with gradle distZip), and executes it.
Existing process with the same name is killed.

## Usage
Just a handy CLI tool that helps to automate deployment of your compiled Java applications.

## Installation
```
npm install -g javadist-runner
```
## .javadist file
You could place `.javadist` properties file in current folder to overload JVM system properties for the given environment before running app distribution.

Example:
```
[DEFAULT_JVM_OPTS]
HTTP_PORT=8066
SOME_URL_IN_PROPERTY=http://127.0.0.1:8080/api/auth/reload
```
will overload `DEFAULT_JVM_OPTS` that were specified in original `build.gradle` file.

## Disclaimer
1. This CLI tool is designed *only for Linux/Unix* systems, so most of operations will not work on Windows if you have no Cygwin tools.
2. Development is still in progress, please use at your own risk and feel free to leave your feedback in `Issues`.
