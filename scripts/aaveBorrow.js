const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");

async function main() {
  // protocol treats everything like erc20 token
  // ETH (native token) isnt erc20
  // eth gets swapped for WETH

  await getWeth();

  const { deployer } = await getNamedAccounts();
  // aave protocol - need abi and addr https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts

  // lending pool address provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
  // lending pool: get from ^
  // const lendingPoolAddressProvider = await ethers.getContractAt("", "", account);
  // const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();

  // GET AAVE LENDING POOL
  const lendingPool = await getLendingPool(deployer);
  console.log(`LendingPool address ${lendingPool.address}`);

  // depoist!
  // first we need to approve, get webtoken addr
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  // APPROVE IS NEEDED!
  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
  console.log("Depositing...");
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
  console.log("Depoisted");
  // ------------------- END OF DEPOIST --------------------
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );
  // what is coversion rate on dai
  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
  console.log(`You can borrow ${amountDaiToBorrow} DAI`);
  const amountDaiToBorrowWei = ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );
  // Borrow
  // how much we have borrowed
}

async function getDaiPrice() {
  // dont need signer if just reading and not signing anything to send
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  // returns first index of
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH price is ${price.toString()} tokens`);
  return price;
}

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
  return { availableBorrowsETH, totalDebtETH };
}

// spendingaddress - address to approve
async function approveErc20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  );
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Approved!");
}

async function getLendingPool(account) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );
  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
