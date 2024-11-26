"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMiddleware = void 0;
const cacheMiddleware = (redisClient) => (key_1, callback_1, ...args_1) => __awaiter(void 0, [key_1, callback_1, ...args_1], void 0, function* (key, callback, expiration = 3600) {
    try {
        if (redisClient) {
            const cachedData = yield redisClient.get(key);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            const freshData = yield callback();
            yield redisClient.setEx(key, expiration, JSON.stringify(freshData));
            return freshData;
        }
        return yield callback();
    }
    catch (error) {
        console.error('Cache error:', error);
        return yield callback();
    }
});
exports.cacheMiddleware = cacheMiddleware;
