import { NestFactory } from '@nestjs/core';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import * as express from 'express';
import { Server } from 'http';
import { NestApplicationOptions, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';

let lambdaProxy: Server;

function isApiGatewayEvent(event: any): event is APIGatewayProxyEvent {
  return event.resource;
}

async function createLambdaProxy(
  module: any,
  options: NestApplicationOptions,
  nestAppConfigurator: (nestApp: INestApplication) => void,
) {
  if (!lambdaProxy) {
    const expressServer = express();
    const nestApp = await NestFactory.create(
      module,
      new ExpressAdapter(expressServer),
      options,
    );

    if (nestAppConfigurator) {
      nestAppConfigurator(nestApp);
    }

    await nestApp.init();

    lambdaProxy = createServer(expressServer);
  }

  return lambdaProxy;
}

export function createExpressHandler(
  module: any,
  options?: NestApplicationOptions,
  nestAppConfigurator?: (nestApp: INestApplication) => void,
) {
  return async (event: any, context: Context): Promise<any> => {
    if (!isApiGatewayEvent(event)) {
      throw new Error(`Cannot process this event type! ${JSON.parse(event)}`);
    }

    await createLambdaProxy(module, options, nestAppConfigurator);
    return await proxy(lambdaProxy, event, context, 'PROMISE').promise;
  };
}
