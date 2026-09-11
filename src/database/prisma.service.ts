import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma';
import { Client } from 'pg';

function uncapitalize(value: string): string {
    return value.charAt(0).toLowerCase() + value.slice(1);
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private client;

    constructor() {
        super({
            adapter: new PrismaPg({
                connectionString: `postgresql://${process.env['POSTGRES_USER']}:${process.env['POSTGRES_PASSWORD']}@${process.env['POSTGRES_HOST']}:${process.env['POSTGRES_PORT']}/${process.env['POSTGRES_DB']}`,
            }),
        });
        return this.mountSoftDelete(this);
    }

    private checkHasDeleteAt(model, client) {
        return (client as any)._runtimeDataModel.models[model]?.fields.some(
            (f) => f.name === 'deletedAt',
        );
    }

    private mountSoftDelete(client) {
        const checkHasDeleteAt = this.checkHasDeleteAt;
        return client.$extends({
            name: 'SoftDelete',
            query: {
                $allModels: {
                    async delete({ args, model, query }) {
                        try {
                            const delegate = (client as any)[
                                uncapitalize(model)
                            ];
                            return delegate.update({
                                where: args.where,
                                data: { deletedAt: new Date() },
                            });
                        } catch (error) {
                            return query(args);
                        }
                    },
                    async deleteMany({ args, model, query }) {
                        try {
                            const delegate = (client as any)[
                                uncapitalize(model)
                            ];
                            return delegate.updateMany({
                                where: args.where,
                                data: { deletedAt: new Date() },
                            });
                        } catch (error) {
                            return query(args);
                        }
                    },
                    findMany({ args, model, query }) {
                        if (checkHasDeleteAt(model, client))
                            args.where = { deletedAt: null, ...args.where };
                        return query(args).catch();
                    },
                    findUnique({ args, model, query }) {
                        if (checkHasDeleteAt(model, client))
                            args.where = { deletedAt: null, ...args.where };
                        return query(args);
                    },
                    findFirst({ args, model, query }) {
                        if (checkHasDeleteAt(model, client))
                            args.where = { deletedAt: null, ...args.where };
                        return query(args);
                    },
                },
            },
        }) as unknown as PrismaService;
    }

    public async onModuleInit() {
        await this.$connect();
    }
}
