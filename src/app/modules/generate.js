/* eslint-disable @typescript-eslint/no-require-imports */
 
 
const fs = require("fs");
const path = require("path");

const createFolderWithFiles = (folderName) => {
  const folderPath = path.join(__dirname, folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    const files = [
      `${folderName}.constant.ts`,
      `${folderName}.controller.ts`,
      `${folderName}.service.ts`,
      `${folderName}.interface.ts`,
      `${folderName}.model.ts`,
      `${folderName}.route.ts`,
      `${folderName}.validation.ts`,
    ];
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.writeFileSync(filePath, `// ${file} content`);
    });
    console.log(`Folder and files created successfully: ${folderPath}`);
  } else {
    console.log(`Folder already exists: ${folderPath}`);
  }
};

const folderName = process.argv[2] || "example";
createFolderWithFiles(folderName);