import {
    controller,
    httpDelete,
    httpGet,
    httpPatch,
    httpPost,
    requestBody,
    requestParam
} from 'inversify-express-utils';
import {Song} from "../entities/songs_entity";
import {Repository} from "typeorm";
import {inject} from "inversify";
import {TYPE} from "../../constants/types";

@controller('/songs')
export class SongsController {
    private readonly _songRepository: Repository<Song>
    constructor(@inject(TYPE.SongRepository) songRepository: Repository<Song>) {
        this._songRepository = songRepository;
    }
    @httpGet('/')
    public async get() {
        return this._songRepository.find();
    }
    @httpPost('/')
    public async post(@requestBody() newSong: Song) {
        return this._songRepository.save(this._songRepository.create(newSong));
    }
    @httpPatch('/:id')
    public async update(@requestBody() updateSong: Song,
                        @requestParam('id') idParam: number) {
        return this._songRepository.update({id: idParam}, updateSong);
    }
    @httpDelete('/:id')
    public async remove(@requestParam('id') idParam: number) {
        return this._songRepository.delete({id: idParam});
    }
}