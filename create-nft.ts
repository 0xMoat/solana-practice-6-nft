import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

// --------------------------RPC URL----------------------------------
const rpcUrl = "https://young-neat-log.solana-devnet.quiknode.pro/XXX/";
const connection = new Connection(rpcUrl);

// --------------------------Auth User Keypair----------------------------------
const user = await getKeypairFromFile();

// --------------------------Air Drop TestNet SOL----------------------------------
// await airdropIfRequired(
//   connection,
//   user.publicKey,
//   1 * LAMPORTS_PER_SOL,
//   0.5 * LAMPORTS_PER_SOL
// );

console.log("Loaded user", user.publicKey.toBase58());

// --------------------------Umi Instance----------------------------------
const umi = createUmi(rpcUrl);
umi.use(mplTokenMetadata());

// --------------------------Umi Instance for User----------------------------------
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("set up umi instance for user");

// --------------------------Collection Mint----------------------------------
const nftMint = generateSigner(umi);
// --------------------------Create NFT----------------------------------
console.log(`Creating NFT...`);
const collectionAddress = publicKey(
  "66EsW2H1AiyJ3FkqX4wAwYUNdqguCwMk5UWncLhnhPAN"
);

const transaction = await createNft(umi, {
  mint: nftMint,
  name: "Wolf Morty",
  uri: "https://raw.githubusercontent.com/0xMoat/Test-Raw-Files/refs/heads/main/wolf-morty.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    verified: false,
  },
});

// Specify the confirmation options, setting commitment to 'finalized'
const confirmOptions = {
  confirm: { commitment: "finalized" as const }, // Use 'finalized' commitment
};

console.log("Sending transaction and waiting for finalization...");
const result = await transaction.sendAndConfirm(umi, confirmOptions);
console.log("Transaction finalized. Signature:", result.signature);

const createdNft = await fetchDigitalAsset(umi, nftMint.publicKey);

console.log(
  `🖼️ Created 1 NFT! the address is:\n`,
  getExplorerLink("address", createdNft.mint.publicKey, "devnet")
);
