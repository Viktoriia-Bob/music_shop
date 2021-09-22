import {controller, httpGet} from "inversify-express-utils";

@controller('/user')
export class UserController {
    constructor() {
    }

    @httpGet('/')
    public getUser() {
        return 'Test success';
    }
}