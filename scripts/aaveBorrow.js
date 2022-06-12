const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth } = require("../scripts/getWeth");

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
  const lendingPool = await getLendingPool(deployer);
  console.log(`LendingPool address ${lendingPool.address}`);
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
