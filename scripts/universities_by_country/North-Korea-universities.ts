import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const North_Korea_universities = [

   // North Korea

   { name: "Pyongyang University of Science and Technology", domain: "pust.edu.kp", region: "Asia", country: "North Korea", isVerified: true },
   { name: "Kim Il Sung University", domain: "ryongnamsan.edu.kp", region: "Asia", country: "North Korea", isVerified: true },
   { name: "Kim Chaek University of Technology", domain: "kut.edu.kp", region: "Asia", country: "North Korea", isVerified: true },
   { name: "Wonsan Agricultural University", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Chongjin University of Pedagogy", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Hamhung University of Chemical Industry", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Pyongyang University of Agriculture", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Koryo Songgyungwan University", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Pyongyang University of Foreign Studies", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Hamhung University of Education", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Sariwon Pharmaceutical College of Koryo", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Kim Won Gyun Pyongyang Conservatory", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Chongjin University of Light Industry", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Chongjin Metal Mining University", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Rajin University of Marine Transport", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Huichon University of Telecommunications", domain: "hut.edu.kp", region: "Asia", country: "North Korea", isVerified: true },
   { name: "Institute of Natural Science", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Hamhung University of Mathematical and Physical Sciences", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Kim Chol Ju University of Education", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Kim Hyong Jik University of Education", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Pyongyang Medical University", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Pyongyang University of Architecture and Building Materials", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Pyongyang University of Music and Dance", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Pyongyang University of Printing Engineering", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Pyongyang University of Railways", domain: null, region: "Asia", country: "North Korea", isVerified: false },
   { name: "Chongjin Medical University", domain: null, region: "Asia", country: "North Korea", isVerified: false },
]