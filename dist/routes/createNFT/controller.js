"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetNFTData = exports.handleGetAllNFTs = exports.NFT_NAME = exports.NFT_TYPE = exports.handleUpdateNFT = exports.handleCreateNFT = exports.handlePreMint = exports.handleCheckMinted = exports.AddDatatoDB = exports.getCount = exports.handleIsTypeMinted = void 0;
const PreSale_1 = __importDefault(require("../../models/PreSale"));
const spl_token_1 = require("@solana/spl-token");
const anchor = __importStar(require("@project-serum/anchor"));
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const web3_js_1 = require("@solana/web3.js");
const NFTs_1 = require("../../NFTs");
const mpl_token_metadata_2 = require("@metaplex-foundation/mpl-token-metadata");
const mpl_token_metadata_3 = require("@metaplex-foundation/mpl-token-metadata");
const axios_1 = __importDefault(require("axios"));
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const fee_payer_address = process.env.FEE_PAYER_ADDRESS ||
    "9kpML3MhVLPmASMDBYuaMzmFiCtdm3aityWu1pJZ1wR4";
const fee_payer = new anchor.web3.PublicKey(fee_payer_address);
const endpoint = process.env.ENDPOINT || "https://api.mainnet-beta.solana.com";
const connection = new anchor.web3.Connection(endpoint);
const updateAuthorityAddress = process.env.UPDATE_AUTHORITY_PUB_KEY ||
    "A5g1XNmPghrwjUbxtjumxiRbRK53xqYk2ujHoRtcpyzG";
const update_authority = new anchor.web3.PublicKey(updateAuthorityAddress);
const gariTokenMint = process.env.GARI_TOKEN_MINT || "7gjQaUHVdP8m7BvrFWyPkM7L3H9p4umwm3F56q1qyLk1";
const GariTokenMint = new anchor.web3.PublicKey(gariTokenMint);
const gariTreasuryATAAddress = process.env.GARI_TREASURY_ATA ||
    "CbsTsL5nBhe5LZ9fk9Ltcq5sYYiZVyRLL9WLJxNeBVM3";
