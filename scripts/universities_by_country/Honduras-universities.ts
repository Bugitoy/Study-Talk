import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Honduras_universities = [

  // Honduras

  { name: "Universidad Nacional Autónoma de Honduras", domain: "unah.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad Tecnológica de Honduras", domain: "uth.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad Católica de Honduras", domain: "unicah.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad Tecnológica Centroamericana", domain: "unitec.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Escuela Agrícola Panamericana, Zamorano", domain: "zamorano.edu", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad Pedagógica Nacional Francisco Morazán", domain: "upnfm.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad Cristiana Evangélica Nuevo Milenio", domain: "ucenm.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad de San Pedro Sula", domain: "usap.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad José Cecilio del Valle", domain: "ujcv.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad Metropolitana de Honduras", domain: "umeh.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Universidad Politécnica de Ingeniería", domain: "upi.edu.hn", region: "North America", country: "Honduras", isVerified: true },
  { name: "Centro de Diseño, Arquitectura y Construcción", domain: "cdac.edu.hn", region: "North America", country: "Honduras", isVerified: true },
]   