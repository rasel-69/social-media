import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}
declare const globalThis: {
  prismaGlobalV3: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Force reload after schema update
const prisma = globalThis.prismaGlobalV3 ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobalV3 = prisma;
}
export default prisma;


