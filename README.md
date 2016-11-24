# slack-private-archiver
Store and search Slack messages in private data store

## Requesting access
- Access to the AWS console is controlled via IAM accounts. If you want access, Slack @andybrownhr45
- Access to the development EC2 instance is controlled with SSH keys and Unix user accounts
  - Generate a keypair (locally or via the AWS console) and Slack the public key to @andybrownhr45. I'll ping you when it's added.
  - Connect to the instance with `ssh -i "[pathToPrivateKey]" [unixUserName]@ec2-52-9-62-85.us-west-1.compute.amazonaws.com`
  - Your username is most likely either your IAM username, or the first letter of your first name, followed by your lastname. e.g. `abrown`


## Postgres
- You can access postgres from your local machine or when ssh'd.
  - ssh: `su postgres` then `psql` then `\c slack`.  Now you are connected to our project's database.
  - local: *TODO*

## Elasticsearch
- It's installed but not configured. Have at it.  Remember this is a micro instance
