import fs from 'node:fs';
import path from 'node:path';
import prompts from 'prompts';
import {
  green,
  red,
  gray
} from 'kolorist';

type Result = prompts.Answers<'source' | 'output' | 'rename'> | undefined;

function findTemplatesDir(dir: string) {
  const pkgPath = path.join(dir, 'package.json');

  if (fs.existsSync(pkgPath)) {
    const templatePath = path.join(dir, 'templates');
    if (fs.existsSync(templatePath)) {
      return templatePath;
    } else {
      return null;
    }
  } else {
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      return null;
    }
    return findTemplatesDir(parentDir);
  }
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '');
}

async function generate(result: NonNullable<Result>, cwd: string) {
  const outputPath = path.join(cwd, result.output);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const files = fs.readdirSync(result.source);

  if (files.length === 0) {
    throw new Error(red(`✖ not found any file in ${result.source}.`));
  }

  const fileExists = await Promise.all(files.map(
    file => fs.existsSync(path.join(outputPath, result.rename ? result.rename + path.extname(file) : file))
  ));

  if (fileExists.includes(true)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'exists same name file, overwrite it?',
      initial: false
    });
    if (!overwrite) {
      console.log(gray('Cancelled.'));
      process.exit(0);
    }
  }

  for (const file of files) {
    const targetFile = path.join(result.source, file);
    const outputFile = path.join(outputPath, result.rename ? result.rename + path.extname(file) : file);
    const content = fs.readFileSync(targetFile, 'utf8');
    fs.writeFileSync(outputFile, content);
  }

  console.log(green('Done.'));
}

async function main(argv: ARGV) {
  const cwd = process.cwd();

  const templatesDir = findTemplatesDir(cwd);

  if (!templatesDir) {
    throw new Error(red(`✖ templates directory not found.`));
  }

  const argTargetDir = formatTargetDir(argv._[0]);
  const argOutput = argv.o;
  const argRename = argv.r;

  const promptsTask: prompts.PromptObject[] = [];
  const targetDirChoices: prompts.Choice[] = [];

  if (!argTargetDir) {
    const templateSubdirs = fs.readdirSync(templatesDir);
    if (templateSubdirs.length === 0) {
      throw new Error(red('✖ templates directory is empty.'));
    }
    for (const subdir of templateSubdirs) {
      const subdirPath = path.join(templatesDir, subdir);
      if (fs.statSync(subdirPath).isDirectory()) {
        targetDirChoices.push({
          title: subdir,
          value: subdirPath,
        });
      }
    }
  } else {
    const argTargetPath = path.join(templatesDir, argTargetDir);
    if (!fs.existsSync(argTargetPath)) {
      throw new Error(red(`✖ ${argTargetDir} directory not found.`));
    } else {
      prompts.override({
        source: argTargetDir,
      });
    }
  }

  promptsTask.push({
    type: argTargetDir ? false : 'select',
    name: 'source',
    message: 'Please select source directory:',
    choices: targetDirChoices,
  });

  promptsTask.push({
    type: argOutput ? false : 'text',
    name: 'output',
    message: 'Please input output directory:',
    initial: './'
  });

  promptsTask.push({
    type: argRename ? false : 'text',
    name: 'rename',
    message: 'Please input new file name:',
  });

  let result: Result = {
    source: argTargetDir ? path.join(templatesDir, argTargetDir) : undefined,
    output: argOutput,
    rename: argRename
  };
  const _result = await prompts(promptsTask, {
    onCancel: () => {
      throw new Error(gray('Cancelled.'));
    }
  });

  result = Object.assign(result, _result);
  await generate(result, cwd);
}

export default main;