"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepository = void 0;
var typeorm_1 = require("typeorm");
var songs_entity_1 = require("../entities/songs_entity");
function getRepository() {
    var conn = (0, typeorm_1.getConnection)();
    return conn.getRepository(songs_entity_1.Song);
}
exports.getRepository = getRepository;
