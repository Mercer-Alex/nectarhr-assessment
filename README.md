# NectarHR Candidate Assessment

Thank you for your interest in working at NectarHR.
Here you'll find some basics for getting started with our assessment.

## Client
The client directory contains a skeleton Vue application.

The client is rendered as static files from the `server` all you really need
to do is build the client and the server will do the rest.

1. cd into `/client`
2. run `npm install`
3. run `npm run build`
   1. Alternatively run `npm run build-watch` which will allow your changes to be live loaded.

## Database
We've included a sqlite database with a very basic schema.  You can find it in `/server/prisma/schema.prisma`

We're using Prisma to handle migrations and our for our ORM.

To modify the database follow these steps:
1. Modify the `schema.prisma` file to make the required changes (add models, fields, etc.).
2. From a commandline cd into `/server`
3. Push the database changes by running `npm run db-push`
4. Generate Prisma Client to reflect the schema changes with `npx prisma generate`.


## Server
1. cd into `/server`
2. run `npm install`
3. run `npm run dev`

