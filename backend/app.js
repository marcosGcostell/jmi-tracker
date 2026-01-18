import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import userRouter from './routers/user.route.js';

dotenv.config({ path: './config.env' });

const app = express();

// MIDDLEWARES
app.use(helmet());

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Request limit reached',
});
app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: 'http://localhost:8000',
      credentials: true,
    }),
  );
} else {
  // app.use(cors({
  //   origin: 'https://apiurl.com';
  // }))
}
app.use(express.json({ limit: '10kb' }));
// app.use(express.static(`${__dirname}/public`));

app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/users', userRouter);

// ERROR MIDDLEWARE
// app.use(globalErrorHandler);

export default app;
