// src/infra/typeorm/database.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppDataSource } from "./data-source";
console.log("Initializing DatabaseModule...");

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...AppDataSource.options,
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
