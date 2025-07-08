"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doc = void 0;
// jalankan file ini sekali saat build
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
exports.doc = {
    info: {
        version: '1.0.0',
        title: 'Dokumentasi API acara',
        description: 'Dokumentasi API untuk acara',
    },
    servers: [
        {
            url: 'http://localhost:8000/api/v1',
            description: 'Local server',
        },
        {
            url: 'https://backend-event-two.vercel.app/api/v1',
            description: 'Production server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
            },
        },
        schemas: {
            LoginRequest: {
                identifier: 'semenjakpetang176@gmail.com',
                password: 'Juara123',
            },
            RegisterRequest: {
                fullName: 'Dicki Prasetya',
                username: 'evairo176',
                email: 'semenjakpetang176@gmail.com',
                password: 'Juara123',
                confirmPassword: 'Juara123',
            },
            ActivationRequest: {
                code: 'abcdef',
            },
            VerifyEmailRequest: {
                code: '58c4e36ef77049a0a69abc0dc',
            },
            UpdateProfileRequest: {
                fullName: '',
                profilePicture: '',
            },
            UpdatePasswordRequest: {
                oldPassword: '',
                password: '',
                confirmPassword: '',
            },
            CreateCategoryRequest: {
                name: '',
                description: '',
                icon: '',
            },
            CreateEventRequest: {
                name: '',
                banner: 'fileUrl',
                description: '',
                startDate: 'yyyy-mm-dd hh:mm:ss',
                endDate: 'yyyy-mm-dd hh:mm:ss',
                region: 3273,
                address: 'tebet jakarta selatan',
                latitude: 1,
                longitude: 1,
                isOnline: false,
                isFeatured: false,
                isPublished: false,
                categoryId: '6858df03022a5c90a60ab811',
            },
            RemoveMediaRequest: {
                fileUrl: '',
            },
            CreateBannerRequest: {
                title: 'Banner 3 - Title',
                image: 'https://res.cloudinary.com/five-code/image/upload/v1734918925/f70vpihmblj8lvdmdcrs.png',
                isShow: false,
            },
            CreateTicketRequest: {
                price: 1500,
                name: 'Ticket Reguler',
                eventId: '6762aa5dacb76a9b3e2cb1da',
                description: 'Ticket Reguler - Description',
                quantity: 100,
            },
            CreateOrderRequest: {
                events: 'event object id',
                ticket: 'ticket object id',
                quantity: 1,
            },
        },
    },
};
const outputFile = './swagger-output.json';
const endpointsFiles = ['../modules/**/*.routes.ts']; // pastikan path sesuai
(0, swagger_autogen_1.default)({ openapi: '3.0.0' })(outputFile, endpointsFiles, exports.doc);
