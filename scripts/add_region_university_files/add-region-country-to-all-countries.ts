const fsAddRegion = require('fs');
const pathAddRegion = require('path');

// Define regions for each country
const countryRegionMap: { [key: string]: { region: string; country: string } } = {
  // North America
  'US': { region: 'North America', country: 'United States' },
  'Canada': { region: 'North America', country: 'Canada' },
  'Mexico': { region: 'North America', country: 'Mexico' },
  'Cuba': { region: 'North America', country: 'Cuba' },
  'Jamaica': { region: 'North America', country: 'Jamaica' },
  'Haiti': { region: 'North America', country: 'Haiti' },
  'Dominican-Republic': { region: 'North America', country: 'Dominican Republic' },
  'Puerto-Rico': { region: 'North America', country: 'Puerto Rico' },
  'Trinidad-and-Tobago': { region: 'North America', country: 'Trinidad and Tobago' },
  'Barbados': { region: 'North America', country: 'Barbados' },
  'Bahamas': { region: 'North America', country: 'Bahamas' },
  'Grenada': { region: 'North America', country: 'Grenada' },
  'Saint-Kitts-and-Nevis': { region: 'North America', country: 'Saint Kitts and Nevis' },
  'Dominica': { region: 'North America', country: 'Dominica' },
  'Antigua-and-Barbuda': { region: 'North America', country: 'Antigua and Barbuda' },
  'Saint-Lucia': { region: 'North America', country: 'Saint Lucia' },
  'Saint-Vincent-and-the-Grenadines': { region: 'North America', country: 'Saint Vincent and the Grenadines' },
  'Belize': { region: 'North America', country: 'Belize' },
  'Guatemala': { region: 'North America', country: 'Guatemala' },
  'Honduras': { region: 'North America', country: 'Honduras' },
  'El-Salvador': { region: 'North America', country: 'El Salvador' },
  'Nicaragua': { region: 'North America', country: 'Nicaragua' },
  'Costa-Rica': { region: 'North America', country: 'Costa Rica' },
  'Panama': { region: 'North America', country: 'Panama' },
  'Colombia': { region: 'South America', country: 'Colombia' },
  'Venezuela': { region: 'South America', country: 'Venezuela' },
  'Guyana': { region: 'South America', country: 'Guyana' },
  'Suriname': { region: 'South America', country: 'Suriname' },
  'French-Guiana': { region: 'South America', country: 'French Guiana' },
  'Brazil': { region: 'South America', country: 'Brazil' },
  'Ecuador': { region: 'South America', country: 'Ecuador' },
  'Peru': { region: 'South America', country: 'Peru' },
  'Bolivia': { region: 'South America', country: 'Bolivia' },
  'Paraguay': { region: 'South America', country: 'Paraguay' },
  'Uruguay': { region: 'South America', country: 'Uruguay' },
  'Argentina': { region: 'South America', country: 'Argentina' },
  'Chile': { region: 'South America', country: 'Chile' },
  'Falkland-Islands': { region: 'South America', country: 'Falkland Islands' },
  'Aruba': { region: 'North America', country: 'Aruba' },
  'Curacao': { region: 'North America', country: 'Curacao' },
  'Caymanian-Islands': { region: 'North America', country: 'Cayman Islands' },
  'Anguilla': { region: 'North America', country: 'Anguilla' },
  'Guadeloupe': { region: 'North America', country: 'Guadeloupe' },

  // Europe
  'UK': { region: 'Europe', country: 'United Kingdom' },
  'Ireland': { region: 'Europe', country: 'Ireland' },
  'France': { region: 'Europe', country: 'France' },
  'Germany': { region: 'Europe', country: 'Germany' },
  'Italy': { region: 'Europe', country: 'Italy' },
  'Spain': { region: 'Europe', country: 'Spain' },
  'Portugal': { region: 'Europe', country: 'Portugal' },
  'Netherlands': { region: 'Europe', country: 'Netherlands' },
  'Belgium': { region: 'Europe', country: 'Belgium' },
  'Switzerland': { region: 'Europe', country: 'Switzerland' },
  'Austria': { region: 'Europe', country: 'Austria' },
  'Sweden': { region: 'Europe', country: 'Sweden' },
  'Norway': { region: 'Europe', country: 'Norway' },
  'Denmark': { region: 'Europe', country: 'Denmark' },
  'Finland': { region: 'Europe', country: 'Finland' },
  'Iceland': { region: 'Europe', country: 'Iceland' },
  'Poland': { region: 'Europe', country: 'Poland' },
  'Czech-Republic': { region: 'Europe', country: 'Czech Republic' },
  'Slovakia': { region: 'Europe', country: 'Slovakia' },
  'Hungary': { region: 'Europe', country: 'Hungary' },
  'Romania': { region: 'Europe', country: 'Romania' },
  'Bulgaria': { region: 'Europe', country: 'Bulgaria' },
  'Greece': { region: 'Europe', country: 'Greece' },
  'Cyprus': { region: 'Europe', country: 'Cyprus' },
  'Cyrus': { region: 'Europe', country: 'Cyprus' },
  'Malta': { region: 'Europe', country: 'Malta' },
  'Croatia': { region: 'Europe', country: 'Croatia' },
  'Slovenia': { region: 'Europe', country: 'Slovenia' },
  'Serbia': { region: 'Europe', country: 'Serbia' },
  'Montenegro': { region: 'Europe', country: 'Montenegro' },
  'North-Macedonia': { region: 'Europe', country: 'North Macedonia' },
  'Albania': { region: 'Europe', country: 'Albania' },
  'Bosnia-and-Herzegovina': { region: 'Europe', country: 'Bosnia and Herzegovina' },
  'Bosnia-Hersegovina': { region: 'Europe', country: 'Bosnia and Herzegovina' },
  'Kosovo': { region: 'Europe', country: 'Kosovo' },
  'Latvia': { region: 'Europe', country: 'Latvia' },
  'Lithuania': { region: 'Europe', country: 'Lithuania' },
  'Estonia': { region: 'Europe', country: 'Estonia' },
  'Luxembourg': { region: 'Europe', country: 'Luxembourg' },
  'Liechtenshtein': { region: 'Europe', country: 'Liechtenstein' },
  'Monaco': { region: 'Europe', country: 'Monaco' },
  'San-Marino': { region: 'Europe', country: 'San Marino' },
  'Vatican-City': { region: 'Europe', country: 'Vatican City' },
  'Andorra': { region: 'Europe', country: 'Andorra' },
  'Ukraine': { region: 'Europe', country: 'Ukraine' },
  'Belarus': { region: 'Europe', country: 'Belarus' },
  'Moldova': { region: 'Europe', country: 'Moldova' },
  'Russia': { region: 'Europe', country: 'Russia' },
  'Georgia': { region: 'Europe', country: 'Georgia' },
  'Armenia': { region: 'Europe', country: 'Armenia' },
  'Azerbaijan': { region: 'Europe', country: 'Azerbaijan' },

  // Asia
  'China': { region: 'Asia', country: 'China' },
  'Japan': { region: 'Asia', country: 'Japan' },
  'South-Korea': { region: 'Asia', country: 'South Korea' },
  'North-Korea': { region: 'Asia', country: 'North Korea' },
  'Taiwan': { region: 'Asia', country: 'Taiwan' },
  'Hong-Kong': { region: 'Asia', country: 'Hong Kong' },
  'Macau': { region: 'Asia', country: 'Macau' },
  'Mongolia': { region: 'Asia', country: 'Mongolia' },
  'Vietnum': { region: 'Asia', country: 'Vietnam' },
  'Laos': { region: 'Asia', country: 'Laos' },
  'Cambodia': { region: 'Asia', country: 'Cambodia' },
  'Thailand': { region: 'Asia', country: 'Thailand' },
  'Myanmar': { region: 'Asia', country: 'Myanmar' },
  'Malaysia': { region: 'Asia', country: 'Malaysia' },
  'Singapore': { region: 'Asia', country: 'Singapore' },
  'Indonesia': { region: 'Asia', country: 'Indonesia' },
  'Phillippines': { region: 'Asia', country: 'Philippines' },
  'Brunei': { region: 'Asia', country: 'Brunei' },
  'East-Timor': { region: 'Asia', country: 'East Timor' },
  'India': { region: 'Asia', country: 'India' },
  'Pakistan': { region: 'Asia', country: 'Pakistan' },
  'Bangladesh': { region: 'Asia', country: 'Bangladesh' },
  'Sri-Lanka': { region: 'Asia', country: 'Sri Lanka' },
  'Nepal': { region: 'Asia', country: 'Nepal' },
  'Bhutan': { region: 'Asia', country: 'Bhutan' },
  'Maldives': { region: 'Asia', country: 'Maldives' },
  'Afghanistan': { region: 'Asia', country: 'Afghanistan' },
  'Iran': { region: 'Asia', country: 'Iran' },
  'Iraq': { region: 'Asia', country: 'Iraq' },
  'Kuwait': { region: 'Asia', country: 'Kuwait' },
  'Saudi-Arabia': { region: 'Asia', country: 'Saudi Arabia' },
  'Yemen': { region: 'Asia', country: 'Yemen' },
  'Oman': { region: 'Asia', country: 'Oman' },
  'United-Arab-Emirates': { region: 'Asia', country: 'United Arab Emirates' },
  'Qatar': { region: 'Asia', country: 'Qatar' },
  'Bahrain': { region: 'Asia', country: 'Bahrain' },
  'Israel': { region: 'Asia', country: 'Israel' },
  'Palestine': { region: 'Asia', country: 'Palestine' },
  'Jordan': { region: 'Asia', country: 'Jordan' },
  'Lebanon': { region: 'Asia', country: 'Lebanon' },
  'Syria': { region: 'Asia', country: 'Syria' },
  'Turkey': { region: 'Asia', country: 'Turkey' },
  'Kazakhstan': { region: 'Asia', country: 'Kazakhstan' },
  'Uzbekistan': { region: 'Asia', country: 'Uzbekistan' },
  'Turkmenistan': { region: 'Asia', country: 'Turkmenistan' },
  'Tajikistan': { region: 'Asia', country: 'Tajikistan' },
  'Kyrgyzstan': { region: 'Asia', country: 'Kyrgyzstan' },

  // Africa
  'Egypt': { region: 'Africa', country: 'Egypt' },
  'Libya': { region: 'Africa', country: 'Libya' },
  'Tunisia': { region: 'Africa', country: 'Tunisia' },
  'Algeria': { region: 'Africa', country: 'Algeria' },
  'Morocco': { region: 'Africa', country: 'Morocco' },
  'Western-Sahara': { region: 'Africa', country: 'Western Sahara' },
  'Mauritania': { region: 'Africa', country: 'Mauritania' },
  'Senegal': { region: 'Africa', country: 'Senegal' },
  'Gambia': { region: 'Africa', country: 'Gambia' },
  'Guinea-Bissau': { region: 'Africa', country: 'Guinea-Bissau' },
  'Guinea': { region: 'Africa', country: 'Guinea' },
  'Sierra-Leone': { region: 'Africa', country: 'Sierra Leone' },
  'Liberia': { region: 'Africa', country: 'Liberia' },
  'Ivory-Coast': { region: 'Africa', country: 'Ivory Coast' },
  'Ghana': { region: 'Africa', country: 'Ghana' },
  'Togo': { region: 'Africa', country: 'Togo' },
  'Benin': { region: 'Africa', country: 'Benin' },
  'Burkina-Faso': { region: 'Africa', country: 'Burkina Faso' },
  'Niger': { region: 'Africa', country: 'Niger' },
  'Nigeria': { region: 'Africa', country: 'Nigeria' },
  'Chad': { region: 'Africa', country: 'Chad' },
  'Cameroon': { region: 'Africa', country: 'Cameroon' },
  'Central-African-Republic': { region: 'Africa', country: 'Central African Republic' },
  'Equatorial-Guinea': { region: 'Africa', country: 'Equatorial Guinea' },
  'Gabon': { region: 'Africa', country: 'Gabon' },
  'Republic-Of-Congo': { region: 'Africa', country: 'Republic of Congo' },
  'DRC': { region: 'Africa', country: 'Democratic Republic of Congo' },
  'Angola': { region: 'Africa', country: 'Angola' },
  'Zambia': { region: 'Africa', country: 'Zambia' },
  'Malawi': { region: 'Africa', country: 'Malawi' },
  'Mozambique': { region: 'Africa', country: 'Mozambique' },
  'Zimbabwe': { region: 'Africa', country: 'Zimbabwe' },
  'Botswana': { region: 'Africa', country: 'Botswana' },
  'Namibia': { region: 'Africa', country: 'Namibia' },
  'South-Africa': { region: 'Africa', country: 'South Africa' },
  'Lesotho': { region: 'Africa', country: 'Lesotho' },
  'Eswatini': { region: 'Africa', country: 'Eswatini' },
  'Madagascar': { region: 'Africa', country: 'Madagascar' },
  'Mali': { region: 'Africa', country: 'Mali' },
  'Mauritius': { region: 'Africa', country: 'Mauritius' },
  'Seychelle': { region: 'Africa', country: 'Seychelles' },
  'Comoros': { region: 'Africa', country: 'Comoros' },
  'Mayotte': { region: 'Africa', country: 'Mayotte' },
  'Reunion': { region: 'Africa', country: 'Reunion' },
  'Sudan': { region: 'Africa', country: 'Sudan' },
  'South-Sudan': { region: 'Africa', country: 'South Sudan' },
  'Ethiopia': { region: 'Africa', country: 'Ethiopia' },
  'Eritrea': { region: 'Africa', country: 'Eritrea' },
  'Djibouti': { region: 'Africa', country: 'Djibouti' },
  'Somalia': { region: 'Africa', country: 'Somalia' },
  'Kenya': { region: 'Africa', country: 'Kenya' },
  'Uganda': { region: 'Africa', country: 'Uganda' },
  'Rwanda': { region: 'Africa', country: 'Rwanda' },
  'Burundi': { region: 'Africa', country: 'Burundi' },
  'Tanzania': { region: 'Africa', country: 'Tanzania' },
  'Cape-Verde': { region: 'Africa', country: 'Cape Verde' },

  // Oceania
  'Australia': { region: 'Oceania', country: 'Australia' },
  'New-Zealand': { region: 'Oceania', country: 'New Zealand' },
  'Papua-and-New-Guinea': { region: 'Oceania', country: 'Papua New Guinea' },
  'Fiji': { region: 'Oceania', country: 'Fiji' },
  'Solomon-Islands': { region: 'Oceania', country: 'Solomon Islands' },
  'Vanuatu': { region: 'Oceania', country: 'Vanuatu' },
  'New-Caledonia': { region: 'Oceania', country: 'New Caledonia' },
  'Samoa': { region: 'Oceania', country: 'Samoa' },
  'Tonga': { region: 'Oceania', country: 'Tonga' },
  'Kiribati': { region: 'Oceania', country: 'Kiribati' },
  'Tuvalu': { region: 'Oceania', country: 'Tuvalu' },
  'Nauru': { region: 'Oceania', country: 'Nauru' },
  'Palau': { region: 'Oceania', country: 'Palau' },
  'Micronesia': { region: 'Oceania', country: 'Micronesia' },
  'Marshall-Islands': { region: 'Oceania', country: 'Marshall Islands' },
  'French-Polynesia': { region: 'Oceania', country: 'French Polynesia' },
  'Cook-Islands': { region: 'Oceania', country: 'Cook Islands' },
  'Niue': { region: 'Oceania', country: 'Niue' },
  'Tokelau': { region: 'Oceania', country: 'Tokelau' },
  'Wallis-and-Futuna': { region: 'Oceania', country: 'Wallis and Futuna' },
  'Pitcairn': { region: 'Oceania', country: 'Pitcairn' },
  'Easter-Island': { region: 'Oceania', country: 'Easter Island' },
  'Guam': { region: 'Oceania', country: 'Guam' },
  'Northern-Mariana-Islands': { region: 'Oceania', country: 'Northern Mariana Islands' },
  'American-Samoa': { region: 'Oceania', country: 'American Samoa' },
  'Hawaii': { region: 'Oceania', country: 'Hawaii' }
};

