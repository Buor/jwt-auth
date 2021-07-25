import 'dotenv/config'
import express from "express"
import "reflect-metadata"
import {ApolloServer} from "apollo-server-express"
import {buildSchema} from "type-graphql"
import {UserResolver} from "./UserResolver"
import {createConnection} from "typeorm"
import cookieParser from "cookie-parser"
import {verify} from "jsonwebtoken"
import { User } from './entity/User'
import {createAccessToken, createRefreshToken} from "./auth"
import {sendRefreshToken} from "./sendRefreshTokem"

(async () => {
    const app = express()
    app.use(cookieParser())
    app.get('/', (_, res) => {
        res.send('hello')
    })

    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.jid
        if (!token) {
            return res.send({ok: false, accessToken: ""})
        }

        let payload: any = null
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
        } catch (err) {
            console.log(err)
            return res.send({ok: false, accessToken: ""})
        }

        //token is valid and we can send back an access token
        const user = await User.findOne({where: {id: payload.userId}});
        if(!user) {
            return res.send({ok: false, accessToken: ""})
        }

        if(user.tokenVersion !== payload.tokenVersion) {
            return res.send({ok: false, accessToken: ""})
        }

        sendRefreshToken(res,createRefreshToken(user));

        return res.send({ok: false, accessToken: createAccessToken(user)})

    })

    await createConnection()

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        context: ({req, res}) => ({req, res})
    })

    await apolloServer.start()
    apolloServer.applyMiddleware({app})

    app.listen(5000, () => {
        console.log('express server started')
    })
})()