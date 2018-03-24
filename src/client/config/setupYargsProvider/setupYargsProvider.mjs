import leftPad from 'left-pad';

export default ['yargsProvider', yargsProvider => {
  yargsProvider.configure(['process', process => {

    const { stdout } = process;
    const printClientList = clientNames => {
      const createLine = (count, name) => `${leftPad(count, 5)} | ${name}`;
      const header = createLine('Count', 'Name');
      const body = clientNames.map((name, index) => createLine(index + 1, name));
      stdout.write(header + '\n');
      body.forEach(line => stdout.write(line + '\n'));
    };


    const printClientDetails = (result) => {
      const { name } = result;
      stdout.write(`Created ${name}.`);
    };

    const printBuildResult = (result) => {
      const { buildDirectory, buildAt } = result;
      stdout.write(`Build succeeded. Output was written to: ${buildDirectory} and took ${buildAt}.`);
    };

    const printStatusResult = (result) => {
      const { date, hash, version, buildAt } = result;
      if(!buildAt) {
        stdout.write('None builds found.');
        return;
      }
      stdout.write(`Date:\t\t${date}.\n`);
      stdout.write(`Hash:\t\t${hash}.\n`);
      stdout.write(`Build time:\t${buildAt}.\n`);
    };

    yargsProvider.command({
      command: 'client',
      builder: yargs => {
        yargs
          .command({
            command: 'status [...args]',
            handler: ['$$argv', '$invoke', ($$argv, $invoke) => {
              return $invoke(['client/status',  getClientStatus => getClientStatus($$argv)])
                .then(printStatusResult);
            }]
          })
          .command({
            command: 'build [...args]',
            handler: ['$$argv', '$invoke', ($$argv, $invoke) => {
              return $invoke(['client/build',  buildClient => buildClient($$argv)])
                .then(printBuildResult);
            }]
          })
          .command({
            command: 'list',
            handler: ['$$argv', '$invoke', ($$argv, $invoke) => {
              return $invoke(['client/list',  getClientList => getClientList($$argv)])
                .then(printClientList);
            }]
          })
          .command({
            command: 'create [...args]',
            handler: ['$$argv', '$invoke', ($$argv, $invoke) => {
              return $invoke(['client/create',  createClient => createClient($$argv.name)])
                .then(printClientDetails);
            }]
          });
      }
    });

  }]);

}];