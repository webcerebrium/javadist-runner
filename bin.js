#!/usr/bin/env node

const fs = require('fs');
const parseArgs = require('minimist');
const shell = require('shelljs');
const PropertiesReader = require('properties-reader');

const err = (e) => {
  console.log(e);
  process.exit(1);
};
const done = (data) => {
  if (typeof data === 'string') console.log(data);
  process.exit(0);
};

// const isWin = /^win/.test(process.platform);
const downloadFile = (source) => {
  const parts = source.split('/');
  const destination = parts[parts.length - 1].replace(/\.zip$/, '');
  console.log(shell.exec('rm -rf ' + destination + '.zip ' + destination).stdout);
  const cmd = 'wget --check-certificate=off -q ' + source + ' -O ' + destination + '.zip';
  console.log(shell.exec(cmd).stdout);  
  return destination;
};

const unpackFile = (filepath) => {
  const cmd = 'unzip -qo ' + filepath;
  console.log(shell.exec(cmd).stdout);  
  console.log(shell.exec('rm -f ' + filepath).stdout);   // remove original zip file
};

const getShellFile = (packageName) => {
  const cmd = "cd " + packageName + "/bin && grep -rnw . -e 'env sh'";
  const file = shell.exec(cmd).stdout.trim();
  const indexColon = file.indexOf(':');
  return (indexColon === -1 ? file : file.substring(0, indexColon)).replace(/^\.\//, '');
};

const updateShellFile = (filePath) => {
   if (fs.existsSync('./.javadist')) {
     const properties = PropertiesReader('./.javadist');
     if (properties.path().DEFAULT_JVM_OPTS) {
       let replacement = "DEFAULT_JVM_OPTS='";
       Object.keys(properties.path().DEFAULT_JVM_OPTS).forEach(key => {
         const val = properties.path().DEFAULT_JVM_OPTS[key];
         console.log(key, ':', val); 
	 replacement += '"-D' + key + '=' + val + '" ';
       });
       replacement += "'";
       console.log('Replacement ', replacement);

       const escaped = replacement.replace(/\"/g, "\\\"");
       const cmd = 'sed -i "s#^DEFAULT_JVM_OPTS.*#' + escaped + '#" ' + filePath;
       console.log(cmd);
       console.log(shell.exec(cmd).stdout);
     }
   }
};

const killRunningProceses = (shellFile) => {
  const cmd = "ps -ax | grep 'java ' | grep " + shellFile + " | grep -v grep | awk -e '{print $1}' | xargs kill -9";
  console.log(shell.exec(cmd).stdout);    
};

const launchProcess = (packageName, shellFile) => {
  const logFile = shellFile + '.log';
  shell.exec("mkdir -p /var/log/jvm"); // ensure we have folder for logs
  const cmd = 'cd ' + packageName + '/bin && nohup ./' + shellFile + ' > /var/log/jvm/' + logFile + ' 2>&1 &';
  console.log(shell.exec(cmd).stdout);    
};

if (process.mainModule && process.mainModule.filename === __filename) {
   const args = parseArgs(process.argv, { '--': true });
   const url = args._[2];
   if (url) {
     // check URL to end up with .zip
     
     const packageName = downloadFile(url);	
     console.log('Downloaded ' + packageName);
     unpackFile(packageName + '.zip');

     console.log('Unpacked ' + packageName);
     const shellFile = getShellFile(packageName);

     console.log('Shell File ' + shellFile);
     updateShellFile(packageName + "/bin/" + shellFile);

     console.log('Removing Running ' + shellFile);
     killRunningProceses(shellFile);

     console.log('Launching ' + shellFile);
     launchProcess(packageName, shellFile);

   } else {
      err( [ "USAGE: javadist-runner <zip-url>" ].join('\n'));
   }

} else {
  err( [ "ERROR: javadist-runner -- not in main module" ].join('\n'));
}


