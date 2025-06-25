import { Request, Response } from 'express';
import { SessionService } from './session.service';
import { HTTPSTATUS } from '../../config/http.config';
import { NotFoundException } from '../../cummon/utils/catch-errors';
import { z } from 'zod';
import { asyncHandler } from '../../middlewares/async-handler.middleware';

export class SessionController {
  private sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  public getAllSession = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req?.user?.id;
      const sessionId = req.sessionId;

      const { sessions } = await this.sessionService.getAllSession(userId);

      const modifySession = sessions?.map((session) => {
        return {
          ...session,
          isCurrent: session.id === sessionId ? true : false,
        };
      });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Retrieved all session successfully',
        sessions: modifySession,
      });
    },
  );

  public getSession = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId;

      if (!sessionId) {
        throw new NotFoundException('Session ID not found. please login again');
      }
      const { user } = await this.sessionService.getSessionById(sessionId);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Retrieved session successfully',
        user,
      });
    },
  );

  public deleteSession = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = z.string().parse(req?.params?.id);

      const userId = req?.user?.id as string;

      await this.sessionService.deleteSession(sessionId, userId);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Session remove successfully',
      });
    },
  );
}
