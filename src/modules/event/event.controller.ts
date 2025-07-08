import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import EventService from './event.service';
import { HTTPSTATUS } from '../../config/http.config';
import {
  createEventSchema,
  updateEventSchema,
} from '../../cummon/validators/event.validator';
import { IPaginationQuery } from '../../cummon/interface/category.interface';

export default class EventController {
  private eventService: EventService;

  constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  public create = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req?.user?.id;
      const body = createEventSchema.parse({
        ...req.body,
      });

      const result = await this.eventService.create({
        ...body,
        userId: userId as string,
      });

      return res.status(HTTPSTATUS.CREATED).json({
        message: 'Create event successfully',
        data: result,
      });
    },
  );

  public findAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;

      const { events, limit, page, total, totalPages } =
        await this.eventService.findAll(query);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all event',
        data: events,
        pagination: {
          limit,
          page,
          total,
          totalPages,
        },
      });
    },
  );

  public findOne = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const result = await this.eventService.findOne(params.id as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all event',
        data: result,
      });
    },
  );

  public update = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const userId = req?.user?.id;
      const body = updateEventSchema.parse({
        ...req.body,
      });
      const result = await this.eventService.update(params.id as string, {
        ...body,
        userId: userId as string,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success update a event',
        data: result,
      });
    },
  );

  public remove = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const result = await this.eventService.remove(params.id as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success remove event',
        data: result,
      });
    },
  );

  public findOneBySlug = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const result = await this.eventService.findOneBySlug(
        params.slug as string,
      );

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find one event by slug',
        data: result,
      });
    },
  );
}
