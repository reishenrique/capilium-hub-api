import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Opportunity } from './entity/opportunity.entity';
import { OpportunityRepository } from './repositories/opportunity.repository';
import { OpportunityController } from './presentation/opportunity.controller';
import { OpportunitySchema } from './schemas/opportunity.schema';
import { OpportunityService } from './opportunity.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Opportunity.name,
				schema: OpportunitySchema,
			},
		]),
	],
	controllers: [OpportunityController],
	providers: [OpportunityService, OpportunityRepository],
	exports: [MongooseModule, OpportunityService, OpportunityRepository],
})
export class OpportunityModule {}
