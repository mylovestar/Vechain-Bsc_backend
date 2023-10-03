export const waitForReceipt = async (app, txResult) => {
  console.log('debug tx', txResult)
  const tx = await app.connex.thor.transaction(txResult.txid)
  const ticker = app.connex.thor.ticker()
  await ticker.next();
  const txData = await tx.getReceipt()
  alert("transaction successful, txid:" + txData.meta.txID)
  if (txData.outputs[0].contractAddress) {
    alert("contract is live at " + txData.outputs[0].contractAddress)
  }
}