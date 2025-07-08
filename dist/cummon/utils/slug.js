"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    generate(name) {
        if (name) {
            const slug = name.split(' ').join('-').toLowerCase();
            return slug;
        }
        return '';
    },
};
