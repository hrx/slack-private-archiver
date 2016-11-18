 /*
  *  One JSON file from Slack export in, 3 csv files out
  *  We ignore parts of the data people are unlikely to care about in order
  *  to save space: channel join messages, reactions, edit messages,
  *  pinned items, certain attachment metadata
  *
  *  Can be run from the command line but probably smarter to invoke from
  *  another file that iterates over subdirectories
  */
const fs = require('fs');
cleanSlackJSON(process.argv[2], process.argv[3]);





function cleanSlackJSON(path, channel) {
  if (arguments.length !== 2) {
    console.error("Usage: cleanSlackJSON(file, channel)");
    return;
  }

  const messages = fs.readFileSync(path, 'utf8');
  const parsedMessages = JSON.parse(messages);

  let messagesCSV = '';
  let usersCSV = '';
  let attachmentsCSV = '';

  /*    Format of cleaned data:
   *
   *    Messages
   *    |user|text|timestamp|purpose|channel|
   *
   *
   *    Users
   *    |usercode|username|
   *
   *
   *    Attachments
   *    |servicename|title|titlelink|text|fromurl|
   */

  parsedMessages.forEach((message) => {
    if (message.subtype === 'channel_join' || message.subtype === 'pinned_item') return;

    let messagesRow    = [];
    let usersRow       = [];
    let attachmentsRow = [];
    let attachment;
    if (message.user) {
      messagesRow[0]                            = message.user.slice(0,10);
      usersRow[0]                               = message.user.slice(0,10);
      if (message.user.length > 10) usersRow[1] = message.user.slice(11);
    }
    if (message.text)      messagesRow[1] = message.text;
    if (message.ts)        messagesRow[2] = message.ts;
    if (message.purpose)   messagesRow[3] = true;
    if (message.attachments) {
      message.attachments.forEach((attachment) => {
        if (attachment.service_name) attachmentsRow[0] = attachment.service_name;
        if (attachment.title)        attachmentsRow[1] = attachment.title;
        if (attachment.title_link)   attachmentsRow[2] = attachment.title_link;
        if (attachment.text)         attachmentsRow[3] = attachment.text;
        if (attachment.from_url)     attachmentsRow[4] = attachment.from_url;
      });
    }

    if (messagesRow.length) {
      messagesRow[4] = channel;
      messagesCSV += messagesRow.join(',').concat('\n');
    }
    if (usersRow.length) {
      usersCSV += usersRow.join(',').concat('\n');
    }
    if (attachmentsRow.length) {
      attachmentsRow[5] = channel;
      attachmentsCSV += attachmentsRow.join(',').concat('\n');
    }
  });

  const cleanedPath = path.replace(/[\/]/g, '-').trim();
  const outputPathSuffix = cleanedPath.concat('.csv');

  console.log(`writing messages to csv: ${__dirname.concat('/messages-'.concat(outputPathSuffix))}`);
  fs.writeFileSync(__dirname.concat('/messages-'.concat(outputPathSuffix)), messagesCSV, 'utf8');

  console.log(`writing users to csv: ${__dirname.concat('/users-'.concat(outputPathSuffix))}`);
  fs.writeFileSync(__dirname.concat('/users-'.concat(outputPathSuffix)), messagesCSV, 'utf8');

  console.log(`writing attachments to csv: ${__dirname.concat('/attachments-'.concat(outputPathSuffix))}`);
  fs.writeFileSync(__dirname.concat('/attachments-'.concat(outputPathSuffix)), messagesCSV, 'utf8');

  return;
}

module.exports = cleanSlackJSON;
