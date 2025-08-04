import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Cape_Verde_universities = [

    // Cape Verde

    { name: "Universidade de Cabo Verde", domain: "unicv.edu.cv", region: "Africa", country: "Cape Verde", isVerified: true },
    { name: "Universidade Jean Piaget de Cabo Verde", domain: "unipiaget.edu.cv", region: "Africa", country: "Cape Verde", isVerified: true },
    { name: "Universidade do Mindelo", domain: "um.edu.cv", region: "Africa", country: "Cape Verde", isVerified: true },
    { name: "Universidade Lusófona de Cabo Verde", domain: "ulusofona.edu.cv", region: "Africa", country: "Cape Verde", isVerified: true },
    { name: "Universidade de Santiago", domain: "us.edu.cv", region: "Africa", country: "Cape Verde", isVerified: true },
    { name: "Instituto Superior de Ciências Económicas e Empresariais", domain: "iscee.edu.cv", region: "Africa", country: "Cape Verde", isVerified: true },
    { name: "M_EIA Instituto Universitário de Arte, Tecnologia e Cultura", domain: "meia.edu.cv", region: "Africa", country: "Cape Verde", isVerified: true },
    { name: "Instituto Superior de Ciências Jurídicas e Sociais", domain: "iscjs.edu.cv", region: "Africa", country: "Cape Verde", isVerified: true },
    { name: "Universidade Intercontinental de Cabo Verde", domain: null, region: "Africa", country: "Cape Verde", isVerified: false },
]