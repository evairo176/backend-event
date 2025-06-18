import swaggerAutogen from 'swagger-autogen';

export const swaggerDocJson = {
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
        identifier: 'evairo176',
        password: '123456',
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
        category: 'category ObjectID',
        description: '',
        startDate: 'yyyy-mm-dd hh:mm:ss',
        endDate: 'yyyy-mm-dd hh:mm:ss',
        location: {
          region: 3273,
          coordinates: [0, 0],
          address: '',
        },
        isOnline: false,
        isFeatured: false,
        isPublish: false,
      },
      RemoveMediaRequest: {
        fileUrl: '',
      },
      CreateBannerRequest: {
        title: 'Banner 3 - Title',
        image:
          'https://res.cloudinary.com/five-code/image/upload/v1734918925/f70vpihmblj8lvdmdcrs.png',
        isShow: false,
      },
      CreateTicketRequest: {
        price: 1500,
        name: 'Ticket Reguler',
        events: '6762aa5dacb76a9b3e2cb1da',
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
const endPointsFiles = ['../modules/**/*.routes.ts'];

swaggerAutogen({
  openapi: '3.0.0',
})(outputFile, endPointsFiles, swaggerDocJson);
