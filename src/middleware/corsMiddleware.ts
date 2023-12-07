import cors from 'cors';

const corsMiddleware = cors({
  origin: '*',
});

export default corsMiddleware;
