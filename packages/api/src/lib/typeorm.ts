import { OracleDataSource, PostgreSQLDataSource } from '../config/datasources';

export {
  OracleDataSource as oracleDataSource,
  PostgreSQLDataSource as pgDataSource,
};

export const getUserRepository = () =>
  PostgreSQLDataSource.getRepository('User');
export const getPaymentRepository = () =>
  PostgreSQLDataSource.getRepository('Payment');

export const pgQuery = (sql: string, parameters?: any[]) => {
  return PostgreSQLDataSource.query(sql, parameters);
};

export const oracleQuery = (sql: string, parameters?: any[]) => {
  return OracleDataSource.query(sql, parameters);
};
