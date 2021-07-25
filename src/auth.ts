import {User} from "./entity/User"
import {sign} from "jsonwebtoken"

export const createAccessToken = (user: User) => {
    return sign({userId: user.id}, 'Iryt73#%^f-d', {
        expiresIn: "15m"
    })
}

export const createRefreshToken = (user: User) => {
    return sign({userId: user.id}, 'qwijr732h7ui', {
        expiresIn: "7d"
    })
}