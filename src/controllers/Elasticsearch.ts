import { Client, ApiResponse, RequestParams } from "@elastic/elasticsearch";

import { Request, Response } from "express";

var elasticClient = new Client({
  node:
    "https://akbligwzev:9yetpsc27@app-outmind-3799119117.eu-central-1.bonsaisearch.net:443",
});

let indexname = "rooms";

export let search = () => {
  return new Promise((resolve, reject) => {
    const params: RequestParams.Search = {
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
      .then((result: ApiResponse) => {
        resolve(result.body.hits.hits);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
};

export let addRoom = (room: any) => {
  return new Promise((resolve, reject) => {
    const params: RequestParams.Index = {
      index: "rooms",
      body: room,
    };
    elasticClient
      .index(params)
      .then((result: ApiResponse) => {
        resolve(result);
      })
      .catch((err: Error) => {
        resolve(err);
      });
  });
};
export let updateRoom = (room: any, id: any) => {
  return new Promise((resolve, reject) => {
    const params: RequestParams.Update = {
      index: "rooms",
      id: id,
      body: room,
    };
    elasticClient
      .update(params)
      .then((result: ApiResponse) => {
        resolve(result);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
};
export let deleteRoom = (id: any) => {
  elasticClient
    .delete({
      index: "rooms",
      id: id,
    })
    .then((resp: any) => {
      return resp;
    })
    .catch((err: any) => {
      return err;
    });
};

export let getRoom = (id: any) => {
  let query = {
    index: "rooms",
    id: id,
  };
  elasticClient
    .get(query)
    .then((resp: any) => {
      if (!resp) return "No Room Found";
      return resp;
    })
    .catch((err: any) => {
      return err;
    });
};
