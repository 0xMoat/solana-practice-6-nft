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
} from "@metaplex-foundation/umi";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const rpcUrl = "https://young-neat-log.solana-devnet.quiknode.pro/XXX/";
const connection = new Connection(rpcUrl);

const user = await getKeypairFromFile();

// await airdropIfRequired(
//   connection,
//   user.publicKey,
//   1 * LAMPORTS_PER_SOL,
//   0.5 * LAMPORTS_PER_SOL
// );

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(rpcUrl);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("set up umi instance for user");

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "MortyVerse",
  symbol: "MORTY",
  uri: "https://raw.githubusercontent.com/0xMoat/Test-Raw-Files/refs/heads/main/mortyverse.json",
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
});

await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
);

console.log(
  "Created collection NFT 📦! the address is ",
  getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")
);
