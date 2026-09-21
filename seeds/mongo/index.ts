import mongoose from 'mongoose';
import { seedMongoProducts } from './products.seed';

export async function seedMongo(): Promise<void> {
    const uri = `mongodb://${process.env['MONGO_USERNAME']}:${process.env['MONGO_PASSWORD']}@${process.env['MONGO_HOST']}:${process.env['MONGO_PORT']}/${process.env['MONGO_DB']}?authSource=admin`;
    const connection = await mongoose.createConnection(uri).asPromise();

    try {
        const inserted = await seedMongoProducts(connection);
        console.log(
            `Seed de products (MongoDB) aplicado: ${inserted} inseridos.`,
        );
    } finally {
        await connection.close();
    }
}
