import { Test, TestingModule } from '@nestjs/testing';
import { ClinicService } from 'src/clinic/clinic.service';

describe('Clinic Service', () => {
	let clinicService: ClinicService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ClinicService],
		}).compile();

		clinicService = module.get<ClinicService>(ClinicService);
	});
});

afterAll(() => {
	jest.clearAllMocks();
});

describe('Success Cases', () => {});

describe('Failure Cases', () => {});
