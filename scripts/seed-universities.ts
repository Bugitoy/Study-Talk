import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const universities = [
  // United States
  { name: "Harvard University", domain: "harvard.edu", isVerified: true },
  { name: "Stanford University", domain: "stanford.edu", isVerified: true },
  { name: "Massachusetts Institute of Technology", domain: "mit.edu", isVerified: true },
  { name: "University of California, Berkeley", domain: "berkeley.edu", isVerified: true },
  { name: "Yale University", domain: "yale.edu", isVerified: true },
  { name: "Princeton University", domain: "princeton.edu", isVerified: true },
  { name: "Columbia University", domain: "columbia.edu", isVerified: true },
  { name: "University of Pennsylvania", domain: "upenn.edu", isVerified: true },
  { name: "University of Chicago", domain: "uchicago.edu", isVerified: true },
  { name: "Cornell University", domain: "cornell.edu", isVerified: true },
  { name: "New York University", domain: "nyu.edu", isVerified: true },
  { name: "University of Southern California", domain: "usc.edu", isVerified: true },
  { name: "Carnegie Mellon University", domain: "cmu.edu", isVerified: true },
  { name: "Northwestern University", domain: "northwestern.edu", isVerified: true },
  { name: "Duke University", domain: "duke.edu", isVerified: true },
  { name: "University of Cincinnati", domain: "uc.edu", isVerified: true },
  
  // United Kingdom
  { name: "University of Oxford", domain: "ox.ac.uk", isVerified: true },
  { name: "University of Cambridge", domain: "cam.ac.uk", isVerified: true },
  { name: "Imperial College London", domain: "imperial.ac.uk", isVerified: true },
  { name: "London School of Economics", domain: "lse.ac.uk", isVerified: true },
  { name: "University College London", domain: "ucl.ac.uk", isVerified: true },
  { name: "King's College London", domain: "kcl.ac.uk", isVerified: true },
  { name: "University of Edinburgh", domain: "ed.ac.uk", isVerified: true },
  { name: "University of Manchester", domain: "manchester.ac.uk", isVerified: true },
  { name: "University of Warwick", domain: "warwick.ac.uk", isVerified: true },
  { name: "University of Bristol", domain: "bristol.ac.uk", isVerified: true },
  
  // Canada
  { name: "University of Toronto", domain: "utoronto.ca", isVerified: true },
  { name: "McGill University", domain: "mcgill.ca", isVerified: true },
  { name: "University of British Columbia", domain: "ubc.ca", isVerified: true },
  { name: "University of Waterloo", domain: "uwaterloo.ca", isVerified: true },
  { name: "McMaster University", domain: "mcmaster.ca", isVerified: true },
  { name: "Queen's University", domain: "queensu.ca", isVerified: true },
  
  // Australia
  { name: "University of Melbourne", domain: "unimelb.edu.au", isVerified: true },
  { name: "Australian National University", domain: "anu.edu.au", isVerified: true },
  { name: "University of Sydney", domain: "sydney.edu.au", isVerified: true },
  { name: "University of New South Wales", domain: "unsw.edu.au", isVerified: true },
  { name: "Monash University", domain: "monash.edu", isVerified: true },
  
  // Germany
  { name: "Technical University of Munich", domain: "tum.de", isVerified: true },
  { name: "Ludwig Maximilian University of Munich", domain: "lmu.de", isVerified: true },
  { name: "Heidelberg University", domain: "uni-heidelberg.de", isVerified: true },
  { name: "Humboldt University of Berlin", domain: "hu-berlin.de", isVerified: true },
  { name: "University of Freiburg", domain: "uni-freiburg.de", isVerified: true },
  
  // France
  { name: "Sorbonne University", domain: "sorbonne-universite.fr", isVerified: true },
  { name: "École Normale Supérieure", domain: "ens.fr", isVerified: true },
  { name: "Sciences Po", domain: "sciencespo.fr", isVerified: true },
  { name: "University of Paris", domain: "u-paris.fr", isVerified: true },
  
  // Netherlands
  { name: "University of Amsterdam", domain: "uva.nl", isVerified: true },
  { name: "Delft University of Technology", domain: "tudelft.nl", isVerified: true },
  { name: "Leiden University", domain: "leidenuniv.nl", isVerified: true },
  { name: "Utrecht University", domain: "uu.nl", isVerified: true },
  
  // Singapore
  { name: "National University of Singapore", domain: "nus.edu.sg", isVerified: true },
  { name: "Nanyang Technological University", domain: "ntu.edu.sg", isVerified: true },
  
  // Japan
  { name: "University of Tokyo", domain: "u-tokyo.ac.jp", isVerified: true },
  { name: "Kyoto University", domain: "kyoto-u.ac.jp", isVerified: true },
  { name: "Osaka University", domain: "osaka-u.ac.jp", isVerified: true },
  
  // South Korea
  { name: "Seoul National University", domain: "snu.ac.kr", isVerified: true },
  { name: "Korea Advanced Institute of Science and Technology", domain: "kaist.ac.kr", isVerified: true },
  { name: "Yonsei University", domain: "yonsei.ac.kr", isVerified: true },
  
  // China
  { name: "Tsinghua University", domain: "tsinghua.edu.cn", isVerified: true },
  { name: "Peking University", domain: "pku.edu.cn", isVerified: true },
  { name: "Fudan University", domain: "fudan.edu.cn", isVerified: true },
  { name: "Shanghai Jiao Tong University", domain: "sjtu.edu.cn", isVerified: true },
  
  // India
  { name: "Indian Institute of Technology Bombay", domain: "iitb.ac.in", isVerified: true },
  { name: "Indian Institute of Technology Delhi", domain: "iitd.ac.in", isVerified: true },
  { name: "Indian Institute of Science", domain: "iisc.ac.in", isVerified: true },
  { name: "Indian Institute of Technology Madras", domain: "iitm.ac.in", isVerified: true },
  
  // Brazil
  { name: "University of São Paulo", domain: "usp.br", isVerified: true },
  { name: "State University of Campinas", domain: "unicamp.br", isVerified: true },
  { name: "Federal University of Rio de Janeiro", domain: "ufrj.br", isVerified: true },
  
  // South Africa
  { name: "University of Cape Town", domain: "uct.ac.za", isVerified: true },
  { name: "University of the Witwatersrand", domain: "wits.ac.za", isVerified: true },
  { name: "Stellenbosch University", domain: "sun.ac.za", isVerified: true },
  
  // Botswana
  { name: "University of Botswana", domain: "ub.ac.bw", isVerified: true },
  
  // Mexico
  { name: "National Autonomous University of Mexico", domain: "unam.mx", isVerified: true },
  { name: "Tecnológico de Monterrey", domain: "tec.mx", isVerified: true },
  
  // Sweden
  { name: "Karolinska Institute", domain: "ki.se", isVerified: true },
  { name: "KTH Royal Institute of Technology", domain: "kth.se", isVerified: true },
  { name: "Lund University", domain: "lu.se", isVerified: true },
  
  // Switzerland
  { name: "ETH Zurich", domain: "ethz.ch", isVerified: true },
  { name: "University of Zurich", domain: "uzh.ch", isVerified: true },
  { name: "École Polytechnique Fédérale de Lausanne", domain: "epfl.ch", isVerified: true },
  
  // Some community colleges and smaller institutions (unverified)
  { name: "Santa Monica College", domain: null, isVerified: false },
  { name: "Berkeley City College", domain: null, isVerified: false },
  { name: "Foothill College", domain: null, isVerified: false },
  { name: "De Anza College", domain: null, isVerified: false },
  { name: "Pasadena City College", domain: null, isVerified: false },
];

async function seedUniversities() {
  console.log('🌱 Starting university seeding...');
  
  try {
    // Clear existing universities (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing universities...');
    await prisma.university.deleteMany({});
    
    // Seed universities
    console.log(`📚 Seeding ${universities.length} universities...`);
    
    for (const university of universities) {
      await prisma.university.create({
        data: university,
      });
      console.log(`✅ Created: ${university.name}`);
    }
    
    console.log('🎉 University seeding completed successfully!');
    
    // Print summary
    const totalCount = await prisma.university.count();
    const verifiedCount = await prisma.university.count({
      where: { isVerified: true }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total universities: ${totalCount}`);
    console.log(`   Verified universities: ${verifiedCount}`);
    console.log(`   Unverified universities: ${totalCount - verifiedCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding universities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedUniversities()
    .then(() => {
      console.log('✨ Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedUniversities; 