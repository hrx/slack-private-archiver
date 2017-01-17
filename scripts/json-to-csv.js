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
   *    |servicename|title|titlelink|text|fromurl|timestamp|channel|
   */

   let messagesCSV = parsedMessages.reduce((accum, currMessage) => {
     if (currMessage.subtype === 'channel_join' || currMessage.subtype === 'pinned_item') return accum;

     let row = [];
     let rowString;
     if (currMessage.user)    row[0] = currMessage.user.slice(0, 10);
     // for now, replace commas and newlines with semicolons.
     if (currMessage.text)    row[1] = currMessage.text.replace(/[,\n]/g, ';');
     if (currMessage.ts)      row[2] = currMessage.ts;
     if (currMessage.purpose) row[3] = true;

     if (row.length) {
       row[4] = channel;
       rowString = row.join(',').concat('\n');
       return accum.concat(rowString);
     }
     return accum;
   }, '');



   let usersCSV = parsedMessages.reduce((accum, currMessage) => {
     if (currMessage.subtype === 'channel_join' || currMessage.subtype === 'pinned_item') return accum;

     let row = [];
     let rowString;
     if (currMessage.user)             row[0] = currMessage.user.slice(0, 10);
     if (currMessage.user.length > 10) row[1] = currMessage.user.slice(11);

     if (row.length) {
       rowString = row.join(',').concat('\n');
       return accum.concat(rowString);
     }
     return accum;
   }, '');



   let attachmentsCSV = parsedMessages.reduce((accum, currMessage) => {
     if (currMessage.subtype === 'channel_join' || currMessage.subtype === 'pinned_item') return accum;

     // messages can have multiple attachments so this one is a little different
     if (currMessage.attachments) {
       let { attachments } = currMessage;
       let currAttachments = attachments.reduce((accum, currAttachment) => {
         let attachRow = [];
         let attachRowString = '';
         // anywhere a commma or newline might appear replace with a semicolon
         if (currAttachment.service_name) attachRow[0] = currAttachment.service_name.replace(/[,\n]/g, ';');
         if (currAttachment.title)        attachRow[1] = currAttachment.title.replace(/[,\n]/g, ';');
         if (currAttachment.title_link)   attachRow[2] = currAttachment.title_link.replace(/[,\n]/g, ';');
         if (currAttachment.text)         attachRow[3] = currAttachment.text.replace(/[,\n]/g, ';');
         if (currAttachment.from_url)     attachRow[4] = currAttachment.from_url.replace(/[,\n]/g, ';');
         if (currMessage.ts)              attachRow[5] = currMessage.ts;

         if (attachRow.length) {
           attachRow[6] = channel;
           attachRowString = attachRow.join(',').concat('\n');
           return accum.concat(attachRowString).concat('\n');
         }
         return accum;
       }, '')
       return accum.concat(currAttachments);
     }
     return accum;
   }, '');



  const cleanedPath = path.replace(/[\/]/g, '-').trim();
  const outputPathSuffix = cleanedPath.concat('.csv');

  console.log(`writing messages to csv`);
  fs.writeFileSync(__dirname.concat('/messages-'.concat(outputPathSuffix)), messagesCSV, 'utf8');

  console.log(`writing users to csv`);
  fs.writeFileSync(__dirname.concat('/users-'.concat(outputPathSuffix)), usersCSV, 'utf8');

  console.log(`writing attachments to csv`);
  fs.writeFileSync(__dirname.concat('/attachments-'.concat(outputPathSuffix)), attachmentsCSV, 'utf8');

  return;
}

module.exports = cleanSlackJSON;
