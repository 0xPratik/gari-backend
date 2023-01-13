import { Router } from "express";
import {
  handleCreateNFT,
  handleGetNFTData,
  handleUpdateNFT,
  handleGetAllNFTs,
  handlePreMint,
  AddDatatoDB,
  handleCheckMinted,
  getCount,
  handleIsTypeMinted,
} from "./controller";

const router = Router();

router.get("/", handleGetAllNFTs);
router.get("/isCheck/:user", handleIsTypeMinted);
router.get("/count/:type", getCount);
router.get("/pre/:userPublicKey", handleCheckMinted);
router.post("/adddata", AddDatatoDB);
router.get("/nftdata", handleGetNFTData);
router.post("/premint", handlePreMint);
router.post("/create", handleCreateNFT);
router.post("/update", handleUpdateNFT);

export default router;
