const fsModule = require('fs');
const pathModule = require('path');

const UK_UNIVERSITIES_FILE = pathModule.join(__dirname, 'UK-universities.ts');

async function addUKRegionAndCountry() {
  console.log('🔧 Adding region and country data to UK universities...');
  
  try {
    // Read the file
    const fileContent = fsModule.readFileSync(UK_UNIVERSITIES_FILE, 'utf8');
    
    // Find all university entries that don't have region and country
    // Pattern: { name: "...", domain: "...", isVerified: ... } (missing region/country)
    const pattern = /(\s*{\s*name:\s*"[^"]+",\s*domain:\s*(?:null|"[^"]+"),\s*isVerified:\s*(?:true|false)\s*})/g;
    
    let updatedContent = fileContent;
    let match;
    let count = 0;
    
    while ((match = pattern.exec(fileContent)) !== null) {
      const originalEntry = match[1];
      const indent = originalEntry.match(/^(\s*)/)?.[1] || '';
      
      // Add region and country before isVerified
      const updatedEntry = originalEntry.replace(
        /(isVerified:\s*(?:true|false)\s*})/,
        `region: "Europe", country: "United Kingdom", $1`
      );
      
      updatedContent = updatedContent.replace(originalEntry, updatedEntry);
      count++;
    }
    
    // Write the updated content back to the file
    fsModule.writeFileSync(UK_UNIVERSITIES_FILE, updatedContent, 'utf8');
    
    console.log(`✅ Successfully updated ${count} university entries with region and country data`);
    console.log('📝 All UK universities now have: region: "Europe", country: "United Kingdom"');
    
  } catch (error) {
    console.error('❌ Error updating university data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  addUKRegionAndCountry()
    .then(() => {
      console.log('✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = addUKRegionAndCountry; 