const fsUtil = require('fs');
const pathUtil = require('path');

function fixRegionCountryFormat(filePath: string) {
  try {
    const content = fsUtil.readFileSync(filePath, 'utf8');
    
    // Check if the file has the incorrect format (region/country outside brackets)
    if (content.includes('}, region:') || content.includes('}, country:')) {
      console.log(`🔧 Fixing format in: ${pathUtil.basename(filePath)}`);
      
      // Fix the format by moving region and country inside the brackets
      const fixedContent = content.replace(
        /(\{\s*name:\s*"([^"]+)",\s*domain:\s*(null|"[^"]*"),\s*isVerified:\s*(true|false)\s*\}),\s*region:\s*"([^"]+)",\s*country:\s*"([^"]+)"/g,
        '{ name: "$2", domain: $3, region: "$5", country: "$6", isVerified: $4 }'
      );
      
      fsUtil.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${pathUtil.basename(filePath)}`);
      return true;
    } else {
      console.log(`✅ Already correct format: ${pathUtil.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

function processAllCountryFiles() {
  const directoryPath = 'scripts/universities_by_country';
  const files = fsUtil.readdirSync(directoryPath);
  
  console.log('🔧 Fixing region/country format in all university files...\n');
  
  let fixedCount = 0;
  let alreadyCorrectCount = 0;
  
  for (const file of files) {
    if (file.endsWith('-universities.ts')) {
      const filePath = pathUtil.join(directoryPath, file);
      const wasFixed = fixRegionCountryFormat(filePath);
      
      if (wasFixed) {
        fixedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Fixed: ${fixedCount} files`);
  console.log(`   Already correct: ${alreadyCorrectCount} files`);
  console.log(`   Total: ${fixedCount + alreadyCorrectCount} files`);
}

// Run the script
if (require.main === module) {
  processAllCountryFiles();
}

module.exports = { fixRegionCountryFormat, processAllCountryFiles }; 