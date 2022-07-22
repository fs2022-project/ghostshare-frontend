import contracts from "../../metadata/deployed_contracts.json";

let exampleDataStructure = [
  [
    // Array of fileOwnerTransactions
    // Events of type `FileRegistered` from user/fileOwner
    // Events of type `AccessGranted` from user/fileOwner
    {
      fileId: "fileId",
      fileOwner: "address",
      recipients: [
        { recipient: "address", timeGranted: "block_signed_at" },
        { recipient: "address", timeGranted: "block_signed_at" },
      ],
    },
    {},
  ],
  [
    // Array of recipientTransactions
    // Events of type `AccessGranted` to user/recipient
    {
      fileId: "fileId",
      fileOwner: "address",
      recipient: "address",
    },
  ],
];

const filterTransactions = (txs, userAddress) => {
  let fileOwnerTransactions = [];
  let recipientTransactions = [];

  let userAddressLong = "0x000000000000000000000000" + userAddress.slice(2, 42);
  userAddressLong = userAddressLong.toUpperCase();

  let contractAddress = contracts.FileRegistry.toUpperCase();

  txs.forEach((item, index) => {
    item?.log_events.forEach((event, index2) => {
      if (
        event?.sender_address.toUpperCase() == contractAddress &&
        event?.raw_log_topics[1].toUpperCase() == userAddressLong // user is fileOwner
      ) {
        event?.raw_log_topics.length === 2
          ? fileOwnerTransactions.push({
              fileId: event?.raw_log_data,
              fileOwner: userAddress,
              recipients: [],
            })
          : fileOwnerTransactions.forEach((entry) => {
              if (entry.fileId == event?.raw_log_data) {
                entry.recipients.push({
                  recipient: "0x" + event?.raw_log_topics[2].slice(26, 66),
                  timeGranted: event?.block_signed_at,
                });
              }
            });
      } else if (
        event?.sender_address.toUpperCase() == contractAddress &&
        event?.raw_log_topics[2].toUpperCase() == userAddressLong // user is recipient
      ) {
        recipientTransactions.push({
          fileId: event?.raw_log_data,
          fileOwner: "0x" + event?.raw_log_topics[1].slice(26, 66),
          recipient: userAddress,
        });
      }
    });
  });
  const result = {
    fileOwnerTransactions: fileOwnerTransactions,
    recipientTransactions: recipientTransactions,
  };

  return result;
};

export default filterTransactions;
