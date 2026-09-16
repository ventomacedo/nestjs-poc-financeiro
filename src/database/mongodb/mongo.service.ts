import { Logger } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';

export class MongoService {
    private logger: Logger;

    constructor(private connection: Connection) {
        this.logger = new Logger('Mongoose');
    }

    public async connect(uri: string): Promise<void> {
        try {
            await mongoose.connect(uri);
            this.connection = mongoose.connection;
            this.logger.log('MongoDB connected.');
        } catch (error) {
            this.logger.error('MongoDB connection failed', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }

    public getConnection(): Connection {
        return this.connection;
    }
}
