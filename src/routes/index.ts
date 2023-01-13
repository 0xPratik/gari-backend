import { Request, Response, Router } from 'express'
import CreateNFTRouter from "./createNFT"



const router = Router()

router.use('/nft', CreateNFTRouter)


export default router
