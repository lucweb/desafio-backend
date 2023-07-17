import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { ClientService } from '../services/client.service';
import { Client } from '../entity/client.entity';
import { ClientDTO, GROUPS_CLIENT_VALIDATE } from '../dto/client.dto';
import { LocalAuthGuard } from '../../../auth/local-auth.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('customers')
@UseGuards(LocalAuthGuard)
export class ClientController {
    constructor(private readonly clientService: ClientService) { }

    @Get(':id')
    @Roles('user')
    async get(@Param('id') id: string): Promise<Client> {
        const model = await this.clientService.findById(id);

        if (!model)
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Cliente inexistente',
            }, HttpStatus.NOT_FOUND);
        return model
    }

    @Post()
    @Roles('user')
    async create(@Body(new ValidationPipe({ groups: [GROUPS_CLIENT_VALIDATE.CREATE] })) clientdDTO: ClientDTO) {
        const modelEntity = new Client().getEntity(clientdDTO, GROUPS_CLIENT_VALIDATE.CREATE)
        const model = await this.clientService.save(modelEntity)

        if (!model)
            throw new HttpException({
                statusCode: HttpStatus.BAD_GATEWAY,
                message: 'Cache indisponível',
            }, HttpStatus.BAD_GATEWAY);
        return model
    }

    @Put()
    @Roles('user')
    async update(@Body(new ValidationPipe({ groups: [GROUPS_CLIENT_VALIDATE.UPDATE] })) clientdDTO: ClientDTO) {
        const modelEntity = new Client().getEntity(clientdDTO, GROUPS_CLIENT_VALIDATE.UPDATE)
        const model = await this.clientService.update(modelEntity)

        if (!model)
            throw new HttpException({
                statusCode: HttpStatus.BAD_GATEWAY,
                message: 'Cache indisponível',
            }, HttpStatus.BAD_GATEWAY);
        return model
    }
}
