/*import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import colors from 'picocolors';
import pkg from '../../../package.json';

async function generateIcon() {
  const dir = path.resolve(process.cwd(), 'node_modules/@iconify/json');

  const raw = await fs.readJSON(path.join(dir, 'collections.json'));

  const collections = Object.entries(raw).map(([id, v]) => ({
    ...(v as any),
    id,
  }));

  const choices = collections.map((item) => ({ key: item.id, value: item.id, name: item.name }));

  inquirer
    .prompt([
      {
        type: 'list',
        name: 'useType',
        choices: [
          { key: 'local', value: 'local', name: 'Local' },
          { key: 'onLine', value: 'onLine', name: 'OnLine' },
        ],
        message: 'How to use icons?',
      },
      {
        type: 'list',
        name: 'iconSet',
        choices: choices,
        message: 'Select the icon set that needs to be generated?',
      },
      {
        type: 'input',
        name: 'output',
        message: 'Select the icon set that needs to be generated?',
        default: 'src/components/Icon/data',
      },
    ])
    .then(async (answers) => {
      const { iconSet, output, useType } = answers;
      const outputDir = path.resolve(process.cwd(), output);
      fs.ensureDir(outputDir);
      const genCollections = collections.filter((item) => [iconSet].includes(item.id));
      const prefixSet: string[] = [];
      for (const info of genCollections) {
        const data = await fs.readJSON(path.join(dir, 'json', `${info.id}.json`));
        if (data) {
          const { prefix } = data;
          const isLocal = useType === 'local';
          const icons = Object.keys(data.icons).map(
            (item) => `${isLocal ? prefix + ':' : ''}${item}`,
          );

          await fs.writeFileSync(
            path.join(output, `icons.data.ts`),
            `export default ${isLocal ? JSON.stringify(icons) : JSON.stringify({ prefix, icons })}`,
          );
          prefixSet.push(prefix);
        }
      }
      fs.emptyDir(path.join(process.cwd(), 'node_modules/.vite'));
      console.log(
        `✨ ${colors.cyan(`[${pkg.name}]`)}` + ' - Icon generated successfully:' + `[${prefixSet}]`,
      );
    });
}

generateIcon();*/


import path from 'path';
import fs from 'fs-extra';
import colors from 'picocolors';
import pkg from '../../../package.json';

async function generateIcon() {
  const dir = path.resolve(process.cwd(), 'node_modules/@iconify/json');

  const raw = await fs.readJSON(path.join(dir, 'collections.json'));
  const collections = Object.entries(raw).map(([id, v]) => ({
    ...(v as any),
    id,
  }));

  // 固定配置 - 在 GitHub Actions 中自动运行
  const iconSets = ['ant-design']; // 只需要 ant-design
  const output = 'src/components/Icon/data';

  console.log(`🎯 Generating icons for: ${iconSets.join(', ')}`);

  const outputDir = path.resolve(process.cwd(), output);
  fs.ensureDir(outputDir);
  
  const genCollections = collections.filter((item) => iconSets.includes(item.id));
  
  if (genCollections.length === 0) {
    console.error(`❌ No matching icon sets found for: ${iconSets.join(', ')}`);
    process.exit(1);
  }
  
  const prefixSet: string[] = [];
  
  // 生成预加载脚本
  let preloadCode = `// Auto-generated icon preload file
import { addCollection } from '@iconify/iconify';\n\n`;

  for (const info of genCollections) {
    const data = await fs.readJSON(path.join(dir, 'json', `${info.id}.json`));
    if (data) {
      const { prefix } = data;
      
      preloadCode += `// ${info.name}\n`;
      preloadCode += `addCollection(${JSON.stringify(data)});\n\n`;
      prefixSet.push(prefix);
    }
  }
  
  // 生成预加载文件
  await fs.writeFileSync(
    path.join(outputDir, `icon-preload.ts`),
    preloadCode
  );
  
  // 生成图标列表文件（供 IconPicker 使用）
  const iconList = [];
  for (const info of genCollections) {
    const data = await fs.readJSON(path.join(dir, 'json', `${info.id}.json`));
    if (data) {
      const { prefix } = data;
      const icons = Object.keys(data.icons).map(item => `${prefix}:${item}`);
      iconList.push(...icons);
    }
  }
  
  await fs.writeFileSync(
    path.join(outputDir, `icons.data.ts`),
    `export default ${JSON.stringify(iconList)};`
  );
  
  fs.emptyDir(path.join(process.cwd(), 'node_modules/.vite'));
  console.log(
    `✨ ${colors.cyan(`[${pkg.name}]`)}` + ' - Icons generated successfully:' + `[${prefixSet.join(', ')}]`,
  );
}

generateIcon().catch(console.error);

