import { UUID } from "crypto";

declare global {
  namespace Express {
    interface Request {
      user?: { id: UUID; portfolioId?: number };
    }
  }
}
