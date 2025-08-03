const fs = require('fs');
const path = require('path');

const US_UNIVERSITIES_FILE = path.join(__dirname, 'US-universities.ts');

async function addRegionAndCountry() {
  console.log('🔧 Adding region and country data to US universities...');
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(US_UNIVERSITIES_FILE, 'utf8');
    
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
        `region: "North America", country: "United States", $1`
      );
      
      updatedContent = updatedContent.replace(originalEntry, updatedEntry);
      count++;
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(US_UNIVERSITIES_FILE, updatedContent, 'utf8');
    
    console.log(`✅ Successfully updated ${count} university entries with region and country data`);
    console.log('📝 All US universities now have: region: "North America", country: "United States"');
    
  } catch (error) {
    console.error('❌ Error updating university data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  addRegionAndCountry()
    .then(() => {
      console.log('✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = addRegionAndCountry; 