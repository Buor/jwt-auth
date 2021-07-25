import {Arg, Field, Mutation, ObjectType, Query, Resolver} from "type-graphql"
import {hash, compare} from 'bcryptjs'
import {User} from "./entity/User"

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'Hi'
    }

    @Query(() => [User])
    users() {
        return User.find()
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
    ): Promise<LoginResponse> {
        const user = await User.findOne({where: {email}})

        if (!user) {
            throw new Error('could not find user')

        }

        const valid = compare(password, user.password)

        if (!valid) {
            throw new Error('bad password')
        }

        //login successful

        return {
            accessToken: ''
        }
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string,
    ) {
        const hashedPassword = await hash(password, 7)

        try {
            await User.insert({
                email,
                password: hashedPassword
            })
        } catch (err) {
            console.log(err)
            return false
        }


        return true
    }
}