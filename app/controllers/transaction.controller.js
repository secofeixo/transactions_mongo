// controller to tranlate text into pig latin

const logger = require('./log.controller.js'),
	ctrlUser = require('./user.controller.js')
  User = require('../models/user'),
  Transaction = require('../models/transaction');

function setTransactionState(objTransaction, state) {
	return new Promise(async (resolve, reject) => {
		objTransaction.state = state;
		try {
			const newTransactionObj = await objTransaction.save();
			resolve(newTransactionObj);
		} catch (err) {
			logger.debug(`transaction.controller. setTransactionState. Error setting transaction to ${state}: ${err}`);
			objTransaction.state = 'canceled';
			try {
				const newTransactionObj = await transactionObj.save();
			} catch (err2) {
				reject(`Error setting transaction to canceled: ${err2}`);
				return;
			}
			reject(`Error setting transaction to ${state}: ${err}`);
		}
	})
}

async function transfer(req, res) {
	const sUserSource = req.params.id;
	const sUserDestination = req.params.user;
	const iAmount = req.params.amount;
	logger.info(`transaction.controller. transfer. From ${sUserSource} To ${sUserDestination}. Amount: ${iAmount}`);

	if (sUserSource === sUserDestination) {
		logger.debug(`transaction.controller. transfer. Same user destination as source ${sUserDestination}`);
		res.status(400).json({msg: 'can not make transfers to the same user'});
		return;
	}

	let userSource;

	// check that the user source exists
	try {
		userSource = await ctrlUser.getUser(sUserSource);
	} catch (err) {
		logger.debug(`transaction.controller. transfer. Error reading user source ${err}`);
		res.status(404).json({msg: `Source ${err.msg}`});
		return;
	}

	let userDestination;
	// check that the user destination exists
	try {
		userDestination = await ctrlUser.getUser(sUserDestination);
	} catch (err) {
		logger.debug(`transaction.controller. transfer. Error reading user source ${err}`);
		res.status(404).json({msg: `Destination ${err.msg}`});
		return;
	}

	// create the transaction object in the databae with the state pending
	const newTransactionData = {
		source: sUserSource,
		destination: sUserDestination,
		amount: iAmount,
	}

	let transactionObj;
	var newTransaction = new Transaction(newTransactionData);
	try {
		transactionObj = await newTransaction.save();
	} catch (err) {
		logger.debug(`transaction.controller. transfer. Error saving transaction: ${err}`);
		res.status(500).json({msg: 'internal error saving transaction'});
		return;
	}

	let transactionObjPending;
	try {
		transactionObjPending = await setTransactionState(transactionObj, 'pending');
	} catch (err) {
		res.status(500).json({msg: `internal error setting transaction to pending ${err}`});
		return
	}

	// update balance of source user
	let dataUpdateSource;
	try {
		dataUpdateSource = await User.update({_id: transactionObjPending.source, pendingTransactions: {$ne: transactionObjPending._id}},
																				 {$inc: {balance: -transactionObjPending.amount, $push: {pendingTransactions: transactionObjPending._id}}})
	} catch (err) {
		// cancel transaction
		transactionObjPending = await setTransactionState(transactionObj, 'canceled');
		logger.debug(`transaction.controller. transfer. Error updating source balance: ${err}`);
		res.status(500).json({msg: 'internal error updating source balance'});
		return;
	}
	logger.debug(`transaction.controller. transfer. Data update source: ${JSON.stringify(dataUpdateSource)}`);

	// update balance of destination user
	let dataUpdateDestination;
	try {
		dataUpdateDestination = await User.update({_id: transactionObjPending.destination, pendingTransactions: {$ne: transactionObjPending._id}},
																				 			{$inc: {balance: transactionObjPending.amount, $push: {pendingTransactions: transactionObjPending._id}}})
	} catch (err) {
		logger.debug(`transaction.controller. transfer. Error updating source balance: ${err}`);
		// reverse source balance
		dataUpdateDestination = await User.update({_id: transactionObjPending.source, pendingTransactions: {$ne: transactionObjPending._id}},
																				 			{$inc: {balance: transactionObjPending.amount, $pull: {pendingTransactions: transactionObjPending._id}}})
		// cancel transaction
		transactionObjPending = await setTransactionState(transactionObj, 'canceled');
		res.status(500).json({msg: 'internal error updating source balance'});
		return;
	}
	logger.debug(`transaction.controller. transfer. Data update destination: ${JSON.stringify(dataUpdateDestination)}`);

	// set transaction to committed
	try {
		transactionObjCommited = await setTransactionState(transactionObjPending, 'committed');
	} catch (err) {
		logger.debug(`transaction.controller. transfer. Error updating source balance: ${err}`);
		// reverse source balance
		dataUpdateSource = await User.update({_id: transactionObjPending.source, pendingTransactions: {$ne: transactionObjPending._id}},
																				 {$inc: {balance: transactionObjPending.amount, $pull: {pendingTransactions: transactionObjPending._id}}})
		dataUpdateDestination = await User.update({_id: transactionObjPending.destination, pendingTransactions: {$ne: transactionObjPending._id}},
																				 {$inc: {balance: -transactionObjPending.amount, $pull: {pendingTransactions: transactionObjPending._id}}})
		// cancel transaction
		transactionObjCommited = await setTransactionState(transactionObjPending, 'canceled');
		res.status(500).json({msg: 'internal error updating source balance', transaction: transactionObjCommited});
		return
	}

	// remove transaction from pending transaction list of the source user
	try {
		dataUpdateSource = await User.update({_id: transactionObjCommited.source},
																				 {$pull: {pendingTransactions: transactionObjCommited._id}});
	} catch (err) {		
		logger.debug(`transaction.controller. transfer. Error updating source balance: ${err}`);
		res.status(500).json({msg: 'internal error updating source balance', transaction: transactionObjCommited});
		return;
	}

	// remove transaction from pending transaction list of the destination user
	try {
		dataUpdateDestination = await User.update({_id: transactionObjCommited.destination},
																						  {$pull: {pendingTransactions: transactionObjCommited._id}});
	} catch (err) {
		logger.debug(`transaction.controller. transfer. Error updating destination balance: ${err}`);
		res.status(500).json({msg: 'internal error updating destination balance', transaction: transactionObjCommited});
		return;
	}
	
	// set state done to the transaction
	const transactionObjDone = await setTransactionState(transactionObjCommited, 'done');

  res.status(200).json(transactionObjDone);
}

module.exports = {
  transfer,
};
