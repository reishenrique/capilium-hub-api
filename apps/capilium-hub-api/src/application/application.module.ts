import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationService } from './application.service';
import { Application } from './entity/application.entity';
import { ApplicationController } from './presentation/application.controller';
import { ApplicationRepository } from './repository/application.repository';
import { ApplicationSchema } from './schemas/applications.schema';
import { UserModule } from '../users/user.module';
import { OpportunityModule } from '../opportunity/opportunity.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Application.name,
				schema: ApplicationSchema,
			},
		]),
		UserModule,
		OpportunityModule,
	],
	controllers: [ApplicationController],
	providers: [ApplicationService, ApplicationRepository],
	exports: [MongooseModule, ApplicationService, ApplicationRepository],
})
export class ApplicationModule {}
