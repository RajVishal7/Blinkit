import UserModel from "../models/user.models.js";
import jwt from 'jsonwebtoken'

const generatedRefreshToken = async(userId)=>{
    process.env.SECRET_KEY_REFRESH_TOKEN,
    {expiresIn : '7d'}

    const updateRefreshTokenUser = await UserModel.updateOne(
        { _id : userId} ,
        {
            refresh_token : token
        } 
    )
    return token
}
export default generatedRefreshToken