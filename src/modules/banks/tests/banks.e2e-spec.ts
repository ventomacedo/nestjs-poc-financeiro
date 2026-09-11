import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database';
import { JwthGuard } from '@auth';
import { RedisService } from '../../../shared/redis/redis.service';

describe('BanksController (e2e)', () => {
    let app: INestApplication;

    const bank = {
        id: 'bank-id',
        taxId: '11222333000181',
        name: 'Monopoly Bank',
        fantasyName: 'Banco imobiliário',
        ispb: '001',
        compeCode: '00000001',
        createdAt: '2026-08-27T23:57:48.905Z',
        updatedAt: null,
        deletedAt: null,
    };

    const prismaMock = {
        bank: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(prismaMock)
            .overrideProvider(RedisService)
            .useValue({
                get: jest.fn(),
                set: jest.fn(),
                upsert: jest.fn(),
                del: jest.fn(),
            })
            .overrideGuard(JwthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        await app.init();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/banks', () => {
        it('returns the list of banks', async () => {
            prismaMock.bank.findMany.mockResolvedValue([bank]);

            const response = await request(app.getHttpServer()).get(
                '/api/v1/banks',
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual([bank]);
        });
    });

    describe('GET /api/v1/banks/:id', () => {
        it('returns a single bank by id', async () => {
            prismaMock.bank.findFirst.mockResolvedValue(bank);

            const response = await request(app.getHttpServer()).get(
                `/api/v1/banks/${bank.id}`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual(bank);
            expect(prismaMock.bank.findFirst).toHaveBeenCalledWith({
                where: { id: bank.id },
            });
        });
    });

    describe('POST /api/v1/banks', () => {
        const payload = {
            taxId: bank.taxId,
            name: bank.name,
            fantasyName: bank.fantasyName,
            ispb: bank.ispb,
            compeCode: bank.compeCode,
        };

        it('creates a bank', async () => {
            prismaMock.bank.create.mockResolvedValue(bank);

            const response = await request(app.getHttpServer())
                .post('/api/v1/banks')
                .send(payload);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(bank);
            expect(prismaMock.bank.create).toHaveBeenCalledWith({
                data: payload,
            });
        });

        it('rejects an invalid taxId with 400', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/banks')
                .send({ ...payload, taxId: 'invalid-tax-id' });

            expect(response.status).toBe(400);
            expect(prismaMock.bank.create).not.toHaveBeenCalled();
        });

        it('rejects an unknown field with 400', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/banks')
                .send({ ...payload, extraField: 'not allowed' });

            expect(response.status).toBe(400);
            expect(prismaMock.bank.create).not.toHaveBeenCalled();
        });
    });

    describe('PUT /api/v1/banks/:id', () => {
        it('updates a bank', async () => {
            prismaMock.bank.update.mockResolvedValue(bank);

            const response = await request(app.getHttpServer())
                .put(`/api/v1/banks/${bank.id}`)
                .send({
                    taxId: bank.taxId,
                    name: bank.name,
                    fantasyName: bank.fantasyName,
                    ispb: bank.ispb,
                    compeCode: bank.compeCode,
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(bank);
        });
    });

    describe('DELETE /api/v1/banks/:id', () => {
        it('deletes a bank', async () => {
            prismaMock.bank.delete.mockResolvedValue({ id: bank.id });

            const response = await request(app.getHttpServer()).delete(
                `/api/v1/banks/${bank.id}`,
            );

            expect(response.status).toBe(202);
            expect(prismaMock.bank.delete).toHaveBeenCalledWith({
                where: { id: bank.id },
                select: { id: true },
            });
        });
    });
});
