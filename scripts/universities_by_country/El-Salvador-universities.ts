import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const El_Salvador_universities = [

   // El Salvador

   { name: "Universidad de El Salvador", domain: "ues.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Centroamericana José Simeón Cañas", domain: "uca.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Pedagógica de El Salvador", domain: "pedagogica.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Don Bosco", domain: "udb.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Tecnológica de El Salvador", domain: "utec.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Francisco Gavidia", domain: "ufg.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Capitán General Gerardo Barrios", domain: "ugb.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad de Oriente, El Salvador", domain: "univo.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Dr. José Matías Delgado", domain: "ujmd.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Evangélica de El Salvador", domain: "uees.edu.sv", region: "North America", country: "El Salvador", isVerified: true },          
   { name: "Escuela Especializada en Ingeniería ITCA-FEPADE", domain: "itca.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Católica de El Salvador", domain: "catolica.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Escuela Superior de Economía y Negocios", domain: "esen.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Dr. Andrés Bello", domain: "unab.edu.sv", region: "North America", country: "El Salvador", isVerified: true },                   
   { name: "Instituto Especializado de Educación Superior de Profesionales de la Salud de El Salvador", domain: "ieproes.edu.sv", region: "North America", country: "El Salvador", isVerified: true },  
   { name: "Universidad Salvadoreña Alberto Masferrer", domain: "usam.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Luterana Salvadoreña", domain: "uls.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Politécnica de El Salvador", domain: "upes.edu.sv", region: "North America", country: "El Salvador", isVerified: true },         
   { name: "Universidad de Sonsonate", domain: null, region: "North America", country: "El Salvador", isVerified: false },
   { name: "Escuela de Comunicación Mónica Herrera", domain: "monicaherrera.edu.sv", region: "North America", country: "El Salvador", isVerified: true }, 
   { name: "Universidad Nueva San Salvador", domain: "unssa.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Panamericana, El Salvador", domain: "upan.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Autónoma de Santa Ana", domain: "unasa.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Albert Einstein", domain: "uae.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Cristiana de las Asambleas de Dios", domain: "ucad.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Instituto Superior de Economia y Administración de Empresas", domain: "iseade.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Técnica Latinoamericana", domain: "utla.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Instituto Especializado de Educación Superior El Espíritu Santo", domain: "ieeses.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Escuela Superior Franciscana Especializada AGAPE", domain: "esfe.agape.edu.sv", region: "North America", country: "El Salvador", isVerified: true },
   { name: "Universidad Monseñor Oscar Arnulfo Romero", domain: "umoar.edu.sv", region: "North America", country: "El Salvador", isVerified: true }, 
]