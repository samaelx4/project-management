import {ApiResponse } from '../utils/api-response.js'
import { asyncHadler } from '../utils/async-handler.js'

/*
const healthCheck = (req,res)=>{
    try {
        res
            .status(200)
            .json(
                new ApiResponse(200,{message:"Server is running"})
            )
    } catch (error) {
        
    }
}
*/

const healthCheck = asyncHadler(async(req,res)=>{
    res
        .status(200)
        .json(
            new ApiResponse(200,{message:"Server is running"})
        )
})

export {healthCheck}