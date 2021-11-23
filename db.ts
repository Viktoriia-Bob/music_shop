import { createConnection } from 'typeorm';

import * as config from './ormconfig';

export async function getDbConnection() {
  return createConnection(config);
}
