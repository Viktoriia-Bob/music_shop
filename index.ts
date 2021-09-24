import 'reflect-metadata';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { bindings } from './inversify.config';
import * as bodyParser from 'body-parser';
import 'dotenv/config';
import errorMiddleware from './src/middlewares/error_middleware';

(async () => {
  const port = 3000;
  const container = new Container();
  await container.loadAsync(bindings);
  const app = new InversifyExpressServer(container);
  app.setConfig((expressApplication) => {
    expressApplication.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    expressApplication.use(bodyParser.json());
    expressApplication.use(errorMiddleware);
  });
  const server = app.build();

  server.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });
})();
