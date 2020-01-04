# Go Barber - API

## About

This project was developed over the [Rocketseat bootcamp course](https://rocketseat.com.br/bootcamp) and it's part of my portifolio. It's an application that helps customers schedule appointments with service providers

## Integration

This API feed a [mobile app](https://github.com/CaioQuirinoMedeiros/go_barber_app), for customers, and an [web app](https://github.com/CaioQuirinoMedeiros/go_barber_web) for providers. Both built with React.

## Functionalities
- Authentication with email and password
- Upload avatar image

**:iphone: For customers**
- List service providers and their avaiable schedules
- Register/cancel an appointment with a service provider

**:computer: For providers**
- Show schedule
- Email/Notifications of new appointments

### Try it

I deployed this project on heroku, check it out: https://go-barber-api-caio.herokuapp.com

## Getting started

### :arrow_down: Installing

**Cloning the repo**

```shell
git clone https://github.com/CaioQuirinoMedeiros/go_barber_api.git

cd go_barber_api
```

**Installing dependencies**

```shell
npm install
```

### :wrench: Setting up

**Set the environment variables in a _.env_ file as exemplified in the _.env.example_**
- *Tip:* You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a fast and easy MongoDB cluser setup

**Create the postgres database (you can do it manually as well)**

```shell
npx sequelize db:create
```

**Run the migrations to create the needed tables**

```shell
npx sequelize db:migrate
```

**Note:**
run `npx sequelize --help` to see all sequelize can do

### :runner: Running

**Just start the server**

```shell
npm run dev
```
