import {controller, httpDelete, httpGet, httpPatch, httpPost, requestBody, requestParam} from "inversify-express-utils";
import {Repository} from "typeorm";
import {CartWithSongs} from "../entities/carts_with_songs_entity";
import {TYPE} from "../../constants/types";
import {inject} from "inversify";

@controller('/cartWithSongs')
export class CartsWithSongsController {
    private readonly _cartRepository: Repository<CartWithSongs>
    constructor(@inject(TYPE.CartWithSongsRepository) cartRepository: Repository<CartWithSongs>) {
        this._cartRepository = cartRepository;
    }
    @httpGet('/')
    public async getCarts() {
        return this._cartRepository.find();
    }
    @httpPost('/')
    public async createCart(@requestBody() newCart: CartWithSongs) {
        return this._cartRepository.save(this._cartRepository.create(newCart));
    }
    @httpPatch('/:id')
    public async updateCart(@requestBody() updateCart: CartWithSongs,
                            @requestParam('id') id: number) {
        return this._cartRepository.update({id}, updateCart);
    }
    @httpDelete('/:id')
    public async removeCart(@requestParam('id') id: number) {
        return this._cartRepository.delete({id});
    }
}