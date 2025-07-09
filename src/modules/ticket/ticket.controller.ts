import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { TicketService } from './ticket.service';
import { HTTPSTATUS } from '../../config/http.config';
import {
  createTicketSchema,
  updateTicketSchema,
} from '../../cummon/validators/ticket.validator';
import { IPaginationQuery } from '../../cummon/interface/event.interface';

export class TicketController {
  private ticketService: TicketService;

  constructor(ticketService: TicketService) {
    this.ticketService = ticketService;
  }

  public create = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = createTicketSchema.parse({
        ...req?.body,
      });
      const userId = req?.user?.id;
      const result = await this.ticketService.create({
        ...body,
        createById: userId as string,
        updatedById: userId as string,
      });
      return res.status(HTTPSTATUS.CREATED).json({
        message: 'Create ticket successfully',
        data: result,
      });
    },
  );

  public findAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;

      const { tickets, limit, page, total, totalPages } =
        await this.ticketService.findAll(query);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all ticket',
        data: tickets,
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

      const ticket = await this.ticketService.findOne(params?.id as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find one ticket',
        data: ticket,
      });
    },
  );

  public update = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = updateTicketSchema.parse({
        ...req?.body,
      });
      const params = req?.params;
      const userId = req?.user?.id;
      const event = await this.ticketService.update(params?.id as string, {
        ...body,
        updatedById: userId as string,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success update event',
        data: event,
      });
    },
  );

  public remove = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;

      const event = await this.ticketService.remove(params?.id as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success delete ticket',
        data: event,
      });
    },
  );

  public findAllByEvent = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const query = req?.query as unknown as IPaginationQuery;

      const { tickets, limit, page, total, totalPages } =
        await this.ticketService.findAllByEvent(params?.eventId, query);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all ticket',
        data: tickets,
        pagination: {
          limit,
          page,
          total,
          totalPages,
        },
      });
    },
  );
}
