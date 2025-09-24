import { DataSourceOptions } from 'typeorm';
export declare const databaseConfig: (() => {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
}>;
export declare const dataSourceOptions: DataSourceOptions;
declare const dataSource: any;
export default dataSource;
