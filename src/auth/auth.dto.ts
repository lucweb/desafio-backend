export interface AuthUser {
    exp: number
    iat: number
    jti: string
    iss: string
    sub: string
    typ: string
    azp: string
    acr: string
    resource_access: ResourceAccess
    scope: string
    clientId: string
    email_verified: boolean
    clientHost: string
	clientAddress: string
    preferred_username: string
	active: true
}

export interface ResourceAccess {
    customers: Customers
}

export interface Customers {
    roles: string[]
}

export enum ROLES {
    USER = 'user'
}
