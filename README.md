<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>


# Run dev mode
1. clone repository
2. Execute
```
yarn install
```
3. Install Nest CLI
```
npm i -g @nestjs/cli
```
4. Deploy DB
```
docker-compose up -d
```

5. Clone file __.env.template__ and rename to __.env__

6. Fill in the environment variables defined in the ```.env```

7. Run de app in dev mode
```
yar start:dev
```

8. Rebuild the BD with the seed
```
http://localhost:3000/api/v2/seed
```


## Used stack
* Mongo DB
* NestJs