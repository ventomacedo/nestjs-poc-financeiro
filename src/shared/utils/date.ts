import { format, fromUnixTime } from 'date-fns';
import { tz } from '@date-fns/tz';

export const convertTime = (input: string): Date => {
    if (!input)
        throw new Error('ConvertTime: Input não contém uma string válida.');

    const match = input.toLocaleLowerCase().match(/^(\d+)([hmsd])$/);
    if (!match)
        throw new Error(
            "Formato inválido. Use algo como '8h', '5m', '30s' ou '2d'.",
        );

    const value = parseInt(match[1], 10);
    const unity = match[2];

    const milisecondsToUnity = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    const msToAdd = value * milisecondsToUnity[unity];
    return new Date(Date.now() + msToAdd);
};

export const isBefore = (
    firstDate: string | Date,
    secondDate: string | Date,
): boolean => {
    const dateOne = new Date(firstDate);
    const dateTwo = new Date(secondDate);

    return dateOne.getTime() < dateTwo.getTime();
};

export const isAfter = (
    firstDate: string | Date,
    secondDate: string | Date,
): boolean => {
    const dateOne = new Date(firstDate);
    const dateTwo = new Date(secondDate);

    return dateOne.getTime() > dateTwo.getTime();
};

export const isSame = (
    firstDate: string | Date,
    secondDate: string | Date,
): boolean => {
    const dateOne = new Date(firstDate);
    const dateTwo = new Date(secondDate);

    return dateOne.getTime() == dateTwo.getTime();
};

export const timestampToDB = (input: number) => {
    const _input = input.toString().length === 10 ? input * 1000 : input;
    return format(_input, 'yyyy-MM-dd HH:mm:ss.SSS', {
        in: tz('UTC'),
    });
};

export const timestampToDate = (input: number) => {
    return new Date(input).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
    });
};

export const expTimeToDabase = (input: number) => {
    return fromUnixTime(input);
};
