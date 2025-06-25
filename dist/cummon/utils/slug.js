"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    generate(name) {
        const slug = name.split(' ').join('-').toLowerCase();
        return slug;
    },
};
