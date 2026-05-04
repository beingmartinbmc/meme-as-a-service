import type { RequestHandler } from 'express';
import { randomUUID } from 'crypto';

const HEADER = 'x-request-id';

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header(HEADER);
  const id = incoming && incoming.length <= 200 ? incoming : randomUUID();
  (req as unknown as { id: string }).id = id;
  res.setHeader(HEADER, id);
  next();
};
