#!/bin/bash -xe

# Update with optional user data that will run on instance start.
# Learn more about user-data: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html

cd /home/ec2-user
mkdir go
sudo yum update -y
sudo yum install git -y
sudo yum install gcc -y
#sudo yum install golang -y
wget https://go.dev/dl/go1.18.3.linux-arm64.tar.gz
tar -C /usr/local -zxvf go1.18.3.linux-arm64.tar.gz
export PATH=$PATH:/usr/local/go/bin
export GOPATH=/home/ec2-user/go
export GOCACHE=/home/ec2-user/.cache/go-build
go version


git clone https://github.com/wrinkledeth/penrose_takehome.git
cd penrose_takehome
go get -d -v ./...
go run main.go

