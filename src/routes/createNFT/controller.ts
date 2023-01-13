import { Request, Response } from "express";
import PreSale from "../../models/PreSale";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferCheckedInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import {
  createUpdateMetadataAccountV2Instruction,
  UpdateMetadataAccountV2InstructionArgs,
  UpdateMetadataAccountV2InstructionAccounts,
  createSetAndVerifyCollectionInstruction,
  SetAndVerifyCollectionInstructionAccounts,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { NFTs } from "../../NFTs";
import {
  createCreateMetadataAccountV2Instruction,
  DataV2,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  CreateMetadataAccountV2InstructionArgs,
  createCreateMasterEditionV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import axios from "axios";
import { send } from "process";
export type MakeTransactionInputData = {
  userPublicKey: string;
  usdToGari?: number;
  chingariPublicKey?: string;
  chingariCommisionPublicKey?: string;
  badge: NFT_NAME;
  type: NFT_TYPE;
  feePayer?: string;
};

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const fee_payer_address: string =
  process.env.FEE_PAYER_ADDRESS ||
  "9kpML3MhVLPmASMDBYuaMzmFiCtdm3aityWu1pJZ1wR4";

const fee_payer = new anchor.web3.PublicKey(fee_payer_address);

const endpoint = process.env.ENDPOINT || "https://api.mainnet-beta.solana.com";
const connection = new anchor.web3.Connection(endpoint);
const updateAuthorityAddress =
  process.env.UPDATE_AUTHORITY_PUB_KEY ||
  "A5g1XNmPghrwjUbxtjumxiRbRK53xqYk2ujHoRtcpyzG";
const update_authority = new anchor.web3.PublicKey(updateAuthorityAddress);
const gariTokenMint =
  process.env.GARI_TOKEN_MINT || "7gjQaUHVdP8m7BvrFWyPkM7L3H9p4umwm3F56q1qyLk1";

const GariTokenMint = new anchor.web3.PublicKey(gariTokenMint);

const gariTreasuryATAAddress =
  process.env.GARI_TREASURY_ATA ||
  "CbsTsL5nBhe5LZ9fk9Ltcq5sYYiZVyRLL9WLJxNeBVM3";
const GariTreasuryATA = new anchor.web3.PublicKey(gariTreasuryATAAddress);

export interface IPreMintingBody {
  usdToGari: number;
  userPublicKey: string;
  type: NFT_TYPE;
}

export interface IAddData {
  signature: string;
  user: string;
  pandaNFT: string;
  mint: string;
  type: string;
}

export const handleIsTypeMinted = async (req: Request, res: Response) => {
  try {
    const { user } = req.params;

    if (user === null) {
      return res.status(400).send("No user Found");
    }

    if (user === undefined) {
      return res.status(400).send("No user Found");
    }

    const dbData = await PreSale.find({
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
  } catch (error) {
    console.log("ERRROR", error);
    res.status(400).send("There is an Error");
  }
};

export const getCount = async (req: Request, res: Response) => {
  const { type } = req.params;

  if (!type) {
    return res.status(400).send("type is required");
  }
  try {
    const count = await PreSale.countDocuments({ type: type });

    if (!count) {
      return res.status(400).send("No Count Found");
    }

    res.status(200).send({
      count: 100 - count,
    });
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).send("Error in Getting data");
  }
};

export const AddDatatoDB = async (req: Request, res: Response) => {
  try {
    const { signature, user, pandaNFT, mint, type } = req.body as IAddData;

    if (!signature && !user && !pandaNFT) {
      return res.status(400).send("Please provide all the fields");
    }

    const newData = new PreSale({
      transactionSignature: signature,
      mintAddress: mint,
      user: user,
      pandaMintAddress: pandaNFT,
      type: type,
    });

    const addedData = await newData.save();
    res.status(201).send({ data: addedData });
  } catch (error) {
    console.log(error);
    res.status(400).send("THere is an Error");
  }
};

export const handleCheckMinted = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.log("Check Minted Error", error);
    res.status(400).send("There is some Issue with Minting");
  }
};

const EGariToUsdtUrls: any = {
  HUOBI:
    "https://api.huobi.pro/market/trade?symbol=gariusdt&type=step1" as string,
  KUCOIN:
    "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=GARI-USDT" as string,
  OKEX: "https://www.okex.com/api/v5/market/ticker?instId=GARI-USDT" as string,
};

export const handlePreMint = async (req: Request, res: Response) => {
  try {
    let { userPublicKey, type } = req.body as IPreMintingBody;

    if (!userPublicKey || !type) {
      return res.status(400).send("Please provide all the fields");
    }

    const count = await PreSale.countDocuments({ type: type });

    if (count >= 100) {
      return res.status(400).send("There is no more NFTs left");
    }

    const dbData = await PreSale.find({
      user: userPublicKey,
    });

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

    if (CreatorMinted && UserMinted) {
      return res
        .status(400)
        .send("You have Already Minted Creator and User NFT");
    }

    let convertedGariUsdt = 0;
    const gariTousdtResult: any = await Promise.any(
      Object.keys(EGariToUsdtUrls).map(async (key) => {
        const res = await axios.get(EGariToUsdtUrls[key]);
        return res;
      })
    );

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

    const user = new PublicKey(userPublicKey);

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

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      // The buyer pays the transaction fee
      feePayer: user,
    });

    const mintKey = anchor.web3.Keypair.generate();

    const lamports = await connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

    let ata = await getAssociatedTokenAddress(
      mintKey.publicKey, // mint
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

    const userGariTokenAta = await getAssociatedTokenAddress(
      GariTokenMint, // mint
      user // owner
    );

    const GariTransferToTreasury = createTransferCheckedInstruction(
      userGariTokenAta,
      GariTokenMint,
      GariTreasuryATA,
      user,
      final_amount,
      9
    );

    transaction.add(GariTransferToTreasury);

    transaction.add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: user,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKey.publicKey, // mint pubkey
        0, // decimals
        user, // mint authority
        user // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      ),
      createAssociatedTokenAccountInstruction(
        user,
        ata,
        user,
        mintKey.publicKey
      ),
      createMintToInstruction(
        mintKey.publicKey, // mint
        ata,
        user,
        1
      )
    );

    const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKey.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [masterKey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKey.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const nfts: any = NFTs[type];

    if (nfts === undefined) {
      return res.status(400).send("NFTs are Undefined");
    }

    let nft = undefined;
    if (type === "Creator") {
      nft = nfts["BasicCreatorBadge"];
    } else if (type === "User") {
      nft = nfts["BasicUserBadge"];
    }

    const data: DataV2 = {
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

    const createMetadataV2 = createCreateMetadataAccountV2Instruction(
      {
        metadata: metadatakey,
        mint: mintKey.publicKey,
        mintAuthority: user,
        payer: user,
        updateAuthority: user,
      },
      {
        createMetadataAccountArgsV2: args,
      }
    );

    transaction.add(createMetadataV2);

    const createMasterEditionV3 = createCreateMasterEditionV3Instruction(
      {
        edition: masterKey,
        mint: mintKey.publicKey,
        updateAuthority: user,
        mintAuthority: user,
        payer: user,
        metadata: metadatakey,
      },
      {
        createMasterEditionArgs: {
          maxSupply: new anchor.BN(0),
        },
      }
    );
    transaction.add(createMasterEditionV3);

    const updatedData: DataV2 = {
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

    const accounts: UpdateMetadataAccountV2InstructionAccounts = {
      metadata: metadatakey,
      updateAuthority: user,
    };

    const updateargs: UpdateMetadataAccountV2InstructionArgs = {
      updateMetadataAccountArgsV2: {
        data: updatedData,
        updateAuthority: update_authority,
        primarySaleHappened: true,
        isMutable: true,
      },
    };

    const updateMetadataAccount = createUpdateMetadataAccountV2Instruction(
      accounts,
      updateargs
    );

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
  } catch (error) {
    console.log("Pre Minting error", error);
    res.status(400).send(error);
  }
};

export const handleCreateNFT = async (req: Request, res: Response) => {
  let { userPublicKey, badge, type, feePayer } =
    req.body as MakeTransactionInputData;

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

  const feePayerAddress = new PublicKey(feePayer);
  const user = new PublicKey(userPublicKey);

  const { blockhash } = await connection.getLatestBlockhash("finalized");

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    // The buyer pays the transaction fee
    feePayer: feePayerAddress,
  });

  const mintKey = anchor.web3.Keypair.generate();

  try {
    const lamports = await connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

    let ata = await getAssociatedTokenAddress(
      mintKey.publicKey, // mint
      user // owner
    );
    let priceofMinting = 0;
    // if (process.env.PRICE !== undefined) {
    //   priceofMinting = parseInt(process.env.PRICE) || 500; // THis is in dollar
    // }

    // if (priceofMinting === 0) {
    //   return res.status(400).send("Price of minting is not set");
    // }

    // const amount = priceofMinting / usdToGari; // This is in Gari

    // const final_amount = Math.ceil(amount * anchor.web3.LAMPORTS_PER_SOL);

    // const VALID_BYTES = 3 * 1024;
    // const additionalComputeBudgetInstruction =
    //   ComputeBudgetProgram.requestHeapFrame({
    //     bytes: VALID_BYTES,
    //   });

    const userGariTokenAta = await getAssociatedTokenAddress(
      GariTokenMint, // mint
      user // owner
    );

    // console.log("USER ATA", userGariTokenAta.toString());

    // const GariTransferToTreasury = createTransferCheckedInstruction(
    //   userGariTokenAta,
    //   GariTokenMint,
    //   GariTreasuryATA,
    //   user,
    //   final_amount,
    //   9
    // );

    // transaction.add(GariTransferToTreasury);

    transaction.add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: feePayerAddress,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKey.publicKey, // mint pubkey
        0, // decimals
        user, // mint authority
        user // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      ),
      createAssociatedTokenAccountInstruction(
        feePayerAddress,
        ata,
        user,
        mintKey.publicKey
      ),
      createMintToInstruction(
        mintKey.publicKey, // mint
        ata,
        user,
        1
      )
    );

    const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKey.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [masterKey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKey.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const nfts: any = NFTs[type];

    if (nfts === undefined) {
      return res.status(400).send("NFTs are Undefined");
    }

    const nft = nfts[badge];

    if (nft === undefined) {
      return res.status(400).send("No NFT Found with this Type and Badge");
    }

    const data: DataV2 = {
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

    const createMetadataV2 = createCreateMetadataAccountV2Instruction(
      {
        metadata: metadatakey,
        mint: mintKey.publicKey,
        mintAuthority: user,
        payer: feePayerAddress,
        updateAuthority: user,
      },
      {
        createMetadataAccountArgsV2: args,
      }
    );

    transaction.add(createMetadataV2);

    const createMasterEditionV3 = createCreateMasterEditionV3Instruction(
      {
        edition: masterKey,
        mint: mintKey.publicKey,
        updateAuthority: user,
        mintAuthority: user,
        payer: feePayerAddress,
        metadata: metadatakey,
      },
      {
        createMasterEditionArgs: {
          maxSupply: new anchor.BN(0),
        },
      }
    );
    transaction.add(createMasterEditionV3);

    const updatedData: DataV2 = {
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

    const accounts: UpdateMetadataAccountV2InstructionAccounts = {
      metadata: metadatakey,
      updateAuthority: user,
    };

    const updateargs: UpdateMetadataAccountV2InstructionArgs = {
      updateMetadataAccountArgsV2: {
        data: updatedData,
        updateAuthority: update_authority,
        primarySaleHappened: true,
        isMutable: true,
      },
    };

    const updateMetadataAccount = createUpdateMetadataAccountV2Instruction(
      accounts,
      updateargs
    );

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
  } catch (error) {
    console.log("ERROR HERE", error);
    res.status(400).send(error);
  }
};

interface HandleUpdateNFTInput {
  userPublicKey: string;
  mint: string;
  badge: NFT_NAME;
  type: NFT_TYPE;
  usdToGari: number;
}

export const handleUpdateNFT = async (req: Request, res: Response) => {
  const { usdToGari, userPublicKey, mint, badge, type } =
    req.body as HandleUpdateNFTInput;

  if (!badge || !type) {
    return res.status(400).send("Badge and type are required");
  }

  if (!userPublicKey || !mint) {
    res.status(400).send("Missing account or mint");
  }

  const nfts: any = NFTs[type];
  const nft = nfts[badge];

  if (nft === null || nft === undefined) {
    return res.status(400).send("NFT Data Not Found");
  }

  if (nft.nextLevel === undefined) {
    return res.status(400).send("Max Upgradation Done");
  }

  const update_nft_data = nfts[nft.nextLevel];

  const user = new PublicKey(userPublicKey);
  const mintKey = new PublicKey(mint);

  try {
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      // The buyer pays the transaction fee
      feePayer: fee_payer,
    });

    const memoData = "GARI MINING";

    const memoIx = new anchor.web3.TransactionInstruction({
      keys: [{ pubkey: user, isSigner: true, isWritable: true }],
      data: Buffer.from(memoData, "utf-8"),
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    });

    const userGariTokenAta = await getAssociatedTokenAddress(
      GariTokenMint, // mint
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

    const GariTransferToTreasury = createTransferCheckedInstruction(
      userGariTokenAta,
      GariTokenMint,
      GariTreasuryATA,
      user,
      final_amount,
      9
    );

    transaction.add(GariTransferToTreasury);

    const creatorsAddresses = [
      {
        address: update_authority,
        verified: false,
        share: 100,
      },
    ];

    const data: DataV2 = {
      name: update_nft_data.name,
      symbol: update_nft_data.symbol,
      uri: update_nft_data.uri,
      sellerFeeBasisPoints: 500,
      creators: creatorsAddresses,
      collection: null,
      uses: null,
    };

    const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const accounts: UpdateMetadataAccountV2InstructionAccounts = {
      metadata: metadatakey,
      updateAuthority: update_authority,
    };

    const updateargs: UpdateMetadataAccountV2InstructionArgs = {
      updateMetadataAccountArgsV2: {
        data: data,
        updateAuthority: update_authority,
        primarySaleHappened: true,
        isMutable: true,
      },
    };

    const updateMetadataAccount = createUpdateMetadataAccountV2Instruction(
      accounts,
      updateargs
    );

    transaction.add(updateMetadataAccount);

    const updateAuthorityWallet = process.env.UPDATE_AUTHORITY;
    if (!updateAuthorityWallet) {
      return res.status(400).send("UPdate AUthority Not Found");
    }
    const updateAuthoritySign = anchor.web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(updateAuthorityWallet))
    );

    transaction.add(memoIx);

    transaction.partialSign(updateAuthoritySign);

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });

    const base64 = serializedTransaction.toString("base64");

    res.status(200).json({
      transaction: base64,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export enum NFT_TYPE {
  Creator = "Creator",
  User = "User",
}

export enum NFT_NAME {
  BasicCreatorBadge = "BasicCreatorBadge",
  BronzeCreatorBadge = "BronzeCreatorBadge",
  SilverCreatorBadge = "SilverCreatorBadge",
  GoldCreatorBadge = "GoldCreatorBadge",
  BasicUserBadge = "BasicUserBadge",
  BronzeUserBadge = "BronzeUserBadge",
  SilverUserBadge = "SilverUserBadge",
  GoldUserBadge = "GoldUserBadge",
}

interface HandleUpdateNFTInput {
  name: NFT_NAME;
  type: NFT_TYPE;
}

export const handleGetAllNFTs = async (req: Request, res: Response) => {
  res.status(200).send(NFTs);
};

export const handleGetNFTData = async (req: Request, res: Response) => {
  const name = req.query.name as NFT_NAME;
  const type = req.query.type as NFT_TYPE;

  console.log("NAME", name);
  console.log("TYPE", type);

  if (name === undefined || type === undefined) {
    return res.status(400).send("Missing name or type");
  }

  const nfts: any = NFTs[type];

  if (nfts == undefined) {
    return res.status(400).send("Invalid type");
  }

  const nft = nfts[name];

  if (nft !== undefined) {
    res.status(200).send(nft);
  }
};
