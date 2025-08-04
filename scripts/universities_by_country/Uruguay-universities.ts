import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Uruguay_universities = [

   // Uruguay

   { name: "Universidad de la República", domain: "udelar.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Universidad ORT Uruguay", domain: "ort.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Universidad Católica del Uruguay", domain: "ucu.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Universidad de Montevideo", domain: "um.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Universidad Tecnológica", domain: "utec.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Universidad de la Empresa", domain: "ude.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Instituto Universitario Centro Latinoamericano de Economía Humana", domain: "universidad.claeh.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Instituto Universitario Centro de Estudio y Diagnóstico de las Disgnacias del Uruguay", domain: "iuceddu.com.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Instituto Universitario Bios", domain: "biosportal.com", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Instituto Universitario Asociación Cristiana de Jóvenes", domain: "iuacj.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Instituto Universitario Francisco de Asís", domain: "unifa.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Facultad de Teología del Uruguay Mons. Mariano Soler", domain: "facteologia.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Instituto Metodista Universitario Crandon", domain: "universitariocrandon.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Instituto Universitario Centro de Docencia, Investigación e Información en Aprendizaje", domain: "cediiap.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Politécnico de Punta del Este", domain: "politecnico.edu.uy", region: "South America", country: "Uruguay", isVerified: true },
   { name: "Instituto Universitario de Postgrado en Psicoanálisis", domain: "apuruguay.org", region: "South America", country: "Uruguay", isVerified: true },
]