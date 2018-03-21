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
      const { name, directory } = result;
      stdout.write(`Created ${name} at ${directory}.`);
    };

    yargsProvider.command({
      command: 'client',
      builder: yargs => {
        yargs
          .command({
            command: 'list [...args]',
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