function addRegionAndCountryToFile(filePath: string) {
  try {
    const content = fsAddRegion.readFileSync(filePath, 'utf8');
    const fileName = pathAddRegion.basename(filePath, '.ts');
    const countryKey = fileName.replace('-universities', '');
    
    const regionInfo = countryRegionMap[countryKey];
    if (!regionInfo) {
      console.log(`⚠️  No region mapping found for: ${countryKey}`);
      return;
    }

    // Check if region and country already exist
    if (content.includes('region:') && content.includes('country:')) {
      console.log(`✅ Already has region/country: ${countryKey}`);
      return;
    }

    // Add region and country to university objects
    const updatedContent = content.replace(
      /(\{\s*name:\s*"([^"]+)",\s*domain:\s*(null|"[^"]*"),\s*isVerified:\s*(true|false)\s*\})/g,
      `{ name: "$2", domain: $3, region: "${regionInfo.region}", country: "${regionInfo.country}", isVerified: $4 }`
    );

    fsAddRegion.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated: ${countryKey} (${regionInfo.region} - ${regionInfo.country})`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function processAllCountryFiles() {
  const directoryPath = 'scripts/universities_by_country';
  const files = fsAddRegion.readdirSync(directoryPath);
  
  console.log('🌍 Adding region and country to all university files...\n');
  
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    if (file.endsWith('-universities.ts')) {
      const filePath = pathAddRegion.join(directoryPath, file);
      const fileName = pathAddRegion.basename(file, '.ts');
      const countryKey = fileName.replace('-universities', '');
      
      if (countryRegionMap[countryKey]) {
        addRegionAndCountryToFile(filePath);
        processedCount++;
      } else {
        console.log(`⚠️  No mapping for: ${countryKey}`);
        skippedCount++;
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Skipped: ${skippedCount} files`);
  console.log(`   Total: ${processedCount + skippedCount} files`);
}

// Run the script
if (require.main === module) {
  processAllCountryFiles();
}

module.exports = { addRegionAndCountryToFile, processAllCountryFiles }; 