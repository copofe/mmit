export default function help() {
  console.log(`
  Usage:
    mmit [command] [options]

    Commands:
      <dir>                     Generate files from templates/<dir>
        Options:
          -o                    Output directory
          -r                    Rename files

    Options:
      -h, --help                Show help
      -v, --version             Show version
  `);
}