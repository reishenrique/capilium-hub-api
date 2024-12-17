import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, type NestApplicationOptions } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {
	const configNest: NestApplicationOptions = {
		cors: true,
	};

	const app = await NestFactory.create(AppModule, configNest);

	app.use(bodyParser.json({ limit: '150mb' }));

	const config = new DocumentBuilder()
		.setTitle('Capilium Hub API')
		.setDescription('HUB that connects professionals to specialized clinics')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(process.env.PORT || 3000, () => {
		Logger.log(
			`Server listen on port: ${process.env.PORT || 3000}`,
			'InitServer',
		);
	});
}
bootstrap();
