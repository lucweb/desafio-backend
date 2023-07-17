import { SetMetadata } from '@nestjs/common';

// Ex. 'role1', 'role2', ...' 
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);