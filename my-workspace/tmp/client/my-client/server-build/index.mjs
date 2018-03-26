import Module from 'evoozer/Module';
import WebApplication from 'evoozer/Module/web-application';
import path from 'path';
import src from '../../../../client/my-client';
import fs from 'fs';

const app = new Module(null, [ WebApplication, src ])
  .config(['webApplicationProvider', webApplicationProvider => {
    console.log('CConfiguring webApplicationProvider');
    const port = (process.env.PORT || 8080)|0;
    const keyPath = null;
    const certPath = null;
    const key = keyPath ? fs.readFileSync(keyPath) : null;
    const cert = certPath ? fs.readFileSync(certPath) : null;
    console.log('webApplicationProvider port: ', port);
    webApplicationProvider
      .addPublicDirectory('build/my-client/')
.addPublicDirectory('../../../../client/my-client/public/')
      .addServer({ port, key, cert })
  }])
  .config(['routerProvider', routerProvider => {
    const script = [
     { src: 'undefined.js', async: true }
    ];
    const head = { script }; 
    routerProvider
      .when('/*', { head }); 
  }])
  .run(['webApplication', (webApplication) => {
    const onListening = servers => {
      console.log('Server listening on ', servers.map(({ host, port }) => host + ':' + port).join(', '));
      process.on('SIGTERM', () => {
        console.log('SIGTERM RECEIBVED!');
        const closeServer = server => new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
        const terminateProcess = (err) => {
          if(err) {
            console.error(err);
            return process.exit(1);
          }
          return process.exit(0);
        };
        return Promise.all(servers.map(closeServer))
          .then(terminateProcess.bind(null, null), terminateProcess)
      });
    };
    const onError = err => {
      console.error(err);
      process.exit(1)
    };
    return webApplication.start()
      .then(onListening)
      .then(null, onError);
  }]);

const instance = app.createInstance();

instance.initiate()
  .then(null, console.error.bind(console));