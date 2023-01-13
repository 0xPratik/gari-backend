import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const GARI_WALLET_SECRET_KEY = new Uint8Array([
    17, 111, 140, 198, 88, 112, 146, 138, 1, 45, 78, 216, 135, 89, 201, 165,
    216, 242, 229, 135, 246, 194, 56, 83, 89, 36, 84, 167, 223, 147, 49, 32,
    108, 2, 14, 15, 206, 194, 129, 216, 172, 184, 92, 223, 19, 133, 168, 219,
    12, 228, 144, 207, 208, 58, 166, 198, 88, 249, 110, 205, 30, 14, 107, 58,
  ]);
  const alice = Keypair.fromSecretKey(GARI_WALLET_SECRET_KEY);

  console.log("Minter PubKey", alice.publicKey.toString());

  const GARI_WALLET_SECRET_KEY_MINT = new Uint8Array([
    45, 127, 220, 175, 138, 166, 34, 91, 25, 11, 84, 33, 80, 163, 7, 128, 85,
    197, 75, 11, 25, 181, 109, 3, 184, 218, 78, 17, 140, 205, 211, 102, 130, 23,
    2, 115, 15, 102, 207, 51, 54, 138, 233, 194, 155, 161, 77, 54, 195, 187, 16,
    208, 233, 35, 240, 242, 20, 166, 18, 66, 234, 83, 16, 107,
  ]);
  const gari = Keypair.fromSecretKey(GARI_WALLET_SECRET_KEY_MINT);

  console.log("Fee Payer Pubkey", gari.publicKey.toString());

  //   {
  //     "account":"CkNrP4YYe5FiSUKrr8s7fgBHTYhMFShzi4rji3q623Kw"
  // }

  //   const encodedTransactionsNew = await axios.post(
  //     "http://localhost:5000/api/nft/update",
  //     {
  //       userPublicKey: alice.publicKey.toString(),
  //       badge: "BasicUserBadge",
  //       type: "User",
  //       mint: "DeQweZKs74LExC4W5aZUENFpC5UxPmBMWfg3D5DZX44K",
  //     }
  //   );

  const getEncodedTx = async (badge, type) => {
    try {
      const encodedTransactionsNew = await axios.post(
        "http://localhost:5000/api/nft/create",
        {
          userPublicKey: alice.publicKey.toString(),
          badge: badge,
          type: type,
          feePayer: "9kpML3MhVLPmASMDBYuaMzmFiCtdm3aityWu1pJZ1wR4",
        }
      );

      let newEncodedBuffer = Buffer.from(
        encodedTransactionsNew.data.transaction,
        "base64"
      );

      const transaction = Transaction.from(newEncodedBuffer);

      transaction.partialSign(alice);
      transaction.partialSign(gari);

      let endocdeTransction1 = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      return endocdeTransction1;
    } catch (error) {
      console.log("Error", error);
    }
  };

  let no_of_badges = 200;

  for (let i = 0; i < no_of_badges; i++) {
    console.log(`Minting Item ${i}`);
    const signedTx = await getEncodedTx("BasicUserBadge", "User");
    // const signedTx = getEncodedTx("BasicCreatorBadge", "Creator");
    const sig = await connection.sendRawTransaction(signedTx);
    await connection.confirmTransaction(sig, "confirmed");
    console.log("Signature", sig);
  }

  //   var signature = await connection.sendRawTransaction(endocdeTransction1);
  //   await connection.confirmTransaction(signature, "finalized");
  //   console.log(signature);
})();
