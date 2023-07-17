import { IsString, IsInt, IsUUID, MinLength } from 'class-validator';

export enum GROUPS_CLIENT_VALIDATE {
    CREATE = 'create',
    UPDATE = 'update'
}

export class ClientDTO {
    @IsUUID('4', { message: 'Id must be a UUID v4', groups: [GROUPS_CLIENT_VALIDATE.UPDATE] })
    id: string

    @IsString({ message: 'Name is required', always: true })
    @MinLength(1, { message: 'Name is required', always: true })
    name: string;

    @IsInt({ message: 'Document number is required', always: true  })
    document: number;
}