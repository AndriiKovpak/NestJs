export const config = {
  db: {
    entities: [`${__dirname}/../../entity/**/*.{js,ts}`],
    subscribers: [`${__dirname}/../../subscriber/**/*.{js,ts}`],
    migrations: [`${__dirname}/../../migration/**/*.{js,ts}`],
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECERET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  graphql: {
    debug: true,
    playground: {
      settings: {
        'request.credentials': 'include',
      },
    },
    autoSchemaFile: true,
    autoTransformHttpErrors: true,
    cors: { credentials: true },
    sortSchema: true,
    installSubscriptionHandlers: true,
  },
  hello: 'world',
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
};
