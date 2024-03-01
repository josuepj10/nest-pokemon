
// This file is used to define the environment variables that will be used in the application.
export const EnvConfiguration = () => ({


    enviroment: process.env.NODE_ENV || 'dev',
    mongodb: process.env.MONGODB,
    port: process.env.PORT || 3002, 
    defaultLimit: +process.env.DEFAULT_LIMIT || 7, //default limit for pagination

})