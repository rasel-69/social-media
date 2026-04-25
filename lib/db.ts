import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/lib/generated/prisma/client';


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}
declare const globalThis: {
  prismaGlobalV2: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobalV2 ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobalV2 = prisma;
}
export default prisma;


