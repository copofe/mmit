import minimist from 'minimist';
import help from './commands/help';
import generate from './commands/generate';
import { version } from './commands/version';

const argv = minimist<ARGV>(process.argv.slice(2), { string: ['_'] });

async function init(argv: ARGV) {
  generate(argv).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

if (argv.v || argv.version) {
  version();
} else if (argv.h || argv.help) {
  help();
} else {
  init(argv); 
}
