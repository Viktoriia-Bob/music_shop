import {
    controller,
    httpDelete,
    httpGet,
    httpPatch,
    httpPost,
    requestBody,
    requestParam,
    response
} from 'inversify-express-utils';
import * as express from 'express';
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
    public async get(@response() res: express.Response) {
        try {
            return this._songRepository.find();
        } catch(e) {
            res.status(500);
            res.send(e.message);
        }
    }
    @httpPost('/')
    public async post(@response() res: express.Response, @requestBody() newSong: Song) {
        try {
            return this._songRepository.save(this._songRepository.create(newSong));
        } catch (e) {
            res.status(500);
            res.send(e.message);
        }
    }
    @httpPatch('/:id')
    public async update(@response() res: express.Response,
                        @requestBody() updateSong: Song,
                        @requestParam('id') idParam: number) {
        try {
            return this._songRepository.update({id: idParam}, updateSong);
        } catch (e) {
            res.status(500);
            res.send(e.message);
        }
    }
    @httpDelete('/:id')
    public async remove(@response() res: express.Response, @requestParam('id') idParam: number) {
        try {
            return this._songRepository.delete({id: idParam});
        } catch (e) {
            res.status(500);
            res.send(e.message);
        }
    }
}