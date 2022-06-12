const { getWeth } = require("../scripts/getWeth");

async function main() {
  // protocol treats everything like erc20 token
  // ETH (native token) isnt erc20
  // eth gets swapped for WETH

  await getWeth();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
