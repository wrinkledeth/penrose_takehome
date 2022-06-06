# EC2 Instance Creation with CDK
Adapted From: 
https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/ec2-instance

This AWS CDK (Cloud Development Kit) Project will create:

- A new VPC
- Two public subnets
- A security group
- An EC2 instance in one of the subnets

The `/src/config.sh` file is used to install depencendies, pull down the REST API code, and start the  verification service.
```bash
#!/bin/bash -xe

cd /home/ec2-user
mkdir go

# Install OS Dependencies
sudo yum update -y
sudo yum install git -y
sudo yum install gcc -y

# Install Golang
wget https://go.dev/dl/go1.18.3.linux-arm64.tar.gz
tar -C /usr/local -zxvf go1.18.3.linux-arm64.tar.gz
export PATH=$PATH:/usr/local/go/bin
export GOPATH=/home/ec2-user/go
export GOCACHE=/home/ec2-user/.cache/go-build
go version

# Clone Repo
git clone https://github.com/wrinkledeth/penrose_takehome.git
cd penrose_takehome
go get -d -v ./... # Install Go modules
go run main.go # Start HTTP Service

```

## NOTE
An ssh keypair is needed if you want to ssh into the ec2 instance after creation.

Please edit line 25 of `lib/ec2-cdk-stacks.ts` and insert your public key
```ts
    const key = new KeyPair(this, 'Test-Key-Pair', {
      name: 'imported-key-pair',
      publicKey: 'ssh-ed25519 XXXXXXXXXXXXXX'
    });
```


## To Deploy

Ensure aws-cdk is installed and [bootstrapped](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html).



```bash
$ npm install -g aws-cdk
$ cdk bootstrap
```

Then build and deploy.

```bash
$ npm run build
$ cdk deploy
```

## Sample Output
```bash
cdk deploy 

...

✅  Ec2CdkStack
✨  Deployment time: 182.49s

Outputs:
Ec2CdkStack.IPAddress = 54.91.30.24
Ec2CdkStack.KeyName = imported-key-pair
Ec2CdkStack.RESTAPIClientCommand = go run client.go -url=http://54.91.30.24:1323
Ec2CdkStack.sshcommand = ssh ec2-user@54.91.30.24
```


```bash
go run client.go -url=http://54.91.30.24:1323
GET /get_message: {"message":"IA55QZmo4VsZKzrcXYhHMHNA9JNtpApW"}
POST /verify: {"verified":"true"}
```

## To Destroy

```bash
# Destroy all project resources.
$ cdk destroy
```

