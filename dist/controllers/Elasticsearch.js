"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoom = exports.deleteRoom = exports.updateRoom = exports.addRoom = exports.search = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
var elasticClient = new elasticsearch_1.Client({
    node: "https://akbligwzev:9yetpsc27@app-outmind-3799119117.eu-central-1.bonsaisearch.net:443",
});
let indexname = "rooms";
exports.search = () => {
    return new Promise((resolve, reject) => {
        const params = {
            index: indexname,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    is_active: {
                                        value: true,
                                    },
                                },
                            },
                            {
                                term: {
                                    room_type: {
                                        value: "public",
                                    },
                                },
                            },
                        ],
                    },
                },
                sort: {
                    date: "asc",
                },
                size: 1,
            },
        };
        elasticClient
            .search(params)
            .then((result) => {
            resolve(result.body.hits.hits);
        })
            .catch((err) => {
            reject(err);
        });
    });
};
exports.addRoom = (room) => {
    return new Promise((resolve, reject) => {
        const params = {
            index: "rooms",
            body: room,
        };
        elasticClient
            .index(params)
            .then((result) => {
            resolve(result);
        })
            .catch((err) => {
            resolve(err);
        });
    });
};
exports.updateRoom = (room, id) => {
    return new Promise((resolve, reject) => {
        const params = {
            index: "rooms",
            id: id,
            body: room,
        };
        elasticClient
            .update(params)
            .then((result) => {
            resolve(result);
        })
            .catch((err) => {
            reject(err);
        });
    });
};
exports.deleteRoom = (id) => {
    elasticClient
        .delete({
        index: "rooms",
        id: id,
    })
        .then((resp) => {
        return resp;
    })
        .catch((err) => {
        return err;
    });
};
exports.getRoom = (id) => {
    let query = {
        index: "rooms",
        id: id,
    };
    elasticClient
        .get(query)
        .then((resp) => {
        if (!resp)
            return "No Room Found";
        return resp;
    })
        .catch((err) => {
        return err;
    });
};
//# sourceMappingURL=Elasticsearch.js.map