"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ec2CdkStack = void 0;
const ec2 = require("aws-cdk-lib/aws-ec2");
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const path = require("path");
// import { KeyPair } from 'cdk-ec2-key-pair';
const aws_s3_assets_1 = require("aws-cdk-lib/aws-s3-assets");
const cdk_ec2_key_pair_1 = require("cdk-ec2-key-pair");
class Ec2CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create a Key Pair to be used with this EC2 Instance
        // Temporarily disabled since `cdk-ec2-key-pair` is not yet CDK v2 compatible
        // const key = new KeyPair(this, 'KeyPair', {
        //   name: 'cdk-keypair',
        //   description: 'Key Pair created with CDK Deployment',
        // });
        // key.grantReadOnPublicKey
        // Put your public key here, so that you can SSH to the EC2 Instance
        const key = new cdk_ec2_key_pair_1.KeyPair(this, 'Test-Key-Pair', {
            name: 'imported-key-pair',
            publicKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGGAFmZQauDpj8VlIL/g122WTINQj7PZhYEer9kaY2bP'
        });
        // Create new VPC with 2 Subnets
        const vpc = new ec2.Vpc(this, 'VPC', {
            natGateways: 0,
            subnetConfiguration: [{
                    cidrMask: 24,
                    name: "asterisk",
                    subnetType: ec2.SubnetType.PUBLIC
                }]
        });
        // Allow SSH (TCP Port 22) access from anywhere
        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'Allow SSH (TCP port 22) in',
            allowAllOutbound: true
        });
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH Access');
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(1323), 'Allow access to Echo REST API');
        const role = new iam.Role(this, 'ec2Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        });
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        // Use Latest Amazon Linux Image - CPU Type ARM64
        const ami = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            cpuType: ec2.AmazonLinuxCpuType.ARM_64
        });
        // Create the instance using the Security Group, AMI, and KeyPair defined in the VPC created
        const ec2Instance = new ec2.Instance(this, 'Instance', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
            machineImage: ami,
            securityGroup: securityGroup,
            keyName: key.keyPairName,
            role: role
        });
        // Create an asset that will be used as part of User Data to run on first load
        const asset = new aws_s3_assets_1.Asset(this, 'Asset', { path: path.join(__dirname, '../src/config.sh') });
        const localPath = ec2Instance.userData.addS3DownloadCommand({
            bucket: asset.bucket,
            bucketKey: asset.s3ObjectKey,
        });
        ec2Instance.userData.addExecuteFileCommand({
            filePath: localPath,
            arguments: '--verbose -y'
        });
        asset.grantRead(ec2Instance.role);
        // -- Run User Script to install and run REST API app.--
        // Create outputs for connecting
        new cdk.CfnOutput(this, 'IP Address', { value: ec2Instance.instancePublicIp });
        new cdk.CfnOutput(this, 'Key Name', { value: key.keyPairName });
        // new cdk.CfnOutput(this, 'Download Key Command', { value: 'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem' })
        new cdk.CfnOutput(this, 'ssh command', { value: 'ssh ec2-user@' + ec2Instance.instancePublicIp });
        new cdk.CfnOutput(this, 'REST API Client Command', { value: 'go run client.go -url=http://' + ec2Instance.instancePublicIp + ":1323" });
    }
}
exports.Ec2CdkStack = Ec2CdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVjMi1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTJDO0FBQzNDLG1DQUFtQztBQUNuQywyQ0FBMEM7QUFDMUMsNkJBQTZCO0FBQzdCLDhDQUE4QztBQUM5Qyw2REFBa0Q7QUFFbEQsdURBQTJDO0FBRTNDLE1BQWEsV0FBWSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3hDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0RBQXNEO1FBQ3RELDZFQUE2RTtRQUM3RSw2Q0FBNkM7UUFDN0MseUJBQXlCO1FBQ3pCLHlEQUF5RDtRQUN6RCxNQUFNO1FBQ04sMkJBQTJCO1FBRTNCLG9FQUFvRTtRQUNwRSxNQUFNLEdBQUcsR0FBRyxJQUFJLDBCQUFPLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUM3QyxJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLFNBQVMsRUFBRSxrRkFBa0Y7U0FDOUYsQ0FBQyxDQUFDO1FBRUgsZ0NBQWdDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ25DLFdBQVcsRUFBRSxDQUFDO1lBQ2QsbUJBQW1CLEVBQUUsQ0FBQztvQkFDcEIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07aUJBQ2xDLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDakUsR0FBRztZQUNILFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsZ0JB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VyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDekksQ0FBQztDQUNGO0FBakZELGtDQWlGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGVjMiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJ1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbi8vIGltcG9ydCB7IEtleVBhaXIgfSBmcm9tICdjZGstZWMyLWtleS1wYWlyJztcbmltcG9ydCB7IEFzc2V0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWFzc2V0cyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IEtleVBhaXIgfSBmcm9tICdjZGstZWMyLWtleS1wYWlyJztcblxuZXhwb3J0IGNsYXNzIEVjMkNka1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgS2V5IFBhaXIgdG8gYmUgdXNlZCB3aXRoIHRoaXMgRUMyIEluc3RhbmNlXG4gICAgLy8gVGVtcG9yYXJpbHkgZGlzYWJsZWQgc2luY2UgYGNkay1lYzIta2V5LXBhaXJgIGlzIG5vdCB5ZXQgQ0RLIHYyIGNvbXBhdGlibGVcbiAgICAvLyBjb25zdCBrZXkgPSBuZXcgS2V5UGFpcih0aGlzLCAnS2V5UGFpcicsIHtcbiAgICAvLyAgIG5hbWU6ICdjZGsta2V5cGFpcicsXG4gICAgLy8gICBkZXNjcmlwdGlvbjogJ0tleSBQYWlyIGNyZWF0ZWQgd2l0aCBDREsgRGVwbG95bWVudCcsXG4gICAgLy8gfSk7XG4gICAgLy8ga2V5LmdyYW50UmVhZE9uUHVibGljS2V5XG5cbiAgICAvLyBQdXQgeW91ciBwdWJsaWMga2V5IGhlcmUsIHNvIHRoYXQgeW91IGNhbiBTU0ggdG8gdGhlIEVDMiBJbnN0YW5jZVxuICAgIGNvbnN0IGtleSA9IG5ldyBLZXlQYWlyKHRoaXMsICdUZXN0LUtleS1QYWlyJywge1xuICAgICAgbmFtZTogJ2ltcG9ydGVkLWtleS1wYWlyJyxcbiAgICAgIHB1YmxpY0tleTogJ3NzaC1lZDI1NTE5IEFBQUFDM056YUMxbFpESTFOVEU1QUFBQUlHR0FGbVpRYXVEcGo4VmxJTC9nMTIyV1RJTlFqN1BaaFlFZXI5a2FZMmJQJ1xuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIG5ldyBWUEMgd2l0aCAyIFN1Ym5ldHNcbiAgICBjb25zdCB2cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCAnVlBDJywge1xuICAgICAgbmF0R2F0ZXdheXM6IDAsXG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbe1xuICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgIG5hbWU6IFwiYXN0ZXJpc2tcIixcbiAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDXG4gICAgICB9XVxuICAgIH0pO1xuXG4gICAgLy8gQWxsb3cgU1NIIChUQ1AgUG9ydCAyMikgYWNjZXNzIGZyb20gYW55d2hlcmVcbiAgICBjb25zdCBzZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdTZWN1cml0eUdyb3VwJywge1xuICAgICAgdnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdBbGxvdyBTU0ggKFRDUCBwb3J0IDIyKSBpbicsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlXG4gICAgfSk7XG4gICAgc2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShlYzIuUGVlci5hbnlJcHY0KCksIGVjMi5Qb3J0LnRjcCgyMiksICdBbGxvdyBTU0ggQWNjZXNzJylcbiAgICBzZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKGVjMi5QZWVyLmFueUlwdjQoKSwgZWMyLlBvcnQudGNwKDEzMjMpLCAnQWxsb3cgYWNjZXNzIHRvIEVjaG8gUkVTVCBBUEknKVxuXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnZWMyUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlYzIuYW1hem9uYXdzLmNvbScpXG4gICAgfSlcblxuICAgIHJvbGUuYWRkTWFuYWdlZFBvbGljeShpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblNTTU1hbmFnZWRJbnN0YW5jZUNvcmUnKSlcblxuICAgIC8vIFVzZSBMYXRlc3QgQW1hem9uIExpbnV4IEltYWdlIC0gQ1BVIFR5cGUgQVJNNjRcbiAgICBjb25zdCBhbWkgPSBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgICAgZ2VuZXJhdGlvbjogZWMyLkFtYXpvbkxpbnV4R2VuZXJhdGlvbi5BTUFaT05fTElOVVhfMixcbiAgICAgIGNwdVR5cGU6IGVjMi5BbWF6b25MaW51eENwdVR5cGUuQVJNXzY0XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGluc3RhbmNlIHVzaW5nIHRoZSBTZWN1cml0eSBHcm91cCwgQU1JLCBhbmQgS2V5UGFpciBkZWZpbmVkIGluIHRoZSBWUEMgY3JlYXRlZFxuICAgIGNvbnN0IGVjMkluc3RhbmNlID0gbmV3IGVjMi5JbnN0YW5jZSh0aGlzLCAnSW5zdGFuY2UnLCB7XG4gICAgICB2cGMsXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoZWMyLkluc3RhbmNlQ2xhc3MuVDRHLCBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPKSxcbiAgICAgIG1hY2hpbmVJbWFnZTogYW1pLFxuICAgICAgc2VjdXJpdHlHcm91cDogc2VjdXJpdHlHcm91cCxcbiAgICAgIGtleU5hbWU6IGtleS5rZXlQYWlyTmFtZSxcbiAgICAgIHJvbGU6IHJvbGVcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhbiBhc3NldCB0aGF0IHdpbGwgYmUgdXNlZCBhcyBwYXJ0IG9mIFVzZXIgRGF0YSB0byBydW4gb24gZmlyc3QgbG9hZFxuICAgIGNvbnN0IGFzc2V0ID0gbmV3IEFzc2V0KHRoaXMsICdBc3NldCcsIHsgcGF0aDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3NyYy9jb25maWcuc2gnKSB9KTtcbiAgICBjb25zdCBsb2NhbFBhdGggPSBlYzJJbnN0YW5jZS51c2VyRGF0YS5hZGRTM0Rvd25sb2FkQ29tbWFuZCh7XG4gICAgICBidWNrZXQ6IGFzc2V0LmJ1Y2tldCxcbiAgICAgIGJ1Y2tldEtleTogYXNzZXQuczNPYmplY3RLZXksXG4gICAgfSk7XG5cbiAgICBlYzJJbnN0YW5jZS51c2VyRGF0YS5hZGRFeGVjdXRlRmlsZUNvbW1hbmQoe1xuICAgICAgZmlsZVBhdGg6IGxvY2FsUGF0aCxcbiAgICAgIGFyZ3VtZW50czogJy0tdmVyYm9zZSAteSdcbiAgICB9KTtcbiAgICBhc3NldC5ncmFudFJlYWQoZWMySW5zdGFuY2Uucm9sZSk7XG5cbiAgICAvLyAtLSBSdW4gVXNlciBTY3JpcHQgdG8gaW5zdGFsbCBhbmQgcnVuIFJFU1QgQVBJIGFwcC4tLVxuXG4gICAgLy8gQ3JlYXRlIG91dHB1dHMgZm9yIGNvbm5lY3RpbmdcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSVAgQWRkcmVzcycsIHsgdmFsdWU6IGVjMkluc3RhbmNlLmluc3RhbmNlUHVibGljSXAgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0tleSBOYW1lJywgeyB2YWx1ZToga2V5LmtleVBhaXJOYW1lIH0pXG4gICAgLy8gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Rvd25sb2FkIEtleSBDb21tYW5kJywgeyB2YWx1ZTogJ2F3cyBzZWNyZXRzbWFuYWdlciBnZXQtc2VjcmV0LXZhbHVlIC0tc2VjcmV0LWlkIGVjMi1zc2gta2V5L2Nkay1rZXlwYWlyL3ByaXZhdGUgLS1xdWVyeSBTZWNyZXRTdHJpbmcgLS1vdXRwdXQgdGV4dCA+IGNkay1rZXkucGVtICYmIGNobW9kIDQwMCBjZGsta2V5LnBlbScgfSlcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnc3NoIGNvbW1hbmQnLCB7IHZhbHVlOiAnc3NoIGVjMi11c2VyQCcgKyBlYzJJbnN0YW5jZS5pbnN0YW5jZVB1YmxpY0lwIH0pXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1JFU1QgQVBJIENsaWVudCBDb21tYW5kJywgeyB2YWx1ZTogJ2dvIHJ1biBjbGllbnQuZ28gLXVybD1odHRwOi8vJyArIGVjMkluc3RhbmNlLmluc3RhbmNlUHVibGljSXAgKyBcIjoxMzIzXCIgfSlcbiAgfVxufVxuIl19