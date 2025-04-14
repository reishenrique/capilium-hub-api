import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Application } from '../application/entity/application.entity';
import { ApplicationSchema } from '../application/schemas/applications.schema';
import { UploadController } from './presentation/upload.controller';
import { UploadRepository } from './repository/upload.repository';
import { UploadService } from './upload.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Application.name,
				schema: ApplicationSchema,
			},
		]),
		UserModule,
	],
	controllers: [UploadController],
	providers: [UploadService, UploadRepository],
	exports: [MongooseModule, UploadService, UploadRepository],
})
export class UploadModule {}
