import { v4 as uuidv4 } from "uuid"
import { ClientDTO, GROUPS_CLIENT_VALIDATE } from "../dto/client.dto"

export class Client {

    id: string
    document: number
    name: string

    getEntity(clientDto: ClientDTO, group: GROUPS_CLIENT_VALIDATE) {
        const model = new Client()

        if (group == GROUPS_CLIENT_VALIDATE.CREATE)
            model.id = uuidv4()
        else if (group == GROUPS_CLIENT_VALIDATE.UPDATE)
            model.id = clientDto.id

        model.name = clientDto.name
        model.document = clientDto.document

        return model
    }
}