import { type ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { RefreshAuthCredentialsDto } from '../auth/dto/refreshAuthCredentialsDto';
import { ClinicPaginationQueryDto } from '../clinic/dto/clinicPaginationQueryDto';
import { StatusEnum } from '../common/enums/status.enum';
import { createGlobalValidationPipe } from '../common/pipes/validation.pipe';
import { OpportunityCreateDto } from '../opportunity/dto/opportunityCreateDto';
import { OpportunityUpdateDto } from '../opportunity/dto/opportunityUpdateDto';

const bodyMetadata = (metatype: unknown): ArgumentMetadata => ({
	type: 'body',
	metatype: metatype as ArgumentMetadata['metatype'],
});

const queryMetadata = (metatype: unknown): ArgumentMetadata => ({
	type: 'query',
	metatype: metatype as ArgumentMetadata['metatype'],
});

const validOpportunity = () => ({
	title: 'Hair transplant assistant',
	description: 'Assist during hair transplant surgeries',
	location: '7th Avenue, New York',
	salary: 1400,
	status: StatusEnum.Open,
});

describe('global validation pipe', () => {
	const pipe = createGlobalValidationPipe();

	describe('whitelist', () => {
		it('removes undeclared fields from a create payload', async () => {
			const result = await pipe.transform(
				{ ...validOpportunity(), injected: 'unexpected' },
				bodyMetadata(OpportunityCreateDto),
			);

			expect(result).not.toHaveProperty('injected');
			expect(result).toMatchObject(validOpportunity());
		});

		it('keeps the declared fields of DTOs that only have them', async () => {
			const result = await pipe.transform(
				{
					refreshToken: 'refresh-token',
					email: 'johndoe@test.com',
					injected: 'unexpected',
				},
				bodyMetadata(RefreshAuthCredentialsDto),
			);

			expect(result).toMatchObject({
				refreshToken: 'refresh-token',
				email: 'johndoe@test.com',
			});
			expect(result).not.toHaveProperty('injected');
		});
	});

	describe('opportunity payload', () => {
		it('rejects an invalid status with 400', async () => {
			await expect(
				pipe.transform(
					{ ...validOpportunity(), status: 'INVALID' },
					bodyMetadata(OpportunityCreateDto),
				),
			).rejects.toBeInstanceOf(BadRequestException);
		});

		it('rejects a body without a required field with validation messages', async () => {
			const { title, ...withoutTitle } = validOpportunity();

			try {
				await pipe.transform(withoutTitle, bodyMetadata(OpportunityCreateDto));
				throw new Error('expected validation to reject the payload');
			} catch (error) {
				expect(error).toBeInstanceOf(BadRequestException);
				expect((error as BadRequestException).getResponse()).toMatchObject({
					message: expect.arrayContaining([expect.stringContaining('title')]),
				});
			}
		});

		it('accepts a partial payload on update and strips undeclared fields', async () => {
			const result = await pipe.transform(
				{ title: 'Updated title', injected: 'unexpected' },
				bodyMetadata(OpportunityUpdateDto),
			);

			expect(result).not.toHaveProperty('injected');
			expect(result).toMatchObject({ title: 'Updated title' });
		});
	});

	describe('query params', () => {
		it('converts numeric query params to numbers', async () => {
			const result = await pipe.transform(
				{ page: '2', limit: '25' },
				queryMetadata(ClinicPaginationQueryDto),
			);

			expect(result).toMatchObject({ page: 2, limit: 25 });
		});

		it('applies the pagination defaults when params are omitted', async () => {
			const result = await pipe.transform(
				{},
				queryMetadata(ClinicPaginationQueryDto),
			);

			expect(result).toMatchObject({ page: 1, limit: 10 });
		});

		it('rejects a non numeric page with 400', async () => {
			await expect(
				pipe.transform(
					{ page: 'not-a-number' },
					queryMetadata(ClinicPaginationQueryDto),
				),
			).rejects.toBeInstanceOf(BadRequestException);
		});
	});
});
