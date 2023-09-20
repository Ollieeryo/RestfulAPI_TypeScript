import express from 'express';
import corsMiddleware from './middleware/corsMiddleware';
import { jsonParser, urlencodedParser } from './middleware/bodyParserMiddleware';
import userRoutes from './routes/userRoutes';

const app = express();
const port = 3000;

app.use(corsMiddleware);
app.use(jsonParser);
app.use(urlencodedParser);
app.use('/api', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
