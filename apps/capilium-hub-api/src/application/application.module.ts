import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationService } from './application.service';
import { Application } from './entity/application.entity';
import { ApplicationController } from './presentation/application.controller';
import { ApplicationRepository } from './repository/application.repository';
import { ApplicationSchema } from './schemas/applications.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Application.name,
				schema: ApplicationSchema,
			},
		]),
	],
	controllers: [ApplicationController],
	providers: [ApplicationService, ApplicationRepository],
	exports: [MongooseModule, ApplicationService, ApplicationRepository],
})
export class ApplicationModule {}