const GariTreasuryATA = new anchor.web3.PublicKey(gariTreasuryATAAddress);
const handleIsTypeMinted = async (req, res) => {
    try {
        const { user } = req.params;
        if (user === null) {
            return res.status(400).send("No user Found");
        }
        if (user === undefined) {
            return res.status(400).send("No user Found");
        }
        const dbData = await PreSale_1.default.find({
            user: user,
        });
        if (dbData === null) {
            return res.status(400).send("No user Found");
        }
        let CreatorMinted = false;
        let UserMinted = false;
        dbData.find((data) => {
            if (data.type === "Creator") {
                CreatorMinted = true;
            }
            if (data.type === "User") {
                UserMinted = true;
            }
        });
        res.status(200).send({
            creator: CreatorMinted,
            user: UserMinted,
        });
    }
    catch (error) {
        console.log("ERRROR", error);
        res.status(400).send("There is an Error");
    }
};
exports.handleIsTypeMinted = handleIsTypeMinted;
const getCount = async (req, res) => {
    const { type } = req.params;
    if (!type) {
        return res.status(400).send("type is required");
    }
    try {
        const count = await PreSale_1.default.countDocuments({ type: type });
        if (!count) {
            return res.status(400).send("No Count Found");
        }
        res.status(200).send({
            count: 100 - count,
        });
    }
    catch (error) {
        console.log("ERROR", error);
        res.status(400).send("Error in Getting data");
    }
};
exports.getCount = getCount;
const AddDatatoDB = async (req, res) => {
    try {
        const { signature, user, pandaNFT, mint, type } = req.body;
        if (!signature && !user && !pandaNFT) {
            return res.status(400).send("Please provide all the fields");
        }
        const newData = new PreSale_1.default({
            transactionSignature: signature,
            mintAddress: mint,
            user: user,
            pandaMintAddress: pandaNFT,
            type: type,
        });
        const addedData = await newData.save();
        res.status(201).send({ data: addedData });
    }
    catch (error) {
        console.log(error);
        res.status(400).send("THere is an Error");
    }
};
exports.AddDatatoDB = AddDatatoDB;
const handleCheckMinted = async (req, res) => {
    try {
        const { userPublicKey } = req.params;
        console.log(userPublicKey);
        if (userPublicKey === undefined) {
            return res.status(400).send("No User in Query");
        }
        // const nftArray = await getParsedNftAccountsByOwner({
        //   publicAddress: userPublicKey,
        //   connection: connection,
        //   sanitize: true,
        //   stringifyPubKeys: true,
        // });
        // if (nftArray === undefined || nftArray === null) {
        //   return res.status(400).send("No NFTs Found in Wallet");
        // }
        // const PandaNFTs = nftArray.filter((nft) => {
        //   if (
        //     nft.updateAuthority ===
        //       "2qQE715qJQ9cJ2WZJNmQiNF8Hq8TGTA3St8cSvSvtwzA" ||
        //     nft.updateAuthority === "H3txuY3VR14WMgBbXKQbyDWGsdAMxhC1kUQfPowXAww7"
        //   ) {
        //     return nft;
        //   }
        // });
        // if (PandaNFTs.length === 0) {
        //   return res.status(400).send("You Dont Own Any Panda NFT");
        // }
        // const dbData = await PreSale.findOne({
        //   user: userPublicKey,
        // });
        // if (dbData !== null) {
        //   const found = PandaNFTs.find((nft) => {
        //     if (nft.mint === dbData.pandaMintAddress) {
        //       return true;
        //     }
        //   });
        //   if (found) {
        //     return res.status(200).json({
        //       isMinted: true,
        //     });
        //   }
        // }
        res.status(200).json({
            isMinted: false,
        });
    }
    catch (error) {
        console.log("Check Minted Error", error);
        res.status(400).send("There is some Issue with Minting");
    }
};
exports.handleCheckMinted = handleCheckMinted;
const EGariToUsdtUrls = {
    HUOBI: "https://api.huobi.pro/market/trade?symbol=gariusdt&type=step1",
    KUCOIN: "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=GARI-USDT",
    OKEX: "https://www.okex.com/api/v5/market/ticker?instId=GARI-USDT",
};
const handlePreMint = async (req, res) => {
    try {
        let { userPublicKey, type } = req.body;
        const count = await PreSale_1.default.countDocuments({ type: type });
        if (count >= 100) {
            return res.status(400).send("There is no more NFTs left");
        }
        let convertedGariUsdt = 0;
        const gariTousdtResult = await Promise.any(Object.keys(EGariToUsdtUrls).map(async (key) => {
            const res = await axios_1.default.get(EGariToUsdtUrls[key]);
            return res;
        }));
        switch (gariTousdtResult.config.url) {
            case EGariToUsdtUrls.HUOBI:
                convertedGariUsdt = gariTousdtResult.data.tick.data[0].price * 1;
                break;
            case EGariToUsdtUrls.KUCOIN:
                convertedGariUsdt = gariTousdtResult.data.data.price * 1;
                break;
            case EGariToUsdtUrls.OKEX:
                convertedGariUsdt = gariTousdtResult.data.data[0].last * 1;
                break;
        }
        console.log("RATE", convertedGariUsdt);
        if (convertedGariUsdt <= 0) {
            return res.status(400).send("usdToGari must be greater than 0");
        }
        if (userPublicKey === undefined || userPublicKey === null) {
            return res.status(400).send("User Key is Undefined or Null");
        }
        const user = new web3_js_1.PublicKey(userPublicKey);
        // const nftArray = await getParsedNftAccountsByOwner({
        //   publicAddress: userPublicKey,
        //   connection: connection,
        //   sanitize: true,
        //   stringifyPubKeys: true,
        // });
        // if (nftArray === undefined || nftArray === null) {
        //   return res.status(400).send("No NFTs Found in Wallet");
        // }
        // console.log("ALL NFTS", nftArray);
        // const PandaNFTs = nftArray.filter((nft) => {
        //   if (
        //     nft.updateAuthority ===
        //       "2qQE715qJQ9cJ2WZJNmQiNF8Hq8TGTA3St8cSvSvtwzA" ||
        //     nft.updateAuthority === "H3txuY3VR14WMgBbXKQbyDWGsdAMxhC1kUQfPowXAww7"
        //   ) {
        //     return nft;
        //   }
        // });
        // console.log("PANDA NFT", PandaNFTs);
        // if (PandaNFTs.length === 0) {
        //   return res.status(400).send("You Dont Own Any Panda NFT");
        // }
        // const dbData = await PreSale.findOne({
        //   user: userPublicKey,
        // });
        // if (dbData !== null) {
        //   if (dbData.pandaMintAddress === PandaNFTs[0]) {
        //     return res.status(400).send("You already have Minted a Badge");
        //   }
        // }
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        const transaction = new web3_js_1.Transaction({
            recentBlockhash: blockhash,
            // The buyer pays the transaction fee
            feePayer: user,
        });
        const mintKey = anchor.web3.Keypair.generate();
        const lamports = await connection.getMinimumBalanceForRentExemption(spl_token_1.MINT_SIZE);
        let ata = await (0, spl_token_1.getAssociatedTokenAddress)(mintKey.publicKey, // mint
        user // owner
        );
        let priceofMinting = 500;
        if (process.env.PRICE !== undefined) {
            priceofMinting = parseInt(process.env.PRICE) || 500; // THis is in dollar
        }
        if (priceofMinting === 0) {
            return res.status(400).send("Price of minting is not set");
        }
        const amount = priceofMinting / convertedGariUsdt; // This is in Gari
        const final_amount = Math.ceil(amount * anchor.web3.LAMPORTS_PER_SOL);
        const userGariTokenAta = await (0, spl_token_1.getAssociatedTokenAddress)(GariTokenMint, // mint
        user // owner
        );
        const GariTransferToTreasury = (0, spl_token_1.createTransferCheckedInstruction)(userGariTokenAta, GariTokenMint, GariTreasuryATA, user, final_amount, 9);
        transaction.add(GariTransferToTreasury);
        transaction.add(anchor.web3.SystemProgram.createAccount({
            fromPubkey: user,
            newAccountPubkey: mintKey.publicKey,
            space: spl_token_1.MINT_SIZE,
            lamports,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeMintInstruction)(mintKey.publicKey, // mint pubkey
        0, // decimals
        user, // mint authority
        user // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        ), (0, spl_token_1.createAssociatedTokenAccountInstruction)(user, ata, user, mintKey.publicKey), (0, spl_token_1.createMintToInstruction)(mintKey.publicKey, // mint
        ata, user, 1));
        const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress([
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKey.publicKey.toBuffer(),
        ], TOKEN_METADATA_PROGRAM_ID);
        const [masterKey] = await anchor.web3.PublicKey.findProgramAddress([
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKey.publicKey.toBuffer(),
            Buffer.from("edition"),
        ], TOKEN_METADATA_PROGRAM_ID);
        const nfts = NFTs_1.NFTs[type];
        if (nfts === undefined) {
            return res.status(400).send("NFTs are Undefined");
        }
        let nft = undefined;
        if (type === "Creator") {
            nft = nfts["BasicCreatorBadge"];
        }
        else if (type === "User") {
            nft = nfts["BasicUserBadge"];
        }
        const data = {
            name: nft.name,
            symbol: nft.symbol,
            uri: nft.uri,
            sellerFeeBasisPoints: 500,
            creators: [
                {
                    address: user,
                    verified: false,
                    share: 100,
                },
            ],
            collection: null,
            uses: null,
        };
        const args = {
            data,
            isMutable: true,
        };
        const createMetadataV2 = (0, mpl_token_metadata_2.createCreateMetadataAccountV2Instruction)({
            metadata: metadatakey,
            mint: mintKey.publicKey,
            mintAuthority: user,
            payer: user,
            updateAuthority: user,
        }, {
            createMetadataAccountArgsV2: args,
        });
        transaction.add(createMetadataV2);
        const createMasterEditionV3 = (0, mpl_token_metadata_3.createCreateMasterEditionV3Instruction)({
            edition: masterKey,
            mint: mintKey.publicKey,
            updateAuthority: user,
            mintAuthority: user,
            payer: user,
            metadata: metadatakey,
        }, {
            createMasterEditionArgs: {
                maxSupply: new anchor.BN(0),
            },
        });
        transaction.add(createMasterEditionV3);
        const updatedData = {
            name: nft.name,
            symbol: nft.symbol,
            uri: nft.uri,
            sellerFeeBasisPoints: 500,
            creators: [
                {
                    address: update_authority,
                    verified: false,
                    share: 100,
                },
            ],
            collection: null,
            uses: null,
        };
        const accounts = {
            metadata: metadatakey,
            updateAuthority: user,
        };
        const updateargs = {
            updateMetadataAccountArgsV2: {
                data: updatedData,
                updateAuthority: update_authority,
                primarySaleHappened: true,
                isMutable: true,
            },
        };
        const updateMetadataAccount = (0, mpl_token_metadata_1.createUpdateMetadataAccountV2Instruction)(accounts, updateargs);
        transaction.add(updateMetadataAccount);
        transaction.partialSign(mintKey);
        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
        });
        const base64 = serializedTransaction.toString("base64");
        res.status(200).json({
            transaction: base64,
            mint: mintKey.publicKey.toString(),
        });
    }
    catch (error) {
        console.log("Pre Minting error", error);
        res.status(400).send(error);
    }
};
exports.handlePreMint = handlePreMint;
const handleCreateNFT = async (req, res) => {
    let { usdToGari, userPublicKey, badge, type, feePayer } = req.body;
    if (!feePayer) {
        feePayer = fee_payer_address;
    }
    if (!badge || !type) {
        return res.status(400).send("Badge and type are required");
    }
    if (!userPublicKey) {
        res.status(400).json({ error: "No account provided" });
        return;
    }
    const feePayerAddress = new web3_js_1.PublicKey(feePayer);
    const user = new web3_js_1.PublicKey(userPublicKey);
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    const transaction = new web3_js_1.Transaction({
        recentBlockhash: blockhash,
        // The buyer pays the transaction fee
        feePayer: feePayerAddress,
    });
    const mintKey = anchor.web3.Keypair.generate();
    try {
        const lamports = await connection.getMinimumBalanceForRentExemption(spl_token_1.MINT_SIZE);
        let ata = await (0, spl_token_1.getAssociatedTokenAddress)(mintKey.publicKey, // mint
        user // owner
        );
        let priceofMinting = 0;
        if (process.env.PRICE !== undefined) {
            priceofMinting = parseInt(process.env.PRICE) || 500; // THis is in dollar
        }
        if (priceofMinting === 0) {
            return res.status(400).send("Price of minting is not set");
        }
        const amount = priceofMinting / usdToGari; // This is in Gari
        const final_amount = Math.ceil(amount * anchor.web3.LAMPORTS_PER_SOL);
        // const VALID_BYTES = 3 * 1024;
        // const additionalComputeBudgetInstruction =
        //   ComputeBudgetProgram.requestHeapFrame({
        //     bytes: VALID_BYTES,
        //   });
        const userGariTokenAta = await (0, spl_token_1.getAssociatedTokenAddress)(GariTokenMint, // mint
        user // owner
        );
        // console.log("USER ATA", userGariTokenAta.toString());
        const GariTransferToTreasury = (0, spl_token_1.createTransferCheckedInstruction)(userGariTokenAta, GariTokenMint, GariTreasuryATA, user, final_amount, 9);
        transaction.add(GariTransferToTreasury);
        transaction.add(anchor.web3.SystemProgram.createAccount({
            fromPubkey: feePayerAddress,
            newAccountPubkey: mintKey.publicKey,
            space: spl_token_1.MINT_SIZE,
            lamports,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeMintInstruction)(mintKey.publicKey, // mint pubkey
        0, // decimals
        user, // mint authority
        user // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        ), (0, spl_token_1.createAssociatedTokenAccountInstruction)(feePayerAddress, ata, user, mintKey.publicKey), (0, spl_token_1.createMintToInstruction)(mintKey.publicKey, // mint
        ata, user, 1));
        const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress([
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKey.publicKey.toBuffer(),
        ], TOKEN_METADATA_PROGRAM_ID);
        const [masterKey] = await anchor.web3.PublicKey.findProgramAddress([
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKey.publicKey.toBuffer(),
            Buffer.from("edition"),
        ], TOKEN_METADATA_PROGRAM_ID);
        const nfts = NFTs_1.NFTs[type];
        if (nfts === undefined) {
            return res.status(400).send("NFTs are Undefined");
        }
        const nft = nfts[badge];
        if (nft === undefined) {
            return res.status(400).send("No NFT Found with this Type and Badge");
        }
        const data = {
            name: nft.name,
            symbol: nft.symbol,
            uri: nft.uri,
            sellerFeeBasisPoints: 500,
            creators: [
                {
                    address: user,
                    verified: false,
                    share: 100,
                },
            ],
            collection: null,
            uses: null,
        };
        const args = {
            data,
            isMutable: true,
        };
        const createMetadataV2 = (0, mpl_token_metadata_2.createCreateMetadataAccountV2Instruction)({
            metadata: metadatakey,
            mint: mintKey.publicKey,
            mintAuthority: user,
            payer: feePayerAddress,
            updateAuthority: user,
        }, {
            createMetadataAccountArgsV2: args,
        });
        transaction.add(createMetadataV2);
        const createMasterEditionV3 = (0, mpl_token_metadata_3.createCreateMasterEditionV3Instruction)({
            edition: masterKey,
            mint: mintKey.publicKey,
            updateAuthority: user,
            mintAuthority: user,
            payer: feePayerAddress,
            metadata: metadatakey,
        }, {
            createMasterEditionArgs: {
                maxSupply: new anchor.BN(0),
            },
        });
        transaction.add(createMasterEditionV3);
        const updatedData = {
            name: nft.name,
            symbol: nft.symbol,
            uri: nft.uri,
            sellerFeeBasisPoints: 500,
            creators: [
                {
                    address: update_authority,
                    verified: false,
                    share: 100,
                },
            ],
            collection: null,
            uses: null,
        };
        const accounts = {
            metadata: metadatakey,
            updateAuthority: user,
        };
        const updateargs = {
            updateMetadataAccountArgsV2: {
                data: updatedData,
                updateAuthority: update_authority,
                primarySaleHappened: true,
                isMutable: true,
            },
        };
        const updateMetadataAccount = (0, mpl_token_metadata_1.createUpdateMetadataAccountV2Instruction)(accounts, updateargs);
        transaction.add(updateMetadataAccount);
        // const collectionMint = new anchor.web3.PublicKey(
        //   "3ujq52DX5vxH6YhCBdATaVKw3ZFPmgmtpqLiMJYsxQWV"
        // );
        // const [collmetadatakey] = await anchor.web3.PublicKey.findProgramAddress(
        //   [
        //     Buffer.from("metadata"),
        //     TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        //     collectionMint.toBuffer(),
        //   ],
        //   TOKEN_METADATA_PROGRAM_ID
        // );
        // const [collmasterKey] = await anchor.web3.PublicKey.findProgramAddress(
        //   [
        //     Buffer.from("metadata"),
        //     TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        //     collectionMint.toBuffer(),
        //     Buffer.from("edition"),
        //   ],
        //   TOKEN_METADATA_PROGRAM_ID
        // );
        // const collectionAccounts: SetAndVerifyCollectionInstructionAccounts = {
        //   metadata: metadatakey,
        //   updateAuthority: update_authority,
        //   collectionAuthority: update_authority,
        //   payer: fee_payer,
        //   collectionMint: collectionMint,
        //   collectionMasterEditionAccount: collmasterKey,
        //   collection: collmetadatakey,
        // };
        // const CollectionIx =
        //   createSetAndVerifyCollectionInstruction(collectionAccounts);
        // const memoData = "Gari Mining Memo ix";
        // const memoIx = new anchor.web3.TransactionInstruction({
        //   keys: [{ pubkey: user, isSigner: true, isWritable: true }],
        //   data: Buffer.from(memoData, "utf-8"),
        //   programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        // });
        // transaction.add(CollectionIx);
        // transaction.add(memoIx);
        // transaction.addSignature();
        transaction.partialSign(mintKey);
        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
        });
        const base64 = serializedTransaction.toString("base64");
        res.status(200).json({
            transaction: base64,
        });
    }
    catch (error) {
        console.log("ERROR HERE", error);
        res.status(400).send(error);
    }
};
exports.handleCreateNFT = handleCreateNFT;
const handleUpdateNFT = async (req, res) => {
    const { usdToGari, userPublicKey, mint, badge, type } = req.body;
    if (!badge || !type) {
        return res.status(400).send("Badge and type are required");
    }
    if (!userPublicKey || !mint) {
        res.status(400).send("Missing account or mint");
    }
    const nfts = NFTs_1.NFTs[type];
    const nft = nfts[badge];
    if (nft === null || nft === undefined) {
        return res.status(400).send("NFT Data Not Found");
    }
    if (nft.nextLevel === undefined) {
        return res.status(400).send("Max Upgradation Done");
    }
    const update_nft_data = nfts[nft.nextLevel];
    const user = new web3_js_1.PublicKey(userPublicKey);
    const mintKey = new web3_js_1.PublicKey(mint);
    try {
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        const transaction = new web3_js_1.Transaction({
            recentBlockhash: blockhash,
            // The buyer pays the transaction fee
            feePayer: fee_payer,
        });
        const memoData = "GARI MINING";
        const memoIx = new anchor.web3.TransactionInstruction({
            keys: [{ pubkey: user, isSigner: true, isWritable: true }],
            data: Buffer.from(memoData, "utf-8"),
            programId: new web3_js_1.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        });
        const userGariTokenAta = await (0, spl_token_1.getAssociatedTokenAddress)(GariTokenMint, // mint
        user // owner
        );
        let priceofMinting = 0;
        if (process.env.PRICE !== undefined) {
            priceofMinting = parseInt(process.env.PRICE) || 500; // THis is in dollar
        }
        if (priceofMinting === 0) {
            return res.status(400).send("Price of minting is not set");
        }
        const amount = priceofMinting / usdToGari; // This is in Gari
        const final_amount = Math.ceil(amount * anchor.web3.LAMPORTS_PER_SOL);
        const GariTransferToTreasury = (0, spl_token_1.createTransferCheckedInstruction)(userGariTokenAta, GariTokenMint, GariTreasuryATA, user, final_amount, 9);
        transaction.add(GariTransferToTreasury);
        const creatorsAddresses = [
            {
                address: update_authority,
                verified: false,
                share: 100,
            },
        ];
        const data = {
            name: update_nft_data.name,
            symbol: update_nft_data.symbol,
            uri: update_nft_data.uri,
            sellerFeeBasisPoints: 500,
            creators: creatorsAddresses,
            collection: null,
            uses: null,
        };
        const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress([
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKey.toBuffer(),
        ], TOKEN_METADATA_PROGRAM_ID);
        const accounts = {
            metadata: metadatakey,
            updateAuthority: update_authority,
        };
        const updateargs = {
            updateMetadataAccountArgsV2: {
                data: data,
                updateAuthority: update_authority,
                primarySaleHappened: true,
                isMutable: true,
            },
        };
        const updateMetadataAccount = (0, mpl_token_metadata_1.createUpdateMetadataAccountV2Instruction)(accounts, updateargs);
        transaction.add(updateMetadataAccount);
        const updateAuthorityWallet = process.env.UPDATE_AUTHORITY;
        if (!updateAuthorityWallet) {
            return res.status(400).send("UPdate AUthority Not Found");
        }
        const updateAuthoritySign = anchor.web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(updateAuthorityWallet)));
        transaction.add(memoIx);
        transaction.partialSign(updateAuthoritySign);
        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
        });
        const base64 = serializedTransaction.toString("base64");
        res.status(200).json({
            transaction: base64,
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};
exports.handleUpdateNFT = handleUpdateNFT;
var NFT_TYPE;
(function (NFT_TYPE) {
    NFT_TYPE["Creator"] = "Creator";
    NFT_TYPE["User"] = "User";
})(NFT_TYPE = exports.NFT_TYPE || (exports.NFT_TYPE = {}));
var NFT_NAME;
(function (NFT_NAME) {
    NFT_NAME["BasicCreatorBadge"] = "BasicCreatorBadge";
    NFT_NAME["BronzeCreatorBadge"] = "BronzeCreatorBadge";
    NFT_NAME["SilverCreatorBadge"] = "SilverCreatorBadge";
    NFT_NAME["GoldCreatorBadge"] = "GoldCreatorBadge";
    NFT_NAME["BasicUserBadge"] = "BasicUserBadge";
    NFT_NAME["BronzeUserBadge"] = "BronzeUserBadge";
    NFT_NAME["SilverUserBadge"] = "SilverUserBadge";
    NFT_NAME["GoldUserBadge"] = "GoldUserBadge";
})(NFT_NAME = exports.NFT_NAME || (exports.NFT_NAME = {}));
const handleGetAllNFTs = async (req, res) => {
    res.status(200).send(NFTs_1.NFTs);
};
exports.handleGetAllNFTs = handleGetAllNFTs;
const handleGetNFTData = async (req, res) => {
    const name = req.query.name;
    const type = req.query.type;
    console.log("NAME", name);
    console.log("TYPE", type);
    if (name === undefined || type === undefined) {
        return res.status(400).send("Missing name or type");
    }
    const nfts = NFTs_1.NFTs[type];
    if (nfts == undefined) {
        return res.status(400).send("Invalid type");
    }
    const nft = nfts[name];
    if (nft !== undefined) {
        res.status(200).send(nft);
    }
};
exports.handleGetNFTData = handleGetNFTData;
