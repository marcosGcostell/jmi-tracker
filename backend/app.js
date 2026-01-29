import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import userRouter from './routers/user.route.js';
import companyRouter from './routers/company.route.js';
import resourceRouter from './routers/resource.route.js';
import categoryRouter from './routers/category.route.js';
import workSiteRouter from './routers/work-site.route.js';
import vacationRouter from './routers/vacation.route.js';
import sickLeaveRouter from './routers/sick-leave.route.js';
import globalErrorHandler from './controllers/error.controller.js';

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
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/worksites', workSiteRouter);
app.use('/api/v1/vacations', vacationRouter);
app.use('/api/v1/sickleaves', sickLeaveRouter);

// ERROR MIDDLEWARE
app.use(globalErrorHandler);

export default app;